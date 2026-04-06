import { useState } from "react";
import type { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { categories } from "../data/content";

const activityTypes = [
  "Structured - Live webinar / seminar",
  "Structured - On demand / e-learning",
  "Structured - Conference",
  "Unstructured - Professional reading (max 4 hrs)",
  "Unstructured - Relevant qualification",
];

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
  title: "",
  activityType: "",
  provider: "",
  description: "",
  completionDay: "",
  completionMonth: "",
  completionYear: "",
  cpdArea: "",
  hoursAllocated: "",
  notes: "",
  file: null,
};

export function Upload() {
  const [form, setForm] = useState<UploadForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof UploadForm, value: string | File | null) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl space-y-4">
        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">CPD Activity Submitted</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your external CPD has been recorded and points will be reflected in your dashboard.
              </p>
            </div>
            <Button onClick={() => setSubmitted(false)}>Submit Another</Button>
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
          Record CPD completed outside this platform. Attach a supporting certificate where available.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Activity details */}
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
              <Label htmlFor="activityType">Activity Type <span className="text-destructive">*</span></Label>
              <Select
                value={form.activityType}
                onValueChange={(v) => handleChange("activityType", v)}
              >
                <SelectTrigger id="activityType">
                  <SelectValue placeholder="Select activity type…" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
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

        {/* Accreditation & dates */}
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
                <Label htmlFor="cpdArea">CPD Area <span className="text-destructive">*</span></Label>
                <Select value={form.cpdArea} onValueChange={(v) => handleChange("cpdArea", v)}>
                  <SelectTrigger id="cpdArea">
                    <SelectValue placeholder="Select a category…" />
                  </SelectTrigger>
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
          <Button type="submit">Save & Submit</Button>
          <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
            Discard Changes
          </Button>
        </div>

      </form>
    </div>
  );
}
