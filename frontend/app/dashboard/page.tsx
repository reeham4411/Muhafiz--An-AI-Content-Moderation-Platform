"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, ImageIcon, ShieldX, ShieldAlert, Gavel, ArrowRight } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { useAuth } from "@/lib/auth";
import { getMySubmissions, getMyAppeals } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { Submission, Appeal } from "@/types";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, appealRes] = await Promise.all([
        getMySubmissions({ page: 1, limit: 5 }),
        getMyAppeals(),
      ]);
      setSubmissions(subRes.submissions);
      setAppeals(appealRes);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;

  const allImages = submissions.flatMap((s) => s.images);
  const blockedCount = allImages.filter((i) => i.verdict === "BLOCKED").length;
  const flaggedCount = allImages.filter((i) => i.verdict === "FLAGGED").length;
  const pendingAppeals = appeals.filter((a) => a.status === "PENDING").length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's a snapshot of your recent moderation activity."
        actions={
          <Button asChild>
            <Link href="/upload">
              <Upload className="h-4 w-4" />
              Upload images
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recent submissions" value={submissions.length} icon={ImageIcon} tone="teal" />
        <StatCard label="Blocked images" value={blockedCount} icon={ShieldX} tone="coral" />
        <StatCard label="Flagged images" value={flaggedCount} icon={ShieldAlert} tone="amber" />
        <StatCard label="Pending appeals" value={pendingAppeals} icon={Gavel} tone="slate" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-ink">Recent submissions</h2>
            <Link href="/submissions" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No submissions yet"
              description="Upload your first batch of images to see moderation verdicts appear here."
              action={
                <Button asChild>
                  <Link href="/upload">Upload images</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <SubmissionCard key={s._id} submission={s} />
              ))}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Appeal status</CardTitle>
            </CardHeader>
            <CardContent>
              {appeals.length === 0 ? (
                <p className="text-sm text-ink-muted">You haven&apos;t filed any appeals yet.</p>
              ) : (
                <div className="space-y-3">
                  {appeals.slice(0, 4).map((a) => (
                    <div key={a._id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted truncate pr-3">{a.justification.slice(0, 40)}…</span>
                      <span
                        className={
                          a.status === "ACCEPTED"
                            ? "text-emerald-700 font-medium shrink-0"
                            : a.status === "REJECTED"
                            ? "text-coral-700 font-medium shrink-0"
                            : "text-slate-600 font-medium shrink-0"
                        }
                      >
                        {a.status === "PENDING" ? "Pending" : a.status === "ACCEPTED" ? "Accepted" : "Rejected"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/appeals" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
                View all appeals <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
