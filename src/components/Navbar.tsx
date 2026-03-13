import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const tabs = [
  { id: "marketplace", label: "Marketplace" },
  { id: "assistant", label: "AI Assistant" },
  { id: "forge", label: "Developer Forge" },
  { id: "library", label: "My Library" },
];

const Navbar = ({ activeTab, onTabChange, onLogout }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-border/30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">AgenticHub Pro</span>
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
