"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ImageIcon, ShieldX, ShieldAlert, ShieldCheck, Gavel, TrendingUp,
  Settings2, BarChart3, Users, ArrowRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getAnalyticsOverview } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { AnalyticsOverview } from "@/types";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminDashboardContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

const LINK_CARDS = [
  { href: "/admin/submissions", title: "All submissions", description: "Browse and override every moderated image.", icon: Users },
  { href: "/admin/appeals", title: "Appeals queue", description: "Review and resolve pending appeals.", icon: Gavel },
  { href: "/admin/policies", title: "Policies", description: "Tune thresholds and enforcement per category.", icon: Settings2 },
  { href: "/admin/analytics", title: "Analytics", description: "Verdict trends, top users, and appeal stats.", icon: BarChart3 },
];

function AdminDashboardContent() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAnalyticsOverview());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading admin overview…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!data) return null;

  const resolutionRate =
    data.appealStats.total > 0
      ? Math.round(((data.appealStats.accepted + data.appealStats.rejected) / data.appealStats.total) * 100)
      : 0;

  return (
    <div>
      <PageHeader title="Admin overview" description="Platform-wide moderation activity at a glance." />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total submissions" value={data.totalSubmissions} icon={ImageIcon} tone="teal" />
        <StatCard label="Blocked" value={data.verdictDistribution.BLOCKED ?? 0} icon={ShieldX} tone="coral" />
        <StatCard label="Flagged" value={data.verdictDistribution.FLAGGED ?? 0} icon={ShieldAlert} tone="amber" />
        <StatCard label="Approved" value={data.verdictDistribution.APPROVED ?? 0} icon={ShieldCheck} tone="emerald" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard label="Pending appeals" value={data.appealStats.pending} icon={Gavel} tone="slate" />
        <StatCard
          label="Appeal resolution rate"
          value={`${resolutionRate}%`}
          icon={TrendingUp}
          tone="teal"
          hint={`${data.appealStats.accepted} accepted · ${data.appealStats.rejected} rejected`}
        />
      </div>

      <h2 className="mt-10 mb-4 font-display text-lg font-semibold text-ink">Quick links</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LINK_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <card.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display font-semibold text-ink">{card.title}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">{card.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
              Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
