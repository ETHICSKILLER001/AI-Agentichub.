import { Agent, getPurchases } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { toast } from "sonner";

interface MyLibraryProps {
  agents: Agent[];
  onRunAI: (agent: Agent) => void;
}

const MyLibrary = ({ agents, onRunAI }: MyLibraryProps) => {
  const purchases = getPurchases();
  const ownedAgents = agents.filter(a => purchases.some(p => p.agentId === a.id));

  const handleDownload = (agent: Agent) => {
    const bundle = JSON.stringify(agent, null, 2);
    const blob = new Blob([bundle], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, "_")}_bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Bundle downloaded!");
  };

  if (ownedAgents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">No agents purchased yet. Visit the Marketplace to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-foreground mb-6">My Library</h2>
      <div className="space-y-2">
        {ownedAgents.map(agent => (
          <div key={agent.id} className="glass rounded-lg px-5 py-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{agent.category}</span>
              <h3 className="text-foreground font-medium">{agent.name}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" onClick={() => handleDownload(agent)}>
                <Download className="w-3.5 h-3.5 mr-1" /> Bundle
              </Button>
              <Button variant="neon" size="sm" onClick={() => onRunAI(agent)}>
                <Play className="w-3.5 h-3.5 mr-1" /> Run AI
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLibrary;
