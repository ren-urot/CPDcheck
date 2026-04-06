import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { cpdCategories, subCategories, completedEducation, ANNUAL_CPD_TARGET } from "../data/categories";
import { cn } from "../lib/utils";
import { Headphones, FileText, Monitor, BookOpen, BookOpenCheck, X, Plus } from "lucide-react";
import type { CompletedEducationItem, ContentType } from "../types";
import { generateUserGuide } from "../utils/generateUserGuide";

// ─── Donut chart ──────────────────────────────────────────────────────────────

interface DonutProps {
  earned: number;
  target: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
}

function Donut({ earned, target, size = 64, stroke = 8 }: DonutProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(earned / target, 1) : 0;
  const arcColor = target === 0 ? "#94A3B8" : pct >= 1 ? "#22C55E" : "#1182E3";
  const finalOffset = target === 0 ? circ * 0.12 : circ * (1 - pct);
  const c = size / 2;
  const [offset, setOffset] = useState(circ);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOffset(circ);
    animRef.current = setTimeout(() => setOffset(finalOffset), 100);
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earned, target]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={arcColor} strokeWidth={stroke} opacity={0.15} />
      <circle
        cx={c} cy={c} r={r} fill="none"
        stroke={arcColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
    </svg>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  on: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
        on ? "bg-blue-500" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
        on ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}

// ─── Content type icon ────────────────────────────────────────────────────────

interface TypeStyleEntry {
  bg: string;
  color: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}

const typeStyle: Partial<Record<ContentType, TypeStyleEntry>> = {
  audio:   { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones },
  podcast: { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones },
  pdf:     { bg: "bg-red-100",    color: "text-red-500",    Icon: FileText   },
  url:     { bg: "bg-blue-100",   color: "text-blue-500",   Icon: Monitor    },
  text:    { bg: "bg-blue-100",   color: "text-blue-500",   Icon: BookOpen   },
};



// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface DashboardProps {
  onSelectContent?: (item: CompletedEducationItem) => void;
}

export function Dashboard({ onSelectContent }: DashboardProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(cpdCategories.map(c => [c.id, c.id !== "general"]))
  );
  const [showImport, setShowImport] = useState(false);
  const [importForm, setImportForm] = useState({
    activityTitle: "", activityType: "", provider: "", description: "",
    cpdType: "" as string, day: "", month: "", year: "",
    cpdArea: "", hoursAllocated: "", totalHours: "", notes: "", pdfFile: null as File | null,
  });
  const [extraAreas, setExtraAreas] = useState<{area: string; hours: string}[]>([]);
  const pdfRef = useRef<HTMLInputElement>(null);

  function handleImportSubmit() {
    setShowImport(false);
    setImportForm({ activityTitle: "", activityType: "", provider: "", description: "", cpdType: "", day: "", month: "", year: "", cpdArea: "", hoursAllocated: "", totalHours: "", notes: "", pdfFile: null });
    setExtraAreas([]);
  }

  const totalEarned  = parseFloat(cpdCategories.reduce((s, c) => s + c.earned, 0).toFixed(2));
  const annualPct    = Math.min(100, Math.round((totalEarned / ANNUAL_CPD_TARGET) * 100));

  function handleExport() {
    const monthAbbr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    function formatDate(dateStr: string) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getDate()}-${monthAbbr[d.getMonth()]}-${String(d.getFullYear()).slice(2)}`;
    }

    const catLabels = cpdCategories.map(c => c.label);
    const subTopicHeaders = subCategories.map((_, i) => `Sub topic ${i + 1}`);

    const educationHeader = [
      "Title", "Provider", "CPD Points", "Date", "Type",
      ...catLabels,
      "Main Topic Total", "",
      ...subTopicHeaders,
      "Sub Topic Total",
    ];

    const educationRows = completedEducation.map(item => {
      const catPts = cpdCategories.map(cat => {
        const match = item.categories.find(c =>
          cat.label === c.name || cat.shortLabel === c.name ||
          cat.label.startsWith(c.name) || c.name.startsWith(cat.shortLabel)
        );
        return match ? match.pts : "";
      });
      const mainTotal = catPts.reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
      const subPts = subCategories.map(sub => {
        const match = item.subAreas?.find(s => s.name === sub.id);
        return match ? match.pts.toFixed(2) : "";
      });
      const subTotal = (item.subAreas ?? []).reduce((s, v) => s + v.pts, 0);

      return [
        item.title, item.provider, item.cpdPoints.toFixed(2), formatDate(item.completedDate), item.type,
        ...catPts.map(v => (typeof v === "number" ? v.toFixed(2) : "")),
        mainTotal > 0 ? mainTotal.toFixed(2) : "", "",
        ...subPts,
        subTotal > 0 ? subTotal.toFixed(2) : "",
      ];
    });

    const rows = [
      ["CPD Category Report"],
      [""],
      ["Category", "Earned", "Target"],
      ...cpdCategories.map(c => [c.label, c.earned, c.target || "No requirement"]),
      [""],
      ["Completed Education"],
      educationHeader,
      ...educationRows,
    ];

    const csv = rows.map(r => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cpd-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
    <div className="space-y-4">

      {/* ── Top actions ── */}
      <div className="flex items-center justify-between">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import CPD Points
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Export Entire Report to CSV</span>
          <button onClick={handleExport} className="w-10 h-10 rounded-full bg-[#1182E3] flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </button>
        </div>
      </div>

      {/* ── Annual Compliance + Categories combined ── */}
      <div className="rounded-[21px] bg-[#1d2543] border border-white/10 overflow-hidden">
        {/* Annual Compliance — white inner card */}
        <div className="mx-3 mt-3 rounded-[17px] bg-white px-5 pt-5 pb-4">
          <p className="text-sm font-semibold text-foreground mb-3">Annual Compliance Progress</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[50px] font-bold text-[#1182E3] leading-none">{totalEarned}</p>
              <p className="text-sm text-muted-foreground mt-1">
                of {ANNUAL_CPD_TARGET} <span className="text-[#1182E3] font-medium">CPD points</span> earned
              </p>
            </div>
            <p className={cn("text-xl font-bold", annualPct >= 100 ? "text-green-500" : "text-foreground")}>
              {annualPct}%
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${annualPct}%` }} />
          </div>
        </div>

        {/* Category cards grid */}
        <div className="grid grid-cols-3 gap-2 px-3 py-3">
          {cpdCategories.map(cat => {
            const met = cat.target > 0 && cat.earned >= cat.target;
            const isTax = cat.id === "tax";
            return (
              <div
                key={cat.id}
                className={cn(
                  "rounded-[17px] bg-[#2F3E60] px-4 py-[30px] flex items-center gap-3 transition-opacity",
                  isTax && !enabled[cat.id] && "opacity-50"
                )}
              >
                <div className="relative shrink-0">
                  <Donut earned={cat.earned} target={cat.target} size={77} stroke={7} trackColor="#1d2543" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-white leading-none">{cat.earned}/{cat.target > 0 ? cat.target : "–"}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white leading-snug">{cat.shortLabel}</p>
                  {cat.target > 0 ? (
                    <p className={cn("text-xs font-medium mt-0.5", met ? "text-green-400" : "text-blue-300")}>
                      {met ? "Requirement met" : `${(cat.target - cat.earned).toFixed(1)} pts to go`}
                    </p>
                  ) : (
                    <p className="text-xs text-white/40 mt-0.5">No requirement</p>
                  )}
                </div>
                {isTax && (
                  <Toggle on={enabled[cat.id]} onChange={v => setEnabled(p => ({ ...p, [cat.id]: v }))} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sub Category ── */}
      <div className="grid grid-cols-4 gap-2">
        {subCategories.map(sub => (
          <div key={sub.id} className="flex items-center gap-2 rounded-lg border border-[#e2e2e2] bg-white px-2 py-[13px]">
            <span className={cn(
              "shrink-0 min-w-[32px] h-7 rounded-md border flex items-center justify-center text-[10px] font-semibold",
              sub.earned
                ? "bg-green-100 border-green-200 text-green-700"
                : "bg-[#f1f1f1] border-border text-gray-400"
            )}>
              {sub.earned ?? "–"}
            </span>
            <span className="text-xs leading-snug text-foreground">{sub.label}</span>
          </div>
        ))}
      </div>

      {/* ── My Completed Education ── */}
      <p className="text-sm font-semibold text-foreground mt-[30px]">My Completed Education</p>
      <div className="space-y-[9px]">
        {completedEducation.map(item => {
          const EduIcon = (typeStyle[item.type] ?? typeStyle.podcast!).Icon;
          return (
            <button key={item.id} onClick={() => onSelectContent?.(item)}
              className="w-full text-left flex items-stretch hover:opacity-95 transition-opacity">
              {/* Dark left panel — height matches white box naturally via flex */}
              <div className="w-[72px] shrink-0 bg-[#1a2744] rounded-l-xl flex items-center justify-center self-stretch">
                <EduIcon size={24} className="text-white/80 -translate-x-[7px]" />
              </div>
              {/* White box overlaps dark panel showing rounded left corners */}
              <div className="relative z-10 flex-1 flex -ml-4 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="flex-1 min-w-0 px-4 py-3 space-y-1.5">
                  <p className="text-sm font-semibold leading-snug">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cpdCategories.map(cat => {
                      const active = item.categories.some(c => c.name === cat.shortLabel);
                      return (
                        <span key={cat.id} className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-medium border",
                          active ? "bg-teal-50 text-teal-600 border-teal-200" : "bg-transparent text-gray-400 border-gray-200")}>
                          {cat.shortLabel}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-nowrap overflow-hidden gap-1.5">
                    {subCategories.filter(s => ["social-security", "derivatives", "financial-plan", "aged-care", "retirement-inc", "smsf"].includes(s.id)).map(sub => (
                      <span key={sub.id} className="shrink-0 text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-cyan-100 text-cyan-600">
                        {sub.label}
                      </span>
                    ))}
                  </div>
                </div>
                {/* CPD Points */}
                <div className="shrink-0 bg-blue-100 text-blue-600 m-2 rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[90px]">
                  <p className="text-base font-bold leading-none">{item.cpdPoints}</p>
                  <p className="text-[10px] font-medium mt-0.5">CPD Points</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>


    </div>

    {/* ── Import CPD Points Modal ── */}
    {showImport && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Import CPD points</h2>
            <button onClick={() => setShowImport(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Left column */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upload CPD Activity Details</p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Activity Title</label>
                <input value={importForm.activityTitle} onChange={e => setImportForm(f => ({...f, activityTitle: e.target.value}))}
                  placeholder="Activity Title" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Activity Type</label>
                <div className="relative">
                  <select value={importForm.activityType} onChange={e => setImportForm(f => ({...f, activityType: e.target.value}))}
                    className="w-full appearance-none rounded-lg border border-border pl-3 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] bg-white">
                    <option value="">Select Activity Type...</option>
                    <option>Structured CPD</option>
                    <option>Unstructured CPD</option>
                    <option>Conference</option>
                    <option>Self-directed</option>
                    <option>Relevant Qualification</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-[10px] flex items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Facilitator/Provider</label>
                <input value={importForm.provider} onChange={e => setImportForm(f => ({...f, provider: e.target.value}))}
                  placeholder="Facilitator/Provider" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Brief Description (Optional)</label>
                <textarea value={importForm.description} onChange={e => setImportForm(f => ({...f, description: e.target.value}))}
                  placeholder="Learning Format: Select the method of delivery: live webinar / on demand / in person"
                  rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Type of CPD Undertaken</label>
                <div className="flex flex-wrap gap-2">
                  {["Non-Ensombl Entity", "Relevant Qualification", "Professional Reading (max 4 hours)"].map(t => (
                    <button key={t} type="button" onClick={() => setImportForm(f => ({...f, cpdType: f.cpdType === t ? "" : t}))}
                      className={cn("text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                        importForm.cpdType === t ? "bg-[#1182E3] text-white border-[#1182E3]" : "border-border text-foreground hover:bg-gray-50")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accreditation &amp; Dates</p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Date of Completion</label>
                <input type="date" value={importForm.day}
                  onChange={e => setImportForm(f => ({...f, day: e.target.value}))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hours and Categories</p>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">CPD Areas</label>
                  <div className="relative">
                    <select value={importForm.cpdArea} onChange={e => setImportForm(f => ({...f, cpdArea: e.target.value}))}
                      className="w-full appearance-none rounded-lg border border-border pl-3 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] bg-white">
                      <option value="">Select a Category...</option>
                      {cpdCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-[10px] flex items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Hours Allocated</label>
                  <input type="number" value={importForm.hoursAllocated} onChange={e => setImportForm(f => ({...f, hoursAllocated: e.target.value}))}
                    placeholder="Hours" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
                </div>
                {extraAreas.map((ea, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <select value={ea.area} onChange={e => setExtraAreas(a => a.map((x,j) => j===i ? {...x, area: e.target.value} : x))}
                      className="rounded-lg border border-border px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 bg-white">
                      <option value="">Select a Category...</option>
                      {cpdCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <input type="number" value={ea.hours} onChange={e => setExtraAreas(a => a.map((x,j) => j===i ? {...x, hours: e.target.value} : x))}
                      placeholder="Hours" className="rounded-lg border border-border px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30" />
                  </div>
                ))}
                <button type="button" onClick={() => setExtraAreas(a => [...a, {area:"", hours:""}])}
                  className="flex items-center gap-1 text-xs text-[#1182E3] font-medium hover:underline">
                  <Plus size={12} /> Add more
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Hours Breakdown</p>
                <label className="text-xs font-medium text-foreground">Total Accredited Hours (Mandatory)</label>
                <input type="number" value={importForm.totalHours} onChange={e => setImportForm(f => ({...f, totalHours: e.target.value}))}
                  placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Extra Notes</label>
                <textarea value={importForm.notes} onChange={e => setImportForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Any additional information..." rows={2}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Upload PDF</label>
                <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => setImportForm(f => ({...f, pdfFile: e.target.files?.[0] ?? null}))} />
                {importForm.pdfFile
                  ? <div className="flex items-center gap-3 text-xs">
                      <span className="text-foreground font-medium truncate max-w-[140px]">{importForm.pdfFile.name}</span>
                      <button type="button" onClick={() => pdfRef.current?.click()} className="text-[#1182E3] hover:underline">Change</button>
                      <button type="button" onClick={() => setImportForm(f => ({...f, pdfFile: null}))} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  : <button type="button" onClick={() => pdfRef.current?.click()}
                      className="text-xs text-[#1182E3] hover:underline font-medium">Attach PDF</button>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
            <button onClick={handleImportSubmit}
              className="px-5 py-2 rounded-xl bg-[#1182E3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
              Save and Submit
            </button>
            <button onClick={() => setShowImport(false)}
              className="px-5 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

