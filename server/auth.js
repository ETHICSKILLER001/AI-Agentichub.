import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "./models.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-prod";

export async function register(email, password, name) {
  try {
    const existing = await User.findOne({ email });
    if (existing) return { error: "User already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name: name || email.split("@")[0] });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return { token, user: { id: user._id, email: user.email, name: user.name } };
  } catch (err) {
    return { error: err.message };
  }
}

export async function login(email, password) {
  try {
    const user = await User.findOne({ email });
    if (!user) return { error: "User not found" };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { error: "Invalid password" };

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return { token, user: { id: user._id, email: user.email, name: user.name } };
  } catch (err) {
    return { error: err.message };
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  req.userId = payload.userId;
  next();
}
