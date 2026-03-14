import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { getAgentResponse } from "./agentKnowledge.js";
import { authMiddleware, login, register, verifyToken } from "./auth.js";
import { User, Purchase, ChatHistory, StripeCustomer } from "./models.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const USE_LOCAL_AI = process.env.USE_LOCAL_AI === "true" || !OPENAI_KEY;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/agentichub";
mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.warn("MongoDB connection failure:", err.message);
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const result = await register(email, password, name);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const result = await login(email, password);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("email name");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

app.post("/api/purchase", authMiddleware, async (req, res) => {
  const { agentId, price } = req.body;
  if (!agentId || !price) return res.status(400).json({ error: "agentId and price required" });
  const existing = await Purchase.findOne({ userId: req.userId, agentId });
  if (existing) return res.json({ status: "already_owned" });
  const purchase = new Purchase({ userId: req.userId, agentId, price });
  await purchase.save();
  res.json({ status: "success", purchase });
});

app.get("/api/purchases", authMiddleware, async (req, res) => {
  const purchases = await Purchase.find({ userId: req.userId });
  res.json({ purchases });
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

app.get("/api/history/:agentId", authMiddleware, async (req, res) => {
  const { agentId } = req.params;
  const history = await ChatHistory.findOne({ userId: req.userId, agentId });
  res.json({ history: history?.messages || [] });
});

app.post("/api/chat", async (req, res) => {
  const { provider, model, systemPrompt, history, agentId } = req.body;

  if (!provider || !model || !systemPrompt || !Array.isArray(history)) {
    return res.status(400).json({ error: "provider, model, systemPrompt, history are required" });
  }

  try {
    if (USE_LOCAL_AI || process.env.DEMO_MODE === "true") {
      const lastUserMessage = history[history.length - 1]?.parts?.[0]?.text || "";
      const response = getAgentResponse(agentId, lastUserMessage, history);
      return res.json({ text: response, mode: "local" });
    }

    if (provider === "openai") {
      if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
      const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...history.map(item => ({ role: item.role === "user" ? "user" : "assistant", content: item.parts.map((p) => p.text).join(" ") })),
      ];
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({ model, messages: openaiMessages, temperature: 0.5, max_tokens: 800 }),
        timeout: 10000,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "OpenAI error");
      return res.json({ text: data?.choices?.[0]?.message?.content || "", mode: "openai" });
    }

    if (provider === "gemini") {
      if (!GEMINI_KEY) throw new Error("Missing GEMINI_API_KEY");
      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: history,
      };
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        timeout: 10000,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Gemini error");
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return res.json({ text, mode: "gemini" });
    }

    return res.status(400).json({ error: "Unsupported provider" });
  } catch (error) {
    console.log("AI API failed, local fallback:", String(error));
    const lastUserMessage = history[history.length - 1]?.parts?.[0]?.text || "";
    const response = getAgentResponse(agentId, lastUserMessage, history);
    return res.json({ text: response, mode: "local_fallback" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Local AI mode: ${USE_LOCAL_AI ? "ENABLED" : "DISABLED"}`);
});
