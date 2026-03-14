import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAuthToken } from "@/lib/store";

interface AuthWallProps {
  onLogin: () => void;
}

const AuthWall = ({ onLogin }: AuthWallProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || "Authentication failed");
        return;
      }

      setAuthToken(data.token);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-30"></div>
      
      <div className="glass-strong rounded-lg p-8 w-full max-w-sm glow-primary animate-in fade-in duration-300 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">AgenticHub Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input
              placeholder="Name"
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              className="bg-muted/50 border-border/50 focus:border-primary"
            />
          )}
          <Input
            placeholder="Email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            className="bg-muted/50 border-border/50 focus:border-primary"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            className="bg-muted/50 border-border/50 focus:border-primary"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" variant="indigo" className="w-full">
            {isRegister ? "Register" : "Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setIsRegister(v => !v)}
            className="text-xs text-muted-foreground underline"
          >
            {isRegister ? "Have an account? Sign in" : "Need an account? Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthWall;
