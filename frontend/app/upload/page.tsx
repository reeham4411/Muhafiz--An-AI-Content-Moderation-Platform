"use client";

import { useState } from "react";
import { UploadCloud, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/ErrorState";
import { ImageUploadDropzone, PendingFile } from "@/components/upload/ImageUploadDropzone";
import { ImageResultCard } from "@/components/submissions/ImageResultCard";
import { FileAppealModal } from "@/components/upload/FileAppealModal";
import { createSubmission, createAppeal } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { Submission, ModeratedImage } from "@/types";

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UploadContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function UploadContent() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Submission | null>(null);

  const [appealTarget, setAppealTarget] = useState<ModeratedImage | null>(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealedIds, setAppealedIds] = useState<Set<string>>(new Set());

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least one image to upload.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const submission = await createSubmission(files.map((f) => f.file));
      setResult(submission);
      setFiles([]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppealRequest = (image: ModeratedImage) => {
    setAppealTarget(image);
    setAppealModalOpen(true);
  };

  const handleAppealSubmit = async (justification: string) => {
    if (!result || !appealTarget) return;
    await createAppeal(result._id, appealTarget._id, justification);
    setAppealedIds((prev) => new Set(prev).add(appealTarget._id));
  };

  const startNewUpload = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div>
      <PageHeader
        title="Upload images"
        description="Submit one or more images for automated moderation. Results appear instantly below."
      />

      {!result && (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-soft">
          {error && (
            <div className="mb-5">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <ImageUploadDropzone files={files} onFilesChange={setFiles} disabled={submitting} />

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} loading={submitting} disabled={files.length === 0}>
              <UploadCloud className="h-4 w-4" />
              {submitting ? "Moderating images…" : `Submit ${files.length || ""} ${files.length === 1 ? "image" : "images"}`.trim()}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <Alert tone="success">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">
                Moderation complete — {result.images.length} {result.images.length === 1 ? "image" : "images"} reviewed.
              </span>
            </div>
          </Alert>

          <div className="space-y-4">
            {result.images.map((image) => (
              <ImageResultCard
                key={image._id}
                image={image}
                onAppeal={() => handleAppealRequest(image)}
                appealDisabled={appealedIds.has(image._id)}
                appealLabel={appealedIds.has(image._id) ? "Appeal submitted" : "File appeal"}
              />
            ))}
          </div>

          <Button variant="secondary" onClick={startNewUpload}>
            Upload more images
          </Button>
        </div>
      )}

      <FileAppealModal
        open={appealModalOpen}
        onOpenChange={setAppealModalOpen}
        image={appealTarget}
        onSubmit={handleAppealSubmit}
      />
    </div>
  );
}
