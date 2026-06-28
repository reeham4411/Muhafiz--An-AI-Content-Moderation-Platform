"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title = "Delete item?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-card animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-coral-50 text-coral-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-lg p-1 text-ink-faint transition hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close delete confirmation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3">
          <p className="text-sm font-medium text-coral-800">
            This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
