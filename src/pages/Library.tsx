import { useState, useMemo } from "react";
import type { ComponentType } from "react";
import { contentItems } from "../data/content";
import { cn } from "../lib/utils";
import { Headphones, FileText, Monitor, BookOpen, Clock, ChevronDown } from "lucide-react";
import type { ContentItem, ContentType } from "../types";

interface TypeConfigEntry {
  bg: string;
  color: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const typeConfig: Partial<Record<ContentType, TypeConfigEntry>> = {
  audio: { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones, label: "Podcast" },
  podcast: { bg: "bg-orange-100", color: "text-orange-500", Icon: Headphones, label: "Podcast" },
  pdf:   { bg: "bg-red-100",    color: "text-red-500",    Icon: FileText,   label: "PDF"     },
  url:   { bg: "bg-blue-100",   color: "text-blue-500",   Icon: Monitor,    label: "Video"   },
  text:  { bg: "bg-purple-100", color: "text-purple-500", Icon: BookOpen,   label: "Article" },
};

interface Tab {
  value: string;
  label: string;
}
interface LibraryProps {
  onSelectContent: (item: ContentItem) => void;
}


const categoryOptions = [
  { value: "all",        label: "All Categories"                       },
  { value: "clientCare", label: "Client Care and Practice"             },
  { value: "general",    label: "General"                              },
  { value: "ethics",     label: "Professionalism and Ethics"           },
  { value: "regulatory", label: "Reg Compliance & Consumer Protection" },
  { value: "tax",        label: "Tax (Financial) Advice"               },
  { value: "technical",  label: "Technical Competence"                 },
];

const categoryMap: Record<string, string> = {
  clientCare: "Client Care & Practice",
  general:    "General",
  ethics:     "Professionalism & Ethics",
  regulatory: "Regulatory Compliance & Consumer Protection",
  tax:        "Tax (Financial) Advice",
  technical:  "Technical Competence",
};

export function Library({ onSelectContent }: LibraryProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("all");
  const [categoryOpen, setCategoryOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = contentItems;
    if (activeTab === "completed")   items = items.filter(i => i.status === "completed");
    else if (activeTab === "inProgress")  items = items.filter(i => i.status === "inProgress");
    else if (activeTab === "notStarted") items = items.filter(i => i.status === "notStarted");

    if (category !== "all") {
      const cat = categoryMap[category];
      items = items.filter(i => i.categories.some(c => c.name === cat));
    }
    return items;
  }, [activeTab, category]);

  const tabs: Tab[] = [
    { value: "all",        label: "All"         },
    { value: "notStarted", label: "Not Started" },
    { value: "completed",  label: "Completed"   },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">CPD Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse accredited CPD content. Complete the assessment to earn CPD points.
        </p>
      </div>

      {/* Tabs + Category dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeTab === t.value
                  ? "bg-foreground text-white"
                  : "bg-white border border-border text-foreground hover:bg-gray-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setCategoryOpen(o => !o)}
            className="flex items-center gap-1.5 pl-3 pr-[10px] py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            {categoryOptions.find(o => o.value === category)?.label}
            <ChevronDown size={14} className={cn("transition-transform", categoryOpen && "rotate-180")} />
          </button>
          {categoryOpen && (
            <div className="absolute right-0 top-10 z-20 min-w-[260px] rounded-xl border border-border bg-white shadow-lg overflow-hidden text-sm">
              {categoryOptions.map((opt, i) => (
                <div key={opt.value}>
                  {i > 0 && <div className="h-px bg-border mx-4" />}
                  <button
                    onClick={() => { setCategory(opt.value); setCategoryOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors",
                      category === opt.value ? "font-semibold text-blue-500" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No activities match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(item => (
            <ContentCard key={item.id} item={item} onSelect={() => onSelectContent(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ContentCardProps {
  item: ContentItem;
  onSelect: () => void;
}

function ContentCard({ item, onSelect }: ContentCardProps) {
  const tc = typeConfig[item.type] ?? typeConfig.text!;
  const Icon = tc.Icon;

  return (
    <div
      onClick={onSelect}
      className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Thumbnail — dark navy with centered icon circle */}
      <div className="h-[210px] bg-[#1a2744] flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
          <Icon size={32} className="text-[#1a2744]" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Title + description */}
        <div className="flex-1">
          <h3 className="text-sm font-bold leading-snug line-clamp-2">{item.title}</h3>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.description}</p>
        </div>

        {/* Category + CPD pts badges */}
        <div className="flex flex-wrap gap-1.5">
          {item.categories.map(cat => (
            <span key={cat.name} className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              {cat.name}
            </span>
          ))}
          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
            {item.cpdPoints} CPD Pts
          </span>
        </div>

        {/* Accreditation Points Allocation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">Accreditation Points Allocation:</p>
          {item.categories.map(cat => (
            <p key={cat.name} className="text-xs text-muted-foreground">
              {cat.pts.toFixed(2)} {cat.name}
            </p>
          ))}
          {item.subAreas && item.subAreas.length > 0 && (
            <div className="pt-1 space-y-1">
              <p className="text-xs font-semibold text-foreground">Sub Categories Area:</p>
              {item.subAreas.map(sub => (
                <p key={sub.name} className="text-xs text-muted-foreground">
                  {sub.pts.toFixed(2)} {sub.name}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1"><Clock size={11} /> {item.duration} min</span>
          <span className="flex items-center gap-1"><Icon size={11} className={tc.color} /> {tc.label}</span>
        </div>
      </div>
    </div>
  );
}
