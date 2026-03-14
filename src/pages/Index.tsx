import { useState, useEffect, useCallback } from "react";
import AuthWall from "@/components/AuthWall";
import Navbar from "@/components/Navbar";
import Marketplace from "@/components/Marketplace";
import DeveloperForge from "@/components/DeveloperForge";
import MyLibrary from "@/components/MyLibrary";
import AIChatModal from "@/components/AIChatModal";
import { isAuthenticated, logout, getAuthToken, Agent } from "@/lib/store";

const Index = () => {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [tab, setTab] = useState("marketplace");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => setAgents(data.agents || []))
      .catch(() => setAgents([]));
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setAuthed(true);
        } else {
          setUser(null);
          setAuthed(false);
        }
      })
      .catch(() => {
        setUser(null);
        setAuthed(false);
      });
  }, [authed]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setUser(null);
  };

  const onLoginSuccess = () => {
    setAuthed(true);
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (data.user) setUser(data.user); })
      .catch(() => setUser(null));

    refresh();
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
