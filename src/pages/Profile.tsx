import { useState } from "react";
import type { FormEvent } from "react";
import type { User } from "../types";

interface ProfileProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

export function Profile({ user, onUpdate }: ProfileProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [licenseName, setLicenseName] = useState(user?.licenseName ?? "");
  const [license, setLicense] = useState(user?.licenseNumber ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    onUpdate({ ...user!, name, email, licenseName, licenseNumber: license });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and CPD preferences.</p>
      </div>
      <div className="rounded-2xl border border-[#e2e2e2] bg-white px-6 py-5 flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-[#1a2744] flex items-center justify-center text-white text-lg font-semibold shrink-0">
          {initials || "U"}
        </div>
        <div>
          <p className="font-semibold text-lg">{name || "Your Name"}</p>
          <p className="text-sm text-muted-foreground">{user?.role ?? "Financial Advisor"}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Personal Details</h2>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="name">Full Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="licenseName">License Name</label>
              <input id="licenseName" value={licenseName} onChange={(e) => setLicenseName(e.target.value)} placeholder="e.g. Tribeca Financial" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="license">License Number</label>
              <input id="license" value={license} onChange={(e) => setLicense(e.target.value)} placeholder="e.g. 123456" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
            </div>
          </div>
          <div className="pt-2 border-t border-border flex items-center gap-3">
            <button type="submit" className="bg-[#1182E3] hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">Save Changes</button>
            {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
