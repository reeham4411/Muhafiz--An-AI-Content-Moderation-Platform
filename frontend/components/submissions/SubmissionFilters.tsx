"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Verdict, ModerationCategory, ALL_CATEGORIES, CATEGORY_LABELS } from "@/types";
import { Select } from "@/components/ui/Select";
import { Input, Label } from "@/components/ui/Input";

export interface FilterState {
  outcome: Verdict | "ALL";
  category: ModerationCategory | "ALL";
  from: string;
  to: string;
}

export function SubmissionFilters({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  const hasActiveFilters =
    filters.outcome !== "ALL" || filters.category !== "ALL" || filters.from || filters.to;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-ink">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ outcome: "ALL", category: "ALL", from: "", to: "" })}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-coral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="filter-outcome">Verdict</Label>
          <Select
            ariaLabel="Filter by verdict"
            value={filters.outcome}
            onValueChange={(v) => onChange({ ...filters, outcome: v as FilterState["outcome"] })}
            options={[
              { value: "ALL", label: "All verdicts" },
              { value: "APPROVED", label: "Approved" },
              { value: "FLAGGED", label: "Flagged" },
              { value: "BLOCKED", label: "Blocked" },
            ]}
          />
        </div>

        <div>
          <Label htmlFor="filter-category">Category</Label>
          <Select
            ariaLabel="Filter by category"
            value={filters.category}
            onValueChange={(v) => onChange({ ...filters, category: v as FilterState["category"] })}
            options={[
              { value: "ALL", label: "All categories" },
              ...ALL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
            ]}
          />
        </div>

        <div>
          <Label htmlFor="filter-from">From date</Label>
          <Input
            id="filter-from"
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="filter-to">To date</Label>
          <Input
            id="filter-to"
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
