import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addAgent } from "@/lib/store";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface DeveloperForgeProps {
  onPublish: () => void;
}

const DeveloperForge = ({ onPublish }: DeveloperForgeProps) => {
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "", systemPrompt: "", provider: "openai", model: "gpt-4o-mini" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.description || !form.systemPrompt || !form.provider || !form.model) {
      toast.error("All fields are required");
      return;
    }
    addAgent({ ...form, price: parseFloat(form.price), author: "admin" });
    setForm({ name: "", price: "", category: "", description: "", systemPrompt: "" });
    onPublish();
    toast.success("Agent published!");
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-foreground mb-6">Developer Forge</h2>
      <form onSubmit={handleSubmit} className="glass-strong rounded-lg p-6 space-y-4">
        <Input placeholder="Agent Name" value={form.name} onChange={set("name")} className="bg-muted/50 border-border/50" />
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Price ($)" type="number" value={form.price} onChange={set("price")} className="bg-muted/50 border-border/50" />
          <Input placeholder="Category" value={form.category} onChange={set("category")} className="bg-muted/50 border-border/50" />
        </div>
        <Textarea placeholder="Description" value={form.description} onChange={set("description")} className="bg-muted/50 border-border/50 min-h-[80px]" />
        <Textarea placeholder="System Prompt" value={form.systemPrompt} onChange={set("systemPrompt")} className="bg-muted/50 border-border/50 min-h-[100px]" />
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-xs font-medium text-muted-foreground">
            Provider
            <select
              value={form.provider}
              onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
              className="w-full mt-1 bg-muted/50 border border-border/50 rounded px-2 py-1"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </label>
          <Input placeholder="Model (e.g. gpt-4o-mini)" value={form.model} onChange={set("model")} className="bg-muted/50 border-border/50" />
        </div>
        <Button type="submit" variant="indigo" className="w-full">Publish Agent</Button>
      </form>
    </div>
  );
};

export default DeveloperForge;
