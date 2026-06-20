"use client";

import { useEffect, useState, useCallback } from "react";
import { Gavel } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Alert } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/LoadingState";
import { AppealStatusBadge } from "@/components/ui/AppealStatusBadge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ResolveAppealModal } from "@/components/admin/ResolveAppealModal";
import { getAllAppeals, resolveAppeal } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Appeal, AppealStatus, User } from "@/types";

export default function AdminAppealsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminAppealsContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

function userLabel(user: string | User): string {
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown user";
}

function AdminAppealsContent() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [statusFilter, setStatusFilter] = useState<AppealStatus | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [resolveTarget, setResolveTarget] = useState<Appeal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAppeals(statusFilter === "ALL" ? undefined : statusFilter);
      setAppeals(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openResolve = (appeal: Appeal) => {
    setResolveTarget(appeal);
    setModalOpen(true);
  };

  const handleResolve = async (decision: "ACCEPTED" | "REJECTED", response: string) => {
    if (!resolveTarget) return;
    await resolveAppeal(resolveTarget._id, decision, response || undefined);
    setSuccessMsg(`Appeal ${decision === "ACCEPTED" ? "accepted" : "rejected"} successfully.`);
    setTimeout(() => setSuccessMsg(null), 4000);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Appeals queue"
        description="Review user appeals and resolve them with a written response."
        actions={
          <div className="w-48">
            <Select
              ariaLabel="Filter appeals by status"
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as AppealStatus | "ALL")}
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "ACCEPTED", label: "Accepted" },
                { value: "REJECTED", label: "Rejected" },
                { value: "ALL", label: "All appeals" },
              ]}
            />
          </div>
        }
      />

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : appeals.length === 0 ? (
        <EmptyState icon={Gavel} title="No appeals here" description="There are no appeals matching this filter right now." />
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <div key={appeal._id} className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{userLabel(appeal.user)}</p>
                  <p className="text-xs text-ink-faint mt-0.5">Filed {formatDate(appeal.createdAt)}</p>
                </div>
                <AppealStatusBadge status={appeal.status} />
              </div>

              <div className="mt-4 rounded-xl bg-surface-muted p-4">
                <p className="text-xs font-medium text-ink-faint mb-1">User justification</p>
                <p className="text-sm text-ink">{appeal.justification}</p>
              </div>

              {appeal.adminResponse && (
                <div
                  className={`mt-3 rounded-xl p-4 border ${
                    appeal.status === "ACCEPTED" ? "bg-emerald-50 border-emerald-100" : "bg-coral-50 border-coral-100"
                  }`}
                >
                  <p className="text-xs font-medium text-ink-faint mb-1">Your response</p>
                  <p className={`text-sm ${appeal.status === "ACCEPTED" ? "text-emerald-800" : "text-coral-800"}`}>
                    {appeal.adminResponse}
                  </p>
                </div>
              )}

              {appeal.status === "PENDING" && (
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => openResolve(appeal)}>
                    Resolve appeal
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ResolveAppealModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        appeal={resolveTarget}
        onSubmit={handleResolve}
      />
    </div>
  );
}
