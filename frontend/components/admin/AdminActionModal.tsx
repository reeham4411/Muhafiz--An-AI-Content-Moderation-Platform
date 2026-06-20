"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/ErrorState";
import { Verdict, ModeratedImage } from "@/types";
import { getErrorMessage } from "@/lib/api";

export function OverrideModal({
  open,
  onOpenChange,
  image,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ModeratedImage | null;
  onSubmit: (verdict: Verdict, reason: string) => Promise<void>;
}) {
  const [verdict, setVerdict] = useState<Verdict>("APPROVED");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 3) {
      setError("Please provide a reason for this override.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(verdict, reason.trim());
      setReason("");
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Override verdict"
        description={image ? `Manually set a new verdict for "${image.fileName}"` : undefined}
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <div>
            <Label htmlFor="override-verdict">New verdict</Label>
            <Select
              ariaLabel="New verdict"
              value={verdict}
              onValueChange={(v) => setVerdict(v as Verdict)}
              options={[
                { value: "APPROVED", label: "Approved" },
                { value: "FLAGGED", label: "Flagged" },
                { value: "BLOCKED", label: "Blocked" },
              ]}
            />
          </div>

          <div>
            <Label htmlFor="override-reason">Reason</Label>
            <Textarea
              id="override-reason"
              rows={3}
              placeholder="Explain why this verdict is being changed…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <FieldError>{reason.trim().length > 0 && reason.trim().length < 3 ? "Reason is too short." : undefined}</FieldError>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Apply override
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
