export type AgentProvider = "gemini" | "openai";

export interface Agent {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  systemPrompt: string;
  author: string;
  provider?: AgentProvider;
  model?: string;
}

export interface Purchase {
  agentId: string;
  purchasedAt: string;
}

const AGENTS_KEY = "agentichub_agents";
const PURCHASES_KEY = "agentichub_purchases";
const AUTH_KEY = "agentichub_auth";

const defaultAgents: Agent[] = [
  { id: "1", name: "CodeReviewer Pro", category: "Development", price: 29, description: "AI-powered code review assistant that catches bugs and suggests improvements.", systemPrompt: "You are an expert code reviewer. Analyze code for bugs, performance issues, and best practices. Be concise and actionable.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
  { id: "2", name: "SEO Strategist", category: "Marketing", price: 19, description: "Optimize your content for search engines with AI-driven insights.", systemPrompt: "You are an SEO expert. Provide actionable SEO recommendations for content, keywords, and technical optimization.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
  { id: "3", name: "Data Analyst", category: "Analytics", price: 39, description: "Transform raw data into actionable insights with natural language queries.", systemPrompt: "You are a data analyst. Help users interpret data, create queries, and derive insights from datasets.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
  { id: "4", name: "UX Copywriter", category: "Design", price: 15, description: "Generate compelling microcopy for buttons, tooltips, and empty states.", systemPrompt: "You are a UX copywriter. Write clear, concise, and engaging microcopy for user interfaces.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
  { id: "5", name: "DevOps Assistant", category: "Development", price: 35, description: "Automate CI/CD pipelines and infrastructure management.", systemPrompt: "You are a DevOps engineer. Help with CI/CD, Docker, Kubernetes, and cloud infrastructure.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
  { id: "6", name: "Legal Advisor", category: "Business", price: 49, description: "AI-powered legal document review and compliance checking.", systemPrompt: "You are a legal advisor AI. Help review documents, explain legal terms, and check compliance. Always note you are not a lawyer.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
  { id: "7", name: "Field Questioner", category: "Socratic", price: 0, description: "An AI that first asks clarifying questions about your field before giving an answer.", systemPrompt: "You are a Socratic field expert. Before giving an answer, ask one or more clarifying questions to understand the user's domain and task.", author: "AgenticHub", provider: "openai", model: "gpt-4o-mini" },
];

export function getAgents(): Agent[] {
  const stored = localStorage.getItem(AGENTS_KEY);
  if (!stored) {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(defaultAgents));
    return defaultAgents;
  }
  return JSON.parse(stored);
}

export function addAgent(agent: Omit<Agent, "id">): Agent {
  const agents = getAgents();
  const newAgent: Agent = { ...agent, id: Date.now().toString() };
  agents.push(newAgent);
  localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  return newAgent;
}

export function getPurchases(): Purchase[] {
  const stored = localStorage.getItem(PURCHASES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addPurchase(agentId: string): void {
  const purchases = getPurchases();
  if (!purchases.find(p => p.agentId === agentId)) {
    purchases.push({ agentId, purchasedAt: new Date().toISOString() });
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_KEY, token);
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(AUTH_KEY));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
