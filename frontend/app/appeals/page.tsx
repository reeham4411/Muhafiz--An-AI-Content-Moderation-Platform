"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Gavel, ExternalLink } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/LoadingState";
import { AppealStatusBadge } from "@/components/ui/AppealStatusBadge";
import { getMyAppeals } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Appeal } from "@/types";

export default function AppealsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AppealsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AppealsContent() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAppeals(await getMyAppeals());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="My appeals" description="Track the status of every appeal you've filed." />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : appeals.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No appeals filed"
          description="If an image is flagged or blocked, you can file an appeal from its submission detail page."
        />
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <div key={appeal._id} className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-faint">Filed {formatDate(appeal.createdAt)}</p>
                  <Link
                    href={`/submissions/${appeal.submission}`}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline"
                  >
                    View related submission <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <AppealStatusBadge status={appeal.status} />
              </div>

              <div className="mt-4 rounded-xl bg-surface-muted p-4">
                <p className="text-xs font-medium text-ink-faint mb-1">Your justification</p>
                <p className="text-sm text-ink">{appeal.justification}</p>
              </div>

              {appeal.adminResponse && (
                <div
                  className={`mt-3 rounded-xl p-4 border ${
                    appeal.status === "ACCEPTED"
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-coral-50 border-coral-100"
                  }`}
                >
                  <p className="text-xs font-medium text-ink-faint mb-1">Admin response</p>
                  <p className={`text-sm ${appeal.status === "ACCEPTED" ? "text-emerald-800" : "text-coral-800"}`}>
                    {appeal.adminResponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
