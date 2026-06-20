"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { Alert } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/LoadingState";
import { PolicyCard } from "@/components/admin/PolicyCard";
import { getPolicies, updatePolicy } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { Policy } from "@/types";

export default function AdminPoliciesPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminPoliciesContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AdminPoliciesContent() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPolicies(await getPolicies());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (
    policyId: string,
    updates: { enabled: boolean; confidenceThreshold: number; enforcementBehavior: string }
  ) => {
    const updated = await updatePolicy(policyId, updates as Partial<Policy>);
    setPolicies((prev) => prev.map((p) => (p._id === policyId ? updated : p)));
  };

  return (
    <div>
      <PageHeader
        title="Moderation policies"
        description="Configure detection thresholds and enforcement behavior for each category."
      />

      <div className="mb-6">
        <Alert tone="info">
          <span className="font-medium">Changes only affect future submissions.</span> Every moderated
          image stores a snapshot of the policy configuration active at the time it was reviewed —
          updating a policy here will never alter the verdict of an existing submission.
        </Alert>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <PolicyCard key={policy._id} policy={policy} onSave={(updates) => handleSave(policy._id, updates)} />
          ))}
        </div>
      )}
    </div>
  );
}
