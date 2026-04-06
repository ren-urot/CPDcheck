import React, { useState, useRef } from "react";
import { cn } from "../lib/utils";
import { Headphones, FileText, Monitor, BookOpen, Play, SkipBack, SkipForward, Volume2, ArrowRight } from "lucide-react";
import type { ContentItem, ContentType } from "../types";

interface TypeConfigEntry {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const typeConfig: Partial<Record<ContentType, TypeConfigEntry>> = {
  audio:   { Icon: Headphones, label: "Podcast" },
  podcast: { Icon: Headphones, label: "Podcast" },
  pdf:     { Icon: FileText,   label: "PDF"     },
  url:     { Icon: Monitor,    label: "Video"   },
  text:    { Icon: BookOpen,   label: "Article" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  completed:  { label: "Completed",   className: "text-green-500"  },
  inProgress: { label: "In Progress", className: "text-orange-500" },
  notStarted: { label: "Not Started", className: "text-gray-400"   },
};

interface ContentProps {
  item: ContentItem | null;
  onBack: () => void;
  onStartQuiz: (item: ContentItem) => void;
  onMarkComplete?: (id: string) => void;
}

export function Content({ item, onBack, onStartQuiz }: ContentProps) {
  const [playing, setPlaying] = useState(false);

  if (!item) return null;

  const tc = typeConfig[item.type] ?? typeConfig.text!;
  const sc = statusConfig[item.status] ?? statusConfig.notStarted;
  const Icon = tc.Icon;
  const primaryCategory = item.categories?.[0]?.name ?? "";
  const totalPts = item.cpdPoints;

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 text-blue-500 font-medium"><Icon size={14} /> {tc.label}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{primaryCategory}</span>
          <span className="text-muted-foreground">·</span>
          <span className={cn("font-medium", sc.className)}>{sc.label}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight">{item.title}</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
        </div>

        {item.type === "pdf" ? (
          <PdfViewer icon={<Icon size={32} className="text-red-500" />} />
        ) : item.type === "text" ? (
          <ArticleViewer icon={<Icon size={32} className="text-purple-500" />} />
        ) : (
          <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
            <div className="bg-[#1a2744] mx-4 mt-4 rounded-xl h-60 flex flex-col items-center justify-center gap-3">
              <button onClick={() => setPlaying((p) => !p)} className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg">
                <Play size={22} fill="white" />
              </button>
              <span className="text-white/40 text-sm">Click to play</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>0:00</span>
                  <span>{String(Math.floor(item.duration)).padStart(2, "0")}:00</span>
                </div>
                <div className="h-1 w-full rounded-full bg-gray-200">
                  <div className="h-full w-0 rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-muted-foreground hover:text-foreground"><SkipBack size={20} /></button>
                <button onClick={() => setPlaying((p) => !p)} className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <Play size={15} fill="white" />
                </button>
                <button className="text-muted-foreground hover:text-foreground"><SkipForward size={20} /></button>
                <span className="text-xs text-muted-foreground font-medium ml-1">1.0x</span>
                <div className="ml-auto flex items-center gap-2">
                  <Volume2 size={16} className="text-muted-foreground" />
                  <div className="h-1 w-28 rounded-full bg-gray-200">
                    <div className="h-full w-3/4 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => onStartQuiz(item)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Take Assessment <ArrowRight size={16} />
        </button>
      </div>

      <div className="w-[280px] shrink-0 space-y-4">
        <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 space-y-3">
          <p className="text-sm font-bold">Course Details</p>
          {[
            { label: "Provider",         value: item.provider          },
            { label: "Duration",         value: `${item.duration} min` },
            { label: "Total CPD Points", value: `${totalPts} pts`      },
            { label: "Format",           value: tc.label               },
            { label: "Category",         value: primaryCategory        },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-muted-foreground shrink-0">{row.label}</span>
              <span className="font-semibold text-right">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 space-y-3">
          <p className="text-sm font-bold">Accreditation Points Allocation</p>
          {item.categories?.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.name}</span>
              <span className="font-semibold text-blue-500">{cat.pts.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
            <span className="font-bold">Total</span>
            <span className="font-bold text-blue-500">{totalPts.toFixed(2)} pts</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 space-y-3">
          <p className="text-sm font-bold">Complete the quiz to earn {item.cpdPoints} CPD Points</p>
          <button
            onClick={() => onStartQuiz(item)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Quiz
            </span>
            <span className="h-5 w-5 rounded-full border-2 border-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfViewer({ icon }: { icon: React.ReactNode }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  }

  if (pdfUrl) {
    return (
      <div className="rounded-2xl bg-gray-50 overflow-hidden">
        <iframe src={pdfUrl} className="w-full h-[600px] rounded-2xl" title="PDF Viewer" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-50 h-80 flex flex-col items-center justify-center gap-2">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3">
        {icon}
        <p className="text-sm font-semibold text-foreground">PDF Content</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Open PDF
        </button>
      </div>
    </div>
  );
}

function ArticleViewer({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-gray-50 h-80 flex flex-col items-center justify-center gap-2">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3">
        {icon}
        <p className="text-sm font-semibold text-foreground">Article Content</p>
        <p className="text-xs text-muted-foreground">Content viewer renders here</p>
      </div>
    </div>
  );
}
