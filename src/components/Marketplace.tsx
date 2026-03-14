import { Agent, getAuthToken } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Play } from "lucide-react";
import { toast } from "sonner";

interface MarketplaceProps {
  agents: Agent[];
  onRefresh: () => void;
  onPreview: (agent: Agent) => void;
  searchQuery?: string;
}

const Marketplace = ({ agents, onRefresh, onPreview, searchQuery = "" }: MarketplaceProps) => {
  const purchases = getPurchases();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleAgents = normalizedQuery
    ? agents.filter(agent =>
        [agent.name, agent.category, agent.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : agents;

  const handleBuy = (agent: Agent) => {
    addPurchase(agent.id);
    onRefresh();
    toast.success(`Licensed "${agent.name}" successfully!`);
  };

  const owned = (id: string) => purchases.some(p => p.agentId === id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-foreground mb-6">AI Agent Marketplace</h2>
      {visibleAgents.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No marketplace items match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAgents.map(agent => (
            <div
              key={agent.id}
              className="glass rounded-lg p-5 transition-all duration-150 hover:scale-[1.02] glow-primary-hover group"
            >
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                {agent.category}
              </span>
              <h3 className="text-foreground font-semibold mt-1 text-lg">{agent.name}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-2">
                {agent.description}
              </p>
              <p className="text-foreground font-semibold mt-3 text-lg">${agent.price}</p>
              <div className="flex gap-2 mt-4">
                {owned(agent.id) ? (
                  <Button variant="glass" size="sm" disabled className="flex-1 opacity-50">Owned</Button>
                ) : (
                  <Button variant="indigo" size="sm" className="flex-1" onClick={() => handleBuy(agent)}>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Buy License
                  </Button>
                )}
                <Button variant="neon" size="sm" className="flex-1" onClick={() => onPreview(agent)}>
                  <Play className="w-3.5 h-3.5 mr-1" /> Live Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
