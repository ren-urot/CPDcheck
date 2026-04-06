import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { User, PageId } from "../../types";

interface LayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Layout({ currentPage, onNavigate, user, onLogout, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#efefef]">
      <Header currentPage={currentPage} onNavigate={onNavigate} />
      <div className="pt-12">
        <div className="mx-auto w-full max-w-[1255px] px-4 py-5 flex items-start gap-5">
          <aside className="w-[280px] shrink-0 sticky top-[75px] self-start mt-[7px] overflow-hidden">
            <Sidebar currentPage={currentPage} onNavigate={onNavigate} user={user} onLogout={onLogout} />
          </aside>
          <main className="w-[939px] shrink-0 mt-[7px]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
