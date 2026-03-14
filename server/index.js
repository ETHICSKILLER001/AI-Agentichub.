import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import Stripe from "stripe";
import { getAgentResponse } from "./agentKnowledge.js";
import { authMiddleware, login, register, verifyToken } from "./auth.js";
import { User, Agent, Purchase, ChatHistory, StripeCustomer } from "./models.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const USE_LOCAL_AI = process.env.USE_LOCAL_AI === "true" || !OPENAI_KEY;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { apiVersion: "2022-11-15" }) : null;

app.use(cors());
app.use(express.json());
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/agentichub";

mongoose.connect(MONGO_URI).then(async () => {
  console.log("MongoDB connected");
  const exists = await Agent.countDocuments();
  if (exists === 0) {
    await Agent.create({
      name: "Core AI Assistant",
      category: "General",
      price: 0,
      description: "A powerful AI assistant powered by OpenAI (or Gemini) for general tasks.",
      systemPrompt: "You are a helpful, accurate AI assistant. Keep answers concise and friendly.",
      provider: "openai",
      model: "gpt-4o-mini",
      isPublic: true,
    });
    console.log("Seeded default agent.");
  }
}).catch(err => {
  console.warn("MongoDB connection failure:", err.message);
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "User already exists" });

  try {
    const result = await register(email, password, name);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const result = await login(email, password);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("email name");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/agents", async (req, res) => {
  const agents = await Agent.find({}).lean();
  res.json({ agents });
});

app.get("/api/agents/:id", async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  res.json({ agent });
});

app.post("/api/agents", authMiddleware, async (req, res) => {
  const { name, category, price, description, systemPrompt, provider = "openai", model = "gpt-4o-mini" } = req.body;
  if (!name || !category || !description || !systemPrompt) {
    return res.status(400).json({ error: "name, category, description, systemPrompt are required" });
  }
  const agent = new Agent({ name, category, price, description, systemPrompt, provider, model, createdBy: req.userId });
  await agent.save();
  res.status(201).json({ agent });
});

app.get("/api/purchases", authMiddleware, async (req, res) => {
  const purchases = await Purchase.find({ userId: req.userId }).lean();
  res.json({ purchases });
});

app.post("/api/purchase/create-payment-intent", authMiddleware, async (req, res) => {
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  const { agentId } = req.body;
  if (!agentId) return res.status(400).json({ error: "agentId required" });

  const agent = await Agent.findById(agentId);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const amount = Math.round((agent.price || 0) * 100);
  if (amount <= 0) {
    return res.status(400).json({ error: "Agent is free or invalid price" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { userId: req.userId.toString(), agentId: agent._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/purchase/confirm", authMiddleware, async (req, res) => {
  const { agentId } = req.body;
  if (!agentId) return res.status(400).json({ error: "agentId required" });

  const agent = await Agent.findById(agentId);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const existing = await Purchase.findOne({ userId: req.userId, agentId: agent._id });
  if (existing) return res.json({ status: "already_owned" });

  const purchase = new Purchase({ userId: req.userId, agentId: agent._id, price: agent.price });
  await purchase.save();
  res.json({ status: "success", purchase });
});

app.post("/api/history", authMiddleware, async (req, res) => {
  const { agentId, messages } = req.body;
  if (!agentId || !Array.isArray(messages)) return res.status(400).json({ error: "agentId and messages required" });

  let history = await ChatHistory.findOne({ userId: req.userId, agentId });
  if (!history) {
    history = new ChatHistory({ userId: req.userId, agentId, messages });
  } else {
    history.messages = messages;
  }
  await history.save();
  res.json({ status: "ok", history });
});

app.post("/api/chat", authMiddleware, async (req, res) => {
  const { agentId, history = [] } = req.body;
  if (!agentId) return res.status(400).json({ error: "agentId required" });
  const agent = await Agent.findById(agentId);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const requiredPurchase = agent.price && agent.price > 0;
  if (requiredPurchase) {
    const owned = await Purchase.findOne({ userId: req.userId, agentId: agent._id });
    if (!owned) return res.status(403).json({ error: "Agent not purchased" });
  }

  try {
    if (USE_LOCAL_AI || process.env.DEMO_MODE === "true") {
      const last = history[history.length - 1]?.parts?.[0]?.text || "";
      const response = getAgentResponse(agent._id.toString(), last, history);
      return res.json({ text: response, mode: "local" });
    }

    const provider = agent.provider.toLowerCase();
    const model = agent.model || "gpt-4o-mini";

    if (provider === "openai") {
      if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
      const openaiMessages = [
        { role: "system", content: agent.systemPrompt },
        ...history.map((item) => ({ role: item.role === "user" ? "user" : "assistant", content: item.parts.map((p) => p.text).join(" ") })),
      ];
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({ model, messages: openaiMessages, temperature: 0.5, max_tokens: 800 }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "OpenAI error");
      return res.json({ text: data?.choices?.[0]?.message?.content || "", mode: "openai" });
    }

    if (provider === "gemini") {
      if (!GEMINI_KEY) throw new Error("Missing GEMINI_API_KEY");
      const body = {
        system_instruction: { parts: [{ text: agent.systemPrompt }] },
        contents: history,
      };
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Gemini error");
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return res.json({ text, mode: "gemini" });
    }

    return res.status(400).json({ error: "Unsupported provider" });
  } catch (error) {
    console.log("AI API failed, local fallback:", String(error));
    const last = history[history.length - 1]?.parts?.[0]?.text || "";
    const response = getAgentResponse(agentId, last, history);
    return res.json({ text: response, mode: "local_fallback" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Local AI mode: ${USE_LOCAL_AI ? "ENABLED" : "DISABLED"}`);
});
