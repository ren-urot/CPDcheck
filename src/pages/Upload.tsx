import { useState, useRef } from "react";
import type { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { categories } from "../data/content";
import { cpdCategories } from "../data/categories";
import { cn } from "../lib/utils";
import { CheckCircle2, Eye, FileText, Headphones, Monitor, BookOpen, Clock } from "lucide-react";
import type { CompletedEducationItem, ContentType } from "../types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const activityTypes = [
  "Structured - Live webinar / seminar",
  "Structured - On demand / e-learning",
  "Structured - Conference",
  "Unstructured - Professional reading (max 4 hrs)",
  "Unstructured - Relevant qualification",
];

const CSV_HINT = `Title,Provider,Activity Type,CPD Area,Hours,Completion Date,Notes
FASEA Ethics Module,FPA Australia,Structured - Live webinar / seminar,Professionalism & Ethics,1.5,28/08/2025,Optional notes`;

interface UploadForm {
  title: string;
  activityType: string;
  provider: string;
  description: string;
  completionDay: string;
  completionMonth: string;
  completionYear: string;
  cpdArea: string;
  hoursAllocated: string;
  notes: string;
  file: File | null;
}

const emptyForm: UploadForm = {
  title: "", activityType: "", provider: "", description: "",
  completionDay: "", completionMonth: "", completionYear: "",
  cpdArea: "", hoursAllocated: "", notes: "", file: null,
};

function activityToType(t: string): ContentType {
  const lower = t.toLowerCase();
  if (lower.includes("reading") || lower.includes("qualification")) return "pdf";
  return "url";
}

function formToItem(form: UploadForm): CompletedEducationItem {
  const hours = parseFloat(form.hoursAllocated) || 0;
  const monthName = form.completionMonth ? MONTHS[parseInt(form.completionMonth) - 1] : "";
  const parts = [form.completionDay, monthName, form.completionYear].filter(Boolean);
  const completedDate = parts.join(" ") || "Unknown";
  const type = activityToType(form.activityType);
  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: form.title || "Untitled",
    subtitle: form.notes || form.description || form.activityType || "",
    description: form.description || form.title || "",
    provider: form.provider || "External",
    type,
    duration: Math.round(hours * 60),
    cpdPoints: hours,
    completedDate,
    status: "completed",
    categories: form.cpdArea ? [{ name: form.cpdArea, pts: hours }] : [],
    isImported: true,
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function parseCSVText(text: string): CompletedEducationItem[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const firstCols = parseCSVLine(lines[0]);
  const isHeader = firstCols[0].toLowerCase().includes("title") || firstCols[0].toLowerCase().includes("activity");
  const dataLines = isHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line, i) => {
      const cols = parseCSVLine(line);
      const [title = "", provider = "", activityType = "", cpdArea = "", hoursStr = "", dateStr = "", notes = ""] = cols;
      const hours = parseFloat(hoursStr) || 0;
      const type = activityToType(activityType);
      let completedDate = dateStr;
      const dateMatch = dateStr.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/);
      if (dateMatch) {
        const [, d, m, y] = dateMatch;
        completedDate = `${parseInt(d)} ${MONTHS[parseInt(m) - 1] ?? ""} ${y}`.trim();
      }
      return {
        id: `import-csv-${Date.now()}-${i}`,
        title: title || "Untitled",
        subtitle: notes || activityType || "",
        description: notes || title || "",
        provider: provider || "External",
        type,
        duration: Math.round(hours * 60),
        cpdPoints: hours,
        completedDate,
        status: "completed" as const,
        categories: cpdArea ? [{ name: cpdArea, pts: hours }] : [],
        isImported: true,
      };
    })
    .filter((item) => item.title !== "Untitled" || item.cpdPoints > 0);
}

// ── Preview card ──────────────────────────────────────────────────────────────

const typeConfig = {
  audio:   { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones },
  podcast: { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones },
  pdf:     { bg: "bg-red-100",    color: "text-red-500",    Icon: FileText },
  url:     { bg: "bg-blue-100",   color: "text-blue-500",   Icon: Monitor },
  text:    { bg: "bg-blue-100",   color: "text-blue-500",   Icon: BookOpen },
} as const;

function PreviewCard({ item }: { item: CompletedEducationItem }) {
  const tc = typeConfig[item.type as keyof typeof typeConfig] ?? typeConfig.url;
  const Icon = tc.Icon;
  return (
    <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-[#e2e2e2] bg-white">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", tc.bg)}>
        <Icon size={18} className={tc.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.provider}</p>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground leading-tight mt-1">{item.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {cpdCategories.map((cat) => {
            const active = item.categories.some(
              (c) => c.name === cat.shortLabel || c.name === cat.label
            );
            return (
              <span
                key={cat.id}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                )}
              >
                {cat.shortLabel}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 size={12} /> {item.completedDate}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
            Imported
          </span>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div className="bg-blue-100 text-[#1182E3] rounded-xl px-4 py-2 text-center min-w-[80px]">
          <p className="text-lg font-bold leading-none">{item.cpdPoints}</p>
          <p className="text-[10px] font-medium mt-0.5">CPD Points</p>
        </div>
        {item.duration > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={10} /> {item.duration} min
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface UploadProps {
  onSubmit?: (items: CompletedEducationItem[]) => void;
}

export function Upload({ onSubmit }: UploadProps) {
  const [form, setForm] = useState<UploadForm>(emptyForm);
  const [pasteText, setPasteText] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CompletedEducationItem[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(field: keyof UploadForm, value: string | File | null) {
    setForm((f) => ({ ...f, [field]: value }));
    setPreview(null);
  }

  function handleManualPreview(e: FormEvent) {
    e.preventDefault();
    setPreview([formToItem(form)]);
  }

  function handlePastePreview() {
    if (!pasteText.trim()) return;
    setPreview(parseCSVText(pasteText));
  }

  async function handleCSVPreview() {
    if (!csvFile) return;
    const text = await csvFile.text();
    setPreview(parseCSVText(text));
  }

  function handleConfirm() {
    if (!preview || preview.length === 0) return;
    onSubmit?.(preview);
    setSubmitted(true);
    setForm(emptyForm);
    setPasteText("");
    setCsvFile(null);
    setPreview(null);
  }

  function handleReset() {
    setSubmitted(false);
    setPreview(null);
  }

  if (submitted) {
    return (
      <div className="max-w-xl space-y-4">
        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">CPD Activity Submitted</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your external CPD has been recorded and will appear in your education history.
              </p>
            </div>
            <Button onClick={handleReset}>Submit Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Upload External CPD</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record CPD completed outside this platform. Use the form, paste CSV data, or upload a CSV file.
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="paste">Paste CSV</TabsTrigger>
          <TabsTrigger value="csv">Upload CSV</TabsTrigger>
        </TabsList>

        {/* ── Manual Entry ── */}
        <TabsContent value="manual">
          <form onSubmit={handleManualPreview} className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-sm">Activity Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Activity Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g. FASEA Ethics Module"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Activity Type <span className="text-destructive">*</span></Label>
                  <Select value={form.activityType} onValueChange={(v) => handleChange("activityType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select activity type…" /></SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="provider">Facilitator / Provider</Label>
                  <Input
                    id="provider"
                    placeholder="e.g. FPA Australia"
                    value={form.provider}
                    onChange={(e) => handleChange("provider", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Brief Description (optional)</Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Learning format, delivery method…"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Accreditation & Dates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Date of Completion <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Select value={form.completionDay} onValueChange={(v) => handleChange("completionDay", v)}>
                      <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.completionMonth} onValueChange={(v) => handleChange("completionMonth", v)}>
                      <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                      <SelectContent>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                          <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.completionYear} onValueChange={(v) => handleChange("completionYear", v)}>
                      <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        {[2026, 2025, 2024, 2023].map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>CPD Area <span className="text-destructive">*</span></Label>
                    <Select value={form.cpdArea} onValueChange={(v) => handleChange("cpdArea", v)}>
                      <SelectTrigger><SelectValue placeholder="Select a category…" /></SelectTrigger>
                      <SelectContent>
                        {categories.filter((c) => c !== "All").map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hours">Hours Allocated <span className="text-destructive">*</span></Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0.25"
                      max="40"
                      step="0.25"
                      placeholder="e.g. 1.5"
                      value={form.hoursAllocated}
                      onChange={(e) => handleChange("hoursAllocated", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Extra Notes (optional)</Label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="Any additional information…"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Upload Certificate (PDF)</Label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleChange("file", e.target.files?.[0] ?? null)}
                    className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-sm file:font-medium file:bg-background file:text-foreground hover:file:bg-accent cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button type="submit">
                <Eye size={15} className="mr-1.5" /> Preview
              </Button>
              <Button type="button" variant="outline" onClick={() => { setForm(emptyForm); setPreview(null); }}>
                Discard
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ── Paste CSV ── */}
        <TabsContent value="paste">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Paste CSV Data</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Paste rows in CSV format. An optional header row is supported.
                </p>
                <div className="rounded-md bg-muted px-3 py-2">
                  <code className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                    {CSV_HINT}
                  </code>
                </div>
                <textarea
                  rows={8}
                  placeholder={CSV_HINT}
                  value={pasteText}
                  onChange={(e) => { setPasteText(e.target.value); setPreview(null); }}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono"
                />
              </CardContent>
            </Card>
            <div className="flex items-center gap-3">
              <Button onClick={handlePastePreview} disabled={!pasteText.trim()}>
                <Eye size={15} className="mr-1.5" /> Preview
              </Button>
              <Button variant="outline" onClick={() => { setPasteText(""); setPreview(null); }}>
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Upload CSV ── */}
        <TabsContent value="csv">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Upload CSV File</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Upload a .csv file with columns: Title, Provider, Activity Type, CPD Area, Hours, Completion Date, Notes.
                </p>
                <div className="rounded-md bg-muted px-3 py-2">
                  <code className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                    {CSV_HINT}
                  </code>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => { setCsvFile(e.target.files?.[0] ?? null); setPreview(null); }}
                  className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-sm file:font-medium file:bg-background file:text-foreground hover:file:bg-accent cursor-pointer"
                />
                {csvFile && (
                  <p className="text-xs text-muted-foreground">Selected: {csvFile.name}</p>
                )}
              </CardContent>
            </Card>
            <div className="flex items-center gap-3">
              <Button onClick={handleCSVPreview} disabled={!csvFile}>
                <Eye size={15} className="mr-1.5" /> Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCsvFile(null);
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Preview panel ── */}
      {preview !== null && (
        <div className="space-y-3">
          <Separator />
          {preview.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Preview — {preview.length} {preview.length === 1 ? "entry" : "entries"}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setPreview(null)}>
                  Cancel
                </Button>
              </div>
              <div className="space-y-2">
                {preview.map((item) => <PreviewCard key={item.id} item={item} />)}
              </div>
              <Button onClick={handleConfirm} className="w-full">
                <CheckCircle2 size={15} className="mr-1.5" />
                Confirm & Submit {preview.length > 1 ? `${preview.length} Entries` : "Entry"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-destructive">
              No valid entries found. Check that your data matches the expected format.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
