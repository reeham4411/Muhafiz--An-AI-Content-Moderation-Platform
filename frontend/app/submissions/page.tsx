"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ImageIcon, Upload } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState, Alert } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/LoadingState";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  SubmissionFilters,
  FilterState,
} from "@/components/submissions/SubmissionFilters";
import { Pagination } from "@/components/ui/Pagination";
import { getMySubmissions, deleteSubmission } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { Submission, Pagination as PaginationType } from "@/types";

export default function SubmissionsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SubmissionsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SubmissionsContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    outcome: "ALL",
    category: "ALL",
    from: "",
    to: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getMySubmissions({
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

  const handleDeleteSubmission = async () => {
    if (!deleteTargetId) return;

    setDeletingId(deleteTargetId);
    setError(null);
    setSuccessMsg(null);

    try {
      await deleteSubmission(deleteTargetId);

      setSubmissions((prev) =>
        prev.filter((submission) => submission._id !== deleteTargetId),
      );

      setSuccessMsg("Submission deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
      setDeleteTargetId(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Submission history"
        description="Browse and filter every batch of images you've submitted for moderation."
        actions={
          <Button asChild>
            <Link href="/upload">
              <Upload className="h-4 w-4" />
              Upload images
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <SubmissionFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No submissions found"
          description="Try adjusting your filters, or upload a new batch of images to get started."
          action={
            <Button asChild>
              <Link href="/upload">Upload images</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <SubmissionCard
              key={s._id}
              submission={s}
              onDelete={(submissionId) => setDeleteTargetId(submissionId)}
              deleting={deletingId === s._id}
            />
          ))}
          <DeleteConfirmModal
            open={!!deleteTargetId}
            onOpenChange={(open) => {
              if (!open) setDeleteTargetId(null);
            }}
            title="Delete submission?"
            description="This will permanently delete this full submission batch and all images inside it."
            confirmLabel="Delete submission"
            loading={!!deletingId}
            onConfirm={handleDeleteSubmission}
          />
        </div>
      )}

      {pagination && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
