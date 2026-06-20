"use client";

import { useEffect, useState, useCallback } from "react";
import { ImageIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Alert } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/LoadingState";
import { SubmissionFilters, FilterState } from "@/components/submissions/SubmissionFilters";
import { Pagination } from "@/components/ui/Pagination";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Button } from "@/components/ui/Button";
import { OverrideModal } from "@/components/admin/AdminActionModal";
import { getAllSubmissions, overrideSubmission } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Submission, ModeratedImage, Pagination as PaginationType, User, Verdict } from "@/types";

export default function AdminSubmissionsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminSubmissionsContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

function userLabel(user: string | User): string {
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown user";
}

function AdminSubmissionsContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ outcome: "ALL", category: "ALL", from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [overrideTarget, setOverrideTarget] = useState<{ submission: Submission; image: ModeratedImage } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllSubmissions({
        outcome: filters.outcome === "ALL" ? undefined : filters.outcome,
        category: filters.category === "ALL" ? undefined : filters.category,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        limit: 10,
      });
      setSubmissions(res.submissions);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  const openOverride = (submission: Submission, image: ModeratedImage) => {
    setOverrideTarget({ submission, image });
    setModalOpen(true);
  };

  const handleOverrideSubmit = async (verdict: Verdict, reason: string) => {
    if (!overrideTarget) return;
    await overrideSubmission(overrideTarget.submission._id, overrideTarget.image._id, verdict, reason);
    setSuccessMsg(`Verdict updated to ${verdict} for "${overrideTarget.image.fileName}".`);
    setTimeout(() => setSuccessMsg(null), 4000);
    load();
  };

  return (
    <div>
      <PageHeader title="All submissions" description="Review every image submitted across the platform." />

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      <div className="mb-6">
        <SubmissionFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : submissions.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No submissions found" description="Try adjusting your filters." />
      ) : (
        <div className="space-y-5">
          {submissions.map((submission) => (
            <div key={submission._id} className="rounded-2xl border border-border bg-surface shadow-soft overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-muted/50 px-5 py-3">
                <span className="text-sm font-medium text-ink">{userLabel(submission.user)}</span>
                <span className="text-xs text-ink-faint">{formatDate(submission.createdAt)}</span>
              </div>
              <div className="divide-y divide-border">
                {submission.images.map((image) => (
                  <div key={image._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{image.fileName}</p>
                      <p className="text-xs text-ink-faint mt-0.5">
                        {image.provider} {image.overridden && "· Manually overridden"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <VerdictBadge verdict={image.verdict} size="sm" />
                      <Button size="sm" variant="secondary" onClick={() => openOverride(submission, image)}>
                        Override
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <OverrideModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        image={overrideTarget?.image ?? null}
        onSubmit={handleOverrideSubmit}
      />
    </div>
  );
}
