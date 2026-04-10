import React from "react";
import { cpdCategories } from "../data/categories";
import { cn } from "../lib/utils";
import { Headphones, FileText, Monitor, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import type { CompletedEducationItem, ContentType } from "../types";

interface TypeConfigEntry {
  bg: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const typeConfig: Partial<Record<ContentType, TypeConfigEntry>> = {
  audio:   { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones, label: "Podcast" },
  podcast: { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones, label: "Podcast" },
  pdf:     { bg: "bg-red-100",    color: "text-red-500",    Icon: FileText,   label: "PDF"     },
  url:     { bg: "bg-blue-100",   color: "text-blue-500",   Icon: Monitor,    label: "Video"   },
  text:    { bg: "bg-blue-100",   color: "text-blue-500",   Icon: BookOpen,   label: "Article" },
};

interface MyEducationProps {
  onSelectContent?: (item: CompletedEducationItem) => void;
  items: CompletedEducationItem[];
}

export function MyEducation({ onSelectContent, items }: MyEducationProps) {
  const totalPoints = items.reduce((s, i) => s + i.cpdPoints, 0);
  const totalHours = Math.floor(items.reduce((s, i) => s + i.duration, 0) / 60);
  const totalMins = items.reduce((s, i) => s + i.duration, 0) % 60;

  return (
    <div className="space-y-4">
      <div className="mt-[30px]">
        <h1 className="text-3xl font-bold tracking-tight">My Completed Education</h1>
        <p className="text-sm text-muted-foreground mt-1">Your full CPD activity history.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Activities Completed", value: items.length },
          { label: "Total CPD Points",     value: `${totalPoints.toFixed(2)} pts` },
          { label: "Total Time",           value: `${totalHours}h ${totalMins}m` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#e2e2e2] bg-white px-6 py-4">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const tc = typeConfig[item.type] ?? typeConfig.text!;
          const Icon = tc.Icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectContent?.(item)}
              className="w-full text-left flex items-start gap-4 px-6 py-4 rounded-2xl border border-[#e2e2e2] bg-white hover:shadow-sm transition-shadow"
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", tc.bg)}>
                <Icon size={18} className={tc.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.provider}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-2">{item.subtitle}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {cpdCategories.map((cat) => {
                    const active = item.categories.some((c) => c.name === cat.shortLabel || c.name === cat.label);
                    return (
                      <span key={cat.id} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400")}>
                        {cat.shortLabel}
                      </span>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={12} /> Completed {item.completedDate}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{tc.label}</span>
                  {item.isImported && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">Imported</span>
                    </>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className="bg-blue-100 text-[#1182E3] rounded-xl px-4 py-2 text-center min-w-[80px]">
                  <p className="text-lg font-bold leading-none">{item.cpdPoints}</p>
                  <p className="text-[10px] font-medium mt-0.5">CPD Points</p>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={10} /> {item.duration} min
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
