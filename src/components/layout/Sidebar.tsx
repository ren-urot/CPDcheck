import React from "react";
import { cn } from "../../lib/utils";
import { ProfileIcon, LogoutIcon, HomeIcon, LibraryIcon } from "../../lib/icons";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import type { User, PageId } from "../../types";

interface IconProps {
  size?: number;
  className?: string;
}

function UploadIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, user, onLogout }: SidebarProps) {
  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <aside className="space-y-2.5">
      <div className="rounded-xl border border-[#e2e2e2] bg-white">
        <div className="p-4 flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="text-sm font-semibold bg-brand-dark-blue text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name ?? "Advisor"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role ?? "Advisor"} · {user?.licenseNumber ? `AR#${user.licenseNumber}` : "AR#12345"}
            </p>
          </div>
        </div>
        <Separator />
        <div className="px-3 pt-3 pb-1">
          <p className="px-2 text-xs font-medium text-muted-foreground mb-1">Profile</p>
          <NavItem icon={<ProfileIcon size={17} />} label="Account Settings" active={currentPage === "profile"} onClick={() => onNavigate("profile")} />
          <NavItem icon={<LogoutIcon size={17} />} label="Sign Out" onClick={onLogout} />
        </div>
        <div className="h-2" />
      </div>
      <div className="rounded-xl border border-[#e2e2e2] bg-white">
        <div className="px-3 py-1.5">
          <NavItem icon={<HomeIcon size={17} />} label="Dashboard" active={currentPage === "dashboard"} onClick={() => onNavigate("dashboard")} />
        </div>
      </div>
      <div className="rounded-xl border border-[#e2e2e2] bg-white">
        <div className="px-3 py-1.5">
          <NavItem icon={<LibraryIcon size={17} />} label="CPD Library" active={["library", "content", "quiz", "results"].includes(currentPage)} onClick={() => onNavigate("library")} />
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors",
        active ? "font-semibold text-[#1182E3]" : "font-normal text-foreground hover:font-semibold hover:text-[#1182E3]"
      )}
    >
      <span className={cn("shrink-0", active ? "text-[#1182E3]" : "text-foreground/70")}>{icon}</span>
      {label}
    </button>
  );
}
