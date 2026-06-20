"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Alert } from "@/components/ui/ErrorState";
import { ImageResultCard } from "@/components/submissions/ImageResultCard";
import { FileAppealModal } from "@/components/upload/FileAppealModal";
import { getSubmissionById, createAppeal } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { downloadSubmissionReport } from "@/lib/report";
import { Submission, ModeratedImage } from "@/types";

export default function SubmissionDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SubmissionDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SubmissionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [appealTarget, setAppealTarget] = useState<ModeratedImage | null>(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealedIds, setAppealedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sub = await getSubmissionById(id);
      setSubmission(sub);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAppealRequest = (image: ModeratedImage) => {
    setAppealTarget(image);
    setAppealModalOpen(true);
  };

  const handleAppealSubmit = async (justification: string) => {
    if (!submission || !appealTarget) return;
    await createAppeal(submission._id, appealTarget._id, justification);
    setAppealedIds((prev) => new Set(prev).add(appealTarget._id));
    setSuccessMsg("Appeal submitted successfully. You can track its status on the My Appeals page.");
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  if (loading) return <LoadingState label="Loading submission…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!submission) return null;

  return (
    <div>
      <button
        onClick={() => router.push("/submissions")}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to submission history
      </button>

      <PageHeader
        title="Submission details"
        description={`Submitted ${formatDate(submission.createdAt)} · ${submission.images.length} ${
          submission.images.length === 1 ? "image" : "images"
        }`}
        actions={
          <Button variant="secondary" onClick={() => downloadSubmissionReport(submission)}>
            <Download className="h-4 w-4" />
            Download report
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      <div className="space-y-4">
        {submission.images.map((image) => (
          <ImageResultCard
            key={image._id}
            image={image}
            onAppeal={() => handleAppealRequest(image)}
            appealDisabled={appealedIds.has(image._id)}
            appealLabel={appealedIds.has(image._id) ? "Appeal submitted" : "File appeal"}
          />
        ))}
      </div>

      <FileAppealModal
        open={appealModalOpen}
        onOpenChange={setAppealModalOpen}
        image={appealTarget}
        onSubmit={handleAppealSubmit}
      />
    </div>
  );
}
