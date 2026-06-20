import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin text-teal-600" aria-hidden="true" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton mt-3 h-7 w-1/2" />
      <div className="skeleton mt-4 h-3 w-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="skeleton h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-1/3" />
        <div className="skeleton h-3 w-1/4" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  );
}
