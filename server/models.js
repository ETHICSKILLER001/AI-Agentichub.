import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agentId: { type: String, required: true },
  purchasedAt: { type: Date, default: Date.now },
  price: { type: Number },
});

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agentId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ["user", "model"] },
    text: String,
    timestamp: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const stripeCustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stripeCustomerId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
export const Purchase = mongoose.model("Purchase", purchaseSchema);
export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
export const StripeCustomer = mongoose.model("StripeCustomer", stripeCustomerSchema);
