import { useState, useCallback } from "react";
import AuthWall from "@/components/AuthWall";
import Navbar from "@/components/Navbar";
import Marketplace from "@/components/Marketplace";
import DeveloperForge from "@/components/DeveloperForge";
import MyLibrary from "@/components/MyLibrary";
import AIChatModal from "@/components/AIChatModal";
import { isAuthenticated, logout, getAgents, Agent } from "@/lib/store";

const Index = () => {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [tab, setTab] = useState("marketplace");
  const [agents, setAgents] = useState<Agent[]>(getAgents());
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setAgents(getAgents());
    setTick(t => t + 1);
  }, []);

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  if (!authed) {
    return <AuthWall onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab={tab} onTabChange={setTab} onLogout={handleLogout} />
      <div className="animate-in fade-in duration-200">
        {tab === "marketplace" && (
          <Marketplace agents={agents} onRefresh={refresh} onPreview={a => setChatAgent(a)} />
        )}
        {tab === "forge" && <DeveloperForge onPublish={refresh} />}
        {tab === "library" && <MyLibrary agents={agents} onRunAI={a => setChatAgent(a)} />}
      </div>
      {chatAgent && <AIChatModal agent={chatAgent} onClose={() => setChatAgent(null)} />}
    </div>
  );
};

export default Index;
