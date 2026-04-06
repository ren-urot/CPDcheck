import { useState } from "react";
import type { FormEvent } from "react";
import logoSvg from "../assets/logo.svg";
import { Card } from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import type { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    onLogin({ name: "Alex Johnson", email, role: "Advisor", licenseNumber: "54321" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efefef] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <img src={logoSvg} alt="CPDcheck" className="h-6 w-auto" />
        </div>
        <Card className="rounded-[12px] px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your professional account</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="email">Email</label>
              <div className="relative">
                <input id="email" type="email" placeholder="advisor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-[#1182E3] hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] pr-9" />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full bg-[#1182E3] hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">Sign in</button>
          </form>
        </Card>
        <p className="text-center text-xs text-muted-foreground">professional.cpdcheck.com · Continuing Professional Development</p>
      </div>
    </div>
  );
}
