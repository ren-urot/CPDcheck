import logoSvg from "../../assets/logo.svg";
import type { PageId } from "../../types";

interface PageConfig {
  label: string;
  parent: { id: PageId; label: string } | null;
}

const pageConfig: Record<string, PageConfig> = {
  dashboard:       { label: "Dashboard",              parent: null },
  library:         { label: "CPD Library",             parent: null },
  content:         { label: "Content Details",         parent: { id: "library",     label: "CPD Library"           } },
  quiz:            { label: "Assessment",              parent: { id: "library",     label: "CPD Library"           } },
  results:         { label: "Results",                 parent: { id: "library",     label: "CPD Library"           } },
  reporting:       { label: "CPD Reporting",           parent: null },
  myEducation:     { label: "My Completed Education",  parent: null },
  completedDetail: { label: "Combine Assessment",      parent: { id: "dashboard", label: "My Completed Education" } },
  profile:         { label: "Account Settings",        parent: null },
  upload:          { label: "Upload CPD",              parent: null },
};

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const config = pageConfig[currentPage] ?? { label: currentPage, parent: null };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-border">
      <div className="mx-auto w-full max-w-[1255px] px-4 h-full flex items-center gap-4">
        <button onClick={() => onNavigate("dashboard")} className="shrink-0 flex items-center" aria-label="Go to dashboard">
          <img src={logoSvg} alt="CPDcheck" className="h-[17px] w-auto" />
        </button>
        <div className="h-5 w-px bg-border shrink-0" />
        <nav className="flex items-center gap-2 text-sm">
          {config.parent && (
            <>
              <button onClick={() => onNavigate(config.parent!.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                {config.parent.label}
              </button>
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="text-muted-foreground shrink-0">
                <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
          <span className="font-semibold text-foreground">{config.label}</span>
        </nav>
      </div>
    </header>
  );
}
