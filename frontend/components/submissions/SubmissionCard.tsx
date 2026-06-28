"use client";

import Link from "next/link";
import { ImageIcon, ChevronRight, Trash2 } from "lucide-react";
import { Submission, Verdict } from "@/types";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

function summarizeVerdicts(images: Submission["images"]) {
  const counts: Record<Verdict, number> = {
    APPROVED: 0,
    FLAGGED: 0,
    BLOCKED: 0,
  };
  images.forEach((img) => counts[img.verdict]++);
  return counts;
}

export function SubmissionCard({
  submission,
  onDelete,
  deleting = false,
}: {
  submission: Submission;
  onDelete?: (submissionId: string) => void;
  deleting?: boolean;
}) {
  const counts = summarizeVerdicts(submission.images);

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all hover:shadow-card hover:border-teal-300">
      <Link
        href={`/submissions/${submission._id}`}
        className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-xl"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">
            {submission.images.length}{" "}
            {submission.images.length === 1 ? "image" : "images"} submitted
          </p>
          <p className="text-sm text-ink-faint mt-0.5">
            {formatDate(submission.createdAt)}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {counts.BLOCKED > 0 && <VerdictBadge verdict="BLOCKED" size="sm" />}
          {counts.FLAGGED > 0 && <VerdictBadge verdict="FLAGGED" size="sm" />}
          {counts.APPROVED > 0 && <VerdictBadge verdict="APPROVED" size="sm" />}
        </div>

        <ChevronRight
          className="h-5 w-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      {onDelete && (
        <Button
          type="button"
          size="sm"
          variant="outlineDanger"
          onClick={() => onDelete(submission._id)}
          disabled={deleting}
          aria-label="Delete submission"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {deleting ? "Deleting..." : "Delete"}
          </span>
        </Button>
      )}
    </div>
  );
}
