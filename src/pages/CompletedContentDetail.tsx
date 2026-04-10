import React, { useState } from "react";
import { FileSearch2, ChevronDown, ChevronUp, Pencil, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { subCategories } from "../data/categories";
import type { CompletedEducationItem } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompletedContentDetailProps {
  item: CompletedEducationItem;
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALL_CPD_CATEGORIES = [
  "General",
  "Regulatory Compliance and Consumer Protection",
  "Technical Competence",
  "Professionalism and Ethics",
  "Client Care and Practice",
  "Tax (Financial) Advice",
];

const JUSTIFICATIONS: Record<string, string> = {
  "Technical Competence":
    "Discusses AI applications in financial planning, including client communication and operational efficiency, enhancing technical skills in practice management.",
  "Client Care and Practice":
    "Covers how AI can improve client service through better communication and personalized advice, directly impacting client care practices.",
  "Professionalism and Ethics":
    "Addresses professional responsibilities in adopting AI tools, ethical considerations for client interactions, and industry standards compliance.",
  "Regulatory Compliance and Consumer Protection":
    "Covers regulatory frameworks applicable to the use of AI in financial advice, including consumer protection obligations.",
  "General":
    "Provides broad professional development relevant to financial advisers, including industry trends and strategic awareness.",
  "Tax (Financial) Advice":
    "Covers tax-related applications within financial planning and advice contexts.",
};

// Assessment reasoning cards (shown in 2-col blog card grid)
const ASSESSMENT_REASONS = [
  {
    badge: "Relevance",
    text: "The content aims to enhance skills in implementing AI systematically within financial practices, improving efficiency and client service.",
  },
  {
    badge: "Application",
    text: "The content discusses practical applications of AI in financial planning, which is directly related to financial advice and client service.",
  },
  {
    badge: "Knowledge",
    text: "The presentation provides intellectual content on AI applications, frameworks, and strategies for financial planning businesses.",
  },
  {
    badge: "Compliance",
    text: "The session covers topics relevant to financial planning practices, including compliance and client communication, which fall under legislated CPD areas.",
  },
];

// Source content document types
function buildSourceDocs(item: CompletedEducationItem) {
  return [
    {
      title: "Meeting Transcript and Key Insights",
      cpdPoints: (item.cpdPoints * 0.25).toFixed(2),
      assessmentNo: "WTGQ-05082025-0001",
      assessmentDate: item.completedDate,
      activityDate: item.completedDate,
      badges: ["Technical", "Client Care"],
    },
    {
      title: "Presentation Slides and Key Learnings",
      cpdPoints: (item.cpdPoints * 0.25).toFixed(2),
      assessmentNo: "WTGQ-05082025-0001",
      assessmentDate: item.completedDate,
      activityDate: item.completedDate,
      badges: ["General", "Professionalism"],
    },
    {
      title: "Meeting Transcript and CPD Learnings",
      cpdPoints: (item.cpdPoints * 0.25).toFixed(2),
      assessmentNo: "WTGQ-05082025-0001",
      assessmentDate: item.completedDate,
      activityDate: item.completedDate,
      badges: ["Technical", "Client Care"],
    },
    {
      title: "Documenting: Meeting Transcript and Analysis",
      cpdPoints: (item.cpdPoints * 0.25).toFixed(2),
      assessmentNo: "WTGQ-05082025-0001",
      assessmentDate: item.completedDate,
      activityDate: item.completedDate,
      badges: ["Technical", "General"],
    },
  ];
}

// ── Soft Badge component ──────────────────────────────────────────────────────

function SoftBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
      {label}
    </span>
  );
}

// ── Expert accordion ──────────────────────────────────────────────────────────

function ExpertAccordion({
  name,
  role,
  employer,
  bio,
  skills,
}: {
  name: string;
  role: string;
  employer: string;
  bio: string;
  skills: string[];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold">{name}</span>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-[#f0f0f0]">
          <p className="text-xs text-muted-foreground pt-3">
            <span className="font-medium text-foreground">Expert Role:</span> {role} &nbsp;
            <span className="font-medium text-foreground">Expert Employer:</span> {employer}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s) => (
              <SoftBadge key={s} label={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompletedContentDetail({ item, onBack }: CompletedContentDetailProps) {
  const sourceDocs = buildSourceDocs(item);
  const assessmentNo = "ENSO-25111803-58180001";

  // Build category map: name → pts (null = not allocated)
  const catMap: Record<string, number | null> = {};
  ALL_CPD_CATEGORIES.forEach((cat) => { catMap[cat] = null; });
  item.categories.forEach((c) => {
    const match = ALL_CPD_CATEGORIES.find(
      (k) => k.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(k.toLowerCase().split(" ")[0])
    );
    if (match) catMap[match] = c.pts;
  });

  // Build subcategory rows
  const subAreaRows = (item.subAreas ?? []).map((sa) => {
    const match = subCategories.find((s) => s.id === sa.name || s.label.toLowerCase().includes(sa.name.toLowerCase()));
    return { label: match?.label ?? sa.name, pts: sa.pts };
  });

  // Pad to multiple of 4 for 4-col grid
  while (subAreaRows.length % 4 !== 0) {
    subAreaRows.push({ label: "—", pts: null as unknown as number });
  }
  const subAreaChunks: typeof subAreaRows[] = [];
  for (let i = 0; i < subAreaRows.length; i += 4) {
    subAreaChunks.push(subAreaRows.slice(i, i + 4));
  }

  return (
    <div className="space-y-5">

      {/* ── Header card (node 732:2267 — Group 36922) ────────────────────────── */}
      <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
        {/* Top section: title + edit icon + subtitle | export on right */}
        <div className="px-8 pt-5 pb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-start gap-2">
              <h1 className="text-[17px] font-bold leading-snug">
                Combine Assessment - {item.completedDate}
              </h1>
              <button className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Pencil size={14} />
              </button>
            </div>
            <p className="text-[14px] font-semibold mt-1" style={{color: "#1182E3"}}>
              External Assessment - Certificate
            </p>
          </div>
          <button className="flex items-center gap-2 shrink-0 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <span className="font-semibold">Export Entire Report to PDF</span>
            <button className="w-10 h-10 rounded-full bg-[#1182E3] flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
          </button>
        </div>

        {/* Full-width separator (Line 35) */}
        <div className="h-px bg-[#e8e8e8]" />

        {/* Bottom metadata row: 4 columns */}
        <div className="grid grid-cols-4 px-8 py-5">
          <div>
            <p className="text-[12px] text-muted-foreground">Assessment Number:</p>
            <p className="text-[14px] font-semibold mt-1 text-[#1182E3]">{assessmentNo}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Total CPD Points:</p>
            <p className="text-[14px] font-bold text-[#1182E3] mt-1">{item.cpdPoints.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Assessment Date:</p>
            <p className="text-[14px] font-semibold mt-1 text-[#1182E3]">{item.completedDate}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Activity Date:</p>
            <p className="text-[14px] font-semibold mt-1 text-[#1182E3]">{item.completedDate}</p>
          </div>
        </div>
      </div>

      {/* ── Blog component card (node 732:2255) ─────────────────────────────── */}
      <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
        {/* Heading row */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-[15px] font-semibold">Assessment Activity</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{item.completedDate}</span>
            <button className="hover:text-foreground transition-colors">
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

        {/* Separator (Line 36) */}
        <div className="h-px bg-[#e8e8e8]" />

        {/* CPD breakdown table (Frame 37098) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[#f0f0f0] text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium w-[108px]">Activity</th>
                <th className="text-left px-2 py-3 font-medium w-[90px]">Type</th>
                <th className="text-center px-2 py-3 font-medium w-[100px]">Technical</th>
                <th className="text-center px-2 py-3 font-medium w-[85px]">Regulatory</th>
                <th className="text-center px-2 py-3 font-medium w-[95px]">Client Care</th>
                <th className="text-center px-2 py-3 font-medium w-[98px]">Professionalism</th>
                <th className="text-center px-2 py-3 font-medium w-[56px]">General</th>
                <th className="text-center px-2 py-3 font-medium w-[67px]">Tax</th>
                <th className="text-center px-2 py-3 font-medium w-[53px]">Total</th>
                <th className="text-center px-2 py-3 font-medium w-[82px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#f5f5f5]">
                <td className="px-4 py-3 font-medium text-[12px] leading-tight">{item.title.length > 30 ? item.title.slice(0, 30) + "…" : item.title}</td>
                <td className="px-2 py-3 text-muted-foreground capitalize">{item.type}</td>
                {ALL_CPD_CATEGORIES.map((cat) => {
                  const pts = catMap[cat];
                  return (
                    <td key={cat} className="px-2 py-3 text-center">
                      {pts ? (
                        <span className="font-semibold text-[#1182E3]">{pts.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-3 text-center font-bold text-[#1182E3]">{item.cpdPoints.toFixed(2)}</td>
                <td className="px-2 py-3 text-center">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <FileSearch2 size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Source Content ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <p className="font-semibold text-sm">Source Content</p>
        </div>
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_130px_130px_40px] gap-x-4 px-6 py-2 bg-gray-50 border-b border-[#f0f0f0] text-xs text-muted-foreground font-medium">
          <span>Title</span>
          <span className="text-right">CPD Points</span>
          <span>Assessment Date</span>
          <span>Activity Date</span>
          <span />
        </div>
        {sourceDocs.map((doc, i) => (
          <div key={i} className={cn("grid grid-cols-[1fr_80px_130px_130px_40px] gap-x-4 items-center px-6 py-4", i < sourceDocs.length - 1 && "border-b border-[#f5f5f5]")}>
            <div>
              <p className="text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.assessmentNo}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {doc.badges.map((b) => <SoftBadge key={b} label={b} />)}
              </div>
            </div>
            <span className="text-sm font-semibold text-[#1182E3] text-right">{doc.cpdPoints}</span>
            <span className="text-xs text-muted-foreground">{doc.assessmentDate}</span>
            <span className="text-xs text-muted-foreground">{doc.activityDate}</span>
            <button className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <FileSearch2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* ── CPD Category Assessment cards (2-col × 3 rows) ──────────────────── */}
      <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f0f0]">
          <p className="font-semibold text-sm">CPD Category Assessment</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
          {ALL_CPD_CATEGORIES.map((cat, i) => {
            const pts = catMap[cat];
            const hasPoints = pts !== null && pts > 0;
            const justification = hasPoints ? JUSTIFICATIONS[cat] : null;
            return (
              <div key={cat} className={cn("p-5", i >= 2 && "border-t border-[#f0f0f0]")}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold leading-snug">{cat}</p>
                  <span className={cn("text-sm font-bold shrink-0", hasPoints ? "text-[#1182E3]" : "text-muted-foreground")}>
                    {hasPoints ? pts!.toFixed(2) : "—"}
                  </span>
                </div>
                {justification && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{justification}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CPD Subcategories 4-col grid ─────────────────────────────────────── */}
      {subAreaChunks.length > 0 && (
        <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <p className="font-semibold text-sm">CPD Subcategories</p>
          </div>
          <div className="p-4 space-y-1">
            {subAreaChunks.map((row, ri) => (
              <div key={ri} className="grid grid-cols-4">
                {row.map((cell, ci) => (
                  <div key={ci} className="flex items-center gap-3 px-3 py-3 border border-[#f5f5f5] rounded-lg m-1">
                    <div className={cn(
                      "h-9 w-12 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold",
                      cell.pts ? "bg-blue-50 text-[#1182E3]" : "bg-gray-100 text-muted-foreground"
                    )}>
                      {cell.pts ? cell.pts.toFixed(2) : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">{cell.label}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Expert Details ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#e2e2e2] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f0f0]">
          <p className="font-semibold text-sm">Expert Details</p>
        </div>
        <div className="p-5 space-y-3">
          <ExpertAccordion
            name={item.provider}
            role="Co-Founder and Director"
            employer={item.provider}
            bio={`Co-Founder and Director at ${item.provider} since 2008. Professional with extensive experience in financial services and CPD content delivery.`}
            skills={["Financial Planning", "Compliance", "Client Care", "Superannuation", "Retirement Planning"]}
          />
          <ExpertAccordion
            name="Clayton Daniels"
            role="Chief Executive Officer"
            employer="Ensombl"
            bio="Chief Executive Officer at Ensombl. Extensive background in financial advisory, fintech, and professional development for financial advisers."
            skills={["Cash Flow", "Estate Planning", "Financial Advisory", "Investment Strategies", "Wealth Management", "Superannuation"]}
          />
        </div>
      </div>
    </div>
  );
}
