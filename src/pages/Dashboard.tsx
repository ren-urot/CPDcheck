import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { cpdCategories, subCategories, completedEducation, ANNUAL_CPD_TARGET } from "../data/categories";
import { cn } from "../lib/utils";
import { Headphones, FileText, Monitor, BookOpen, BookOpenCheck, X, Plus, CheckCircle2, Clock, ClipboardList, FileSpreadsheet } from "lucide-react";
import { categories as contentCategories } from "../data/content";
import type { CompletedEducationItem, ContentType, PageId } from "../types";
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
  items?: CompletedEducationItem[];
  onAddItems?: (items: CompletedEducationItem[]) => void;
}

export function Dashboard({ onSelectContent, items: propItems, onAddItems }: DashboardProps) {
  const items = propItems ?? completedEducation;
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(cpdCategories.map(c => [c.id, c.id !== "general"]))
  );
  const [showImport, setShowImport] = useState(false);
  const [importTab, setImportTab] = useState<"auto" | "manual">("auto");
  const [importForm, setImportForm] = useState({
    activityTitle: "", activityType: "", provider: "", description: "",
    cpdType: "" as string, day: "",
    cpdArea: "", hoursAllocated: "", totalHours: "", notes: "", pdfFile: null as File | null,
  });
  const [extraAreas, setExtraAreas] = useState<{area: string; hours: string}[]>([]);
  const [autoPdfFile, setAutoPdfFile] = useState<File | null>(null);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [importPreview, setImportPreview] = useState<CompletedEducationItem[] | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const autoPdfRef = useRef<HTMLInputElement>(null);

  const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function handleAutoPdfSelect(file: File) {
    setAutoPdfFile(file);
    setAutoProcessing(true);
    setImportPreview(null);
    setTimeout(() => {
      const raw = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      const title = raw.replace(/\b\w/g, c => c.toUpperCase()).trim() || "Imported Certificate";
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      setImportForm(f => ({
        ...f,
        activityTitle: title,
        activityType: "Structured CPD",
        provider: "External",
        description: "",
        day: todayStr,
        hoursAllocated: "1",
        cpdArea: "",
        notes: "",
        pdfFile: file,
      }));
      setImportPreview([{ id: "auto", title, subtitle: "", description: "", provider: "External", type: "pdf", duration: 60, cpdPoints: 1, completedDate: "", status: "completed", categories: [], isImported: true }]);
      setAutoProcessing(false);
    }, 1200);
  }

  function activityToContentType(t: string): ContentType {
    const lower = t.toLowerCase();
    if (lower.includes("reading") || lower.includes("qualification")) return "pdf";
    return "url";
  }

  function importFormToItem(): CompletedEducationItem {
    const hours = parseFloat(importForm.hoursAllocated) || 0;
    const dateStr = importForm.day;
    let completedDate = dateStr;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        completedDate = `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
      }
    }
    const allCategories = [
      ...(importForm.cpdArea ? [{ name: importForm.cpdArea, pts: parseFloat(importForm.hoursAllocated) || 0 }] : []),
      ...extraAreas.filter(e => e.area).map(e => ({ name: e.area, pts: parseFloat(e.hours) || 0 })),
    ];
    return {
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: importForm.activityTitle || "Untitled",
      subtitle: importForm.notes || importForm.description || importForm.activityType || "",
      description: importForm.description || importForm.activityTitle || "",
      provider: importForm.provider || "External",
      type: activityToContentType(importForm.activityType),
      duration: Math.round(hours * 60),
      cpdPoints: hours,
      completedDate,
      status: "completed",
      categories: allCategories,
      isImported: true,
    };
  }

  function parseCSVLine(line: string, delimiter = ","): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === delimiter && !inQuotes) { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  }

  function detectDelimiter(line: string): string {
    const tabs = (line.match(/\t/g) || []).length;
    const commas = (line.match(/,/g) || []).length;
    return tabs > commas ? "\t" : ",";
  }

  function parseCSVText(text: string): CompletedEducationItem[] {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];
    const delimiter = detectDelimiter(lines[0]);
    const firstCols = parseCSVLine(lines[0], delimiter);
    const isHeader = firstCols[0].toLowerCase().replace(/[^a-z]/g, "").includes("title") ||
                     firstCols[0].toLowerCase().includes("activity") ||
                     firstCols[0].toLowerCase().includes("provider");
    const dataLines = isHeader && lines.length > 1 ? lines.slice(1) : lines;
    return dataLines
      .filter(line => line.replace(/,|\t/g, "").trim().length > 0)
      .map((line, i) => {
        const cols = parseCSVLine(line, delimiter);
        const [title = "", provider = "", actType = "", cpdArea = "", hoursStr = "", dateStr = "", notes = ""] = cols;
        const hours = parseFloat(hoursStr) || 0;
        let completedDate = dateStr.trim();
        const dm = completedDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (dm) completedDate = `${parseInt(dm[1])} ${MONTHS_LONG[parseInt(dm[2]) - 1] ?? ""} ${dm[3]}`.trim();
        return {
          id: `import-csv-${Date.now()}-${i}`,
          title: title.trim() || `Entry ${i + 1}`,
          subtitle: notes.trim() || actType.trim() || "",
          description: notes.trim() || title.trim() || "",
          provider: provider.trim() || "External",
          type: activityToContentType(actType),
          duration: Math.round(hours * 60),
          cpdPoints: hours,
          completedDate: completedDate || "Unknown",
          status: "completed" as const,
          categories: cpdArea.trim() ? [{ name: cpdArea.trim(), pts: hours }] : [],
          isImported: true,
        };
      });
  }

  function handleModalPreview() {
    setImportPreview([importFormToItem()]);
  }

  function handleImportConfirm() {
    if (!importPreview || importPreview.length === 0) return;
    onAddItems?.(importPreview);
    closeModal();
  }

  function handleFormSubmit() {
    const item = importFormToItem();
    onAddItems?.([item]);
    closeModal();
  }

  function closeModal() {
    setShowImport(false);
    setImportTab("auto");
    setImportForm({ activityTitle: "", activityType: "", provider: "", description: "", cpdType: "", day: "", cpdArea: "", hoursAllocated: "", totalHours: "", notes: "", pdfFile: null });
    setExtraAreas([]);
    setAutoPdfFile(null);
    setAutoProcessing(false);
    setImportPreview(null);
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

    const educationRows = items.map(item => {
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
        {items.map(item => {
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
                  <div className="flex flex-nowrap gap-1">
                    {cpdCategories.map(cat => {
                      const active = item.categories.some(c => c.name === cat.shortLabel || c.name === cat.label);
                      return (
                        <span key={cat.id} className={cn("text-[9px] px-2 pt-1 pb-0.5 rounded-full font-medium border whitespace-nowrap",
                          active ? "bg-teal-50 text-teal-600 border-teal-200" : "bg-transparent text-gray-400 border-gray-200")}>
                          {cat.shortLabel}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-nowrap overflow-hidden gap-1.5">
                    {subCategories.filter(s => ["social-security", "derivatives", "financial-plan", "aged-care", "retirement-inc", "smsf", "life-insurance", "skills"].includes(s.id)).map(sub => (
                      <span key={sub.id} className="shrink-0 text-[9px] px-2 pt-1 pb-0.5 rounded-full font-medium bg-cyan-100 text-cyan-600">
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
            <h2 className="text-base font-bold text-foreground">Import CPD points</h2>
            <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-2 shrink-0">
            {([["auto", "Automatic Entry"], ["manual", "Manual Entry"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => { setImportTab(key); setImportPreview(null); setAutoPdfFile(null); setAutoProcessing(false); }}
                className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  importTab === key ? "bg-[#1182E3] text-white" : "bg-gray-100 text-foreground hover:bg-gray-200")}>
                {key === "auto" && <FileSpreadsheet size={13} />}
                {key === "manual" && <ClipboardList size={13} />}
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-3">

            {/* ── Manual Entry form / Auto Entry editable preview ── */}
            {(importTab === "manual" || (importTab === "auto" && !!importPreview)) && (
              <div className="grid grid-cols-2 gap-4">
                {/* Left */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPD Activity Details</p>
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
                        <option>Professional Reading (max 4 hours)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-[10px] flex items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Facilitator / Provider</label>
                    <input value={importForm.provider} onChange={e => setImportForm(f => ({...f, provider: e.target.value}))}
                      placeholder="Facilitator/Provider" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Brief Description (Optional)</label>
                    <textarea value={importForm.description} onChange={e => setImportForm(f => ({...f, description: e.target.value}))}
                      placeholder="Learning format, delivery method…" rows={2}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] resize-none" />
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
                {/* Right */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accreditation &amp; Dates</p>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Date of Completion</label>
                    <input type="date" value={importForm.day} onChange={e => setImportForm(f => ({...f, day: e.target.value}))}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hours and Categories</p>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">CPD Area</label>
                      <div className="relative">
                        <select value={importForm.cpdArea} onChange={e => setImportForm(f => ({...f, cpdArea: e.target.value}))}
                          className="w-full appearance-none rounded-lg border border-border pl-3 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] bg-white">
                          <option value="">Select a Category...</option>
                          {contentCategories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
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
                          {contentCategories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
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
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Total Hours Breakdown</p>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Total Accredited Hours (Mandatory)</label>
                      <input type="number" value={importForm.totalHours} onChange={e => setImportForm(f => ({...f, totalHours: e.target.value}))}
                        placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Extra Notes</label>
                    <textarea value={importForm.notes} onChange={e => setImportForm(f => ({...f, notes: e.target.value}))}
                      placeholder="Any additional information..." rows={1}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1182E3]/30 focus:border-[#1182E3] resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Upload Certificate (PDF)</label>
                    <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => setImportForm(f => ({...f, pdfFile: e.target.files?.[0] ?? null}))} />
                    {importForm.pdfFile ? (
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 px-4 py-3 text-xs">
                        <FileText size={16} className="text-red-500 shrink-0" />
                        <span className="flex-1 text-foreground font-medium truncate">{importForm.pdfFile.name}</span>
                        <button type="button" onClick={() => pdfRef.current?.click()} className="text-[#1182E3] hover:underline shrink-0">Change</button>
                        <button type="button" onClick={() => setImportForm(f => ({...f, pdfFile: null}))} className="text-red-500 hover:underline shrink-0">Remove</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => pdfRef.current?.click()}
                        className="w-full flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                          <path d="M12 12v9"/>
                          <path d="m16 16-4-4-4 4"/>
                        </svg>
                        <span className="text-xs text-muted-foreground">PDF format, up to 10 MB</span>
                        <span className="px-4 py-1.5 rounded-xl border border-border bg-white text-xs font-medium text-foreground shadow-sm">
                          Browse File
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Automatic Entry ── */}
            {importTab === "auto" && !importPreview && !autoProcessing && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Upload your CPD certificate PDF and we'll automatically generate an entry for review.</p>
                <input ref={autoPdfRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleAutoPdfSelect(f); }} />
                {autoPdfFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 px-4 py-3 text-xs">
                    <FileText size={16} className="text-red-500 shrink-0" />
                    <span className="flex-1 text-foreground font-medium truncate">{autoPdfFile.name}</span>
                    <button type="button" onClick={() => { setAutoPdfFile(null); setImportPreview(null); if (autoPdfRef.current) autoPdfRef.current.value = ""; }} className="text-red-500 hover:underline shrink-0">Remove</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => autoPdfRef.current?.click()}
                    className="w-full flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-12">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                      <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
                    </svg>
                    <span className="text-xs text-muted-foreground">PDF format, up to 10 MB</span>
                    <span className="px-4 py-1.5 rounded-xl border border-border bg-white text-xs font-medium text-foreground shadow-sm">Browse File</span>
                  </button>
                )}
              </div>
            )}

            {/* ── Auto processing spinner ── */}
            {importTab === "auto" && autoProcessing && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-[#1182E3]/20 border-t-[#1182E3] animate-spin" />
                <p className="text-sm text-muted-foreground">Analysing document…</p>
              </div>
            )}

            {/* ── Preview panel (card style — not used for manual/auto) ── */}
            {importPreview !== null && importTab !== "manual" && importTab !== "auto" && (
              <div className="mt-4 space-y-3">
                <div className="border-t border-border pt-4">
                  {importPreview.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-foreground mb-3">
                        Preview — {importPreview.length} {importPreview.length === 1 ? "entry" : "entries"}
                      </p>
                      <div className="space-y-2">
                        {importPreview.map(item => {
                          const iconMap: Record<string, React.ComponentType<{size?: number; className?: string}>> = {
                            audio: Headphones, podcast: Headphones, pdf: FileText, url: Monitor, text: BookOpen,
                          };
                          const bgMap: Record<string, string> = {
                            audio: "bg-orange-100", podcast: "bg-orange-100", pdf: "bg-red-100", url: "bg-blue-100", text: "bg-blue-100",
                          };
                          const colMap: Record<string, string> = {
                            audio: "text-orange-500", podcast: "text-orange-500", pdf: "text-red-500", url: "text-blue-500", text: "text-blue-500",
                          };
                          const Icon = iconMap[item.type] ?? Monitor;
                          return (
                            <div key={item.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#e2e2e2] bg-white">
                              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", bgMap[item.type] ?? "bg-blue-100")}>
                                <Icon size={16} className={colMap[item.type] ?? "text-blue-500"} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold leading-tight">{item.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.provider}</p>
                                {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <CheckCircle2 size={11} /> {item.completedDate}
                                  </span>
                                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">Imported</span>
                                </div>
                              </div>
                              <div className="shrink-0 bg-blue-100 text-[#1182E3] rounded-xl px-3 py-2 text-center min-w-[72px]">
                                <p className="text-base font-bold leading-none">{item.cpdPoints}</p>
                                <p className="text-[10px] font-medium mt-0.5">CPD pts</p>
                                {item.duration > 0 && (
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                    <Clock size={9} />{item.duration}m
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-red-500 font-medium">No entries could be parsed. Make sure your data has at least a title column.</p>
                      <p className="text-xs text-muted-foreground">Expected format (comma or tab separated):</p>
                      <code className="block text-xs bg-gray-50 border border-border rounded-lg px-3 py-2 whitespace-pre-wrap break-all text-muted-foreground">{"Title,Provider,Activity Type,CPD Area,Hours,Completion Date,Notes"}</code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-3 border-t border-border shrink-0">
            {importTab === "manual" ? (
              <>
                <button onClick={handleFormSubmit}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1182E3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                  <CheckCircle2 size={15} /> Save and Submit
                </button>
                <button onClick={closeModal}
                  className="px-5 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
                  Discard Changes
                </button>
              </>
            ) : importPreview && importPreview.length > 0 ? (
              <>
                <button onClick={handleFormSubmit}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1182E3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                  <CheckCircle2 size={15} /> Save and Submit
                </button>
                <button onClick={() => { setImportPreview(null); setAutoPdfFile(null); if (autoPdfRef.current) autoPdfRef.current.value = ""; }}
                  className="px-5 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
                  Back
                </button>
              </>
            ) : (
              <>
                {importTab === "auto" && !autoProcessing && (
                  <button disabled className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-100 text-muted-foreground text-sm font-semibold cursor-not-allowed">
                    Upload a PDF to continue
                  </button>
                )}
                <button onClick={closeModal}
                  className="px-5 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
                  Discard Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

