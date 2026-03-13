import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2 } from "lucide-react";
import { Agent } from "@/lib/store";

interface AIChatModalProps {
  agent: Agent;
  onClose: () => void;
}

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

const GEMINI_KEY = "AIzaSyBxVWxBBfGeI0ICmorNut2ZUNTl6H79sqw";

const AIChatModal = ({ agent, onClose }: AIChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", parts: [{ text: input }] };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const body = {
        system_instruction: { parts: [{ text: agent.systemPrompt }] },
        contents: history,
      };
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      setMessages(prev => [...prev, { role: "model", parts: [{ text }] }]);
    } catch {
      setMessages(prev => [...prev, { role: "model", parts: [{ text: "Error connecting to AI." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-strong rounded-lg w-full max-w-lg mx-4 flex flex-col h-[70vh] glow-accent">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-foreground font-medium text-sm">{agent.name}</span>
            <span className="text-muted-foreground text-xs">· Live</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-sm text-center mt-8">
              Start a conversation with {agent.name}
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "bg-muted/50 text-foreground"
                }`}
              >
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-border/30 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="bg-muted/50 border-border/50 flex-1"
          />
          <Button variant="neon" size="icon" onClick={sendMessage} disabled={loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
