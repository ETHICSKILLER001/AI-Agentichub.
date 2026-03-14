import { useState, useEffect, useCallback } from "react";
import AuthWall from "@/components/AuthWall";
import Navbar from "@/components/Navbar";
import Marketplace from "@/components/Marketplace";
import DeveloperForge from "@/components/DeveloperForge";
import MyLibrary from "@/components/MyLibrary";
import AIChatModal from "@/components/AIChatModal";
import { isAuthenticated, logout, getAgents, getAuthToken, setAuthToken, Agent } from "@/lib/store";

const Index = () => {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [tab, setTab] = useState("marketplace");
  const [agents, setAgents] = useState<Agent[]>(getAgents());
  const [searchQuery, setSearchQuery] = useState("");
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, [authed]);

  const refresh = useCallback(() => {
    setAgents(getAgents());
    setTick(t => t + 1);
  }, []);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setUser(null);
  };

  const onLoginSuccess = () => {
    setAuthed(true);
    const token = getAuthToken();
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => setUser(null));
  };

  if (!authed) {
    return <AuthWall onLogin={onLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeTab={tab}
        onTabChange={setTab}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <div className="animate-in fade-in duration-200">
        {tab === "marketplace" && (
          <Marketplace
            agents={agents}
            onRefresh={refresh}
            onPreview={a => setChatAgent(a)}
            searchQuery={searchQuery}
          />
        )}
        {tab === "forge" && <DeveloperForge onPublish={refresh} />}
        {tab === "library" && (
          <MyLibrary
            agents={agents}
            onRunAI={a => setChatAgent(a)}
            searchQuery={searchQuery}
          />
        )}
      </div>
      {chatAgent && <AIChatModal agent={chatAgent} onClose={() => setChatAgent(null)} />}
    </div>
  );
};

export default Index;
