"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, MinusCircle } from "lucide-react";
import { CategoryBreakdown, CATEGORY_LABELS } from "@/types";
import { formatConfidence } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CategoryBreakdownList({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  if (breakdown.length === 0) {
    return (
      <p className="text-sm text-ink-faint italic">
        No categories were evaluated (all categories disabled at moderation time).
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {breakdown.map((item) => (
        <CategoryBreakdownRow key={item.category} item={item} />
      ))}
    </div>
  );
}

function CategoryBreakdownRow({ item }: { item: CategoryBreakdown }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        item.contributedToVerdict ? "border-coral-100 bg-coral-50/40" : "border-border bg-white"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-xl"
      >
        <div className="flex items-center gap-3 min-w-0">
          {item.contributedToVerdict ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-100 text-coral-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <MinusCircle className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{CATEGORY_LABELS[item.category]}</p>
            <p className="text-xs text-ink-faint">
              {item.contributedToVerdict ? "Contributed to verdict" : "Below threshold"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm font-semibold text-ink">
            {formatConfidence(item.confidenceScore)}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-ink-faint transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border/60 px-4 py-3.5 text-sm space-y-2.5 animate-fade-in">
          <p className="text-ink-muted">{item.reasoning}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
            <Detail label="Violation" value={item.violationDetected ? "Detected" : "Not detected"} />
            <Detail label="Threshold" value={formatConfidence(item.thresholdUsed)} />
            <Detail label="Enforcement" value={item.enforcementUsed === "AUTO_BLOCK" ? "Auto-block" : "Flag for review"} />
            <Detail label="Confidence" value={formatConfidence(item.confidenceScore)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-mono text-xs font-medium text-ink mt-0.5">{value}</p>
    </div>
  );
}
