import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/store";

interface AuthWallProps {
  onLogin: () => void;
}

const AuthWall = ({ onLogin }: AuthWallProps) => {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(id, pass)) {
      onLogin();
    } else {
      setError("Invalid credentials");
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
          <Input
            placeholder="Username"
            value={id}
            onChange={e => { setId(e.target.value); setError(""); }}
            className="bg-muted/50 border-border/50 focus:border-primary"
          />
          <Input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError(""); }}
            className="bg-muted/50 border-border/50 focus:border-primary"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" variant="indigo" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
};

export default AuthWall;
