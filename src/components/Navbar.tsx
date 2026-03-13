import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { LogOut } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const tabs = [
  { id: "marketplace", label: "Marketplace" },
  { id: "forge", label: "Developer Forge" },
  { id: "library", label: "My Library" },
];

const Navbar = ({ activeTab, onTabChange, onLogout, searchQuery, onSearch }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-border/30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <span className="font-semibold text-foreground tracking-tight">AgenticHub Pro</span>
        <div className="flex-1 max-w-md">
          <SearchBar onSearch={onSearch} suggestions={[]} />
        </div>
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
