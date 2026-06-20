"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/ErrorState";
import { ModeratedImage } from "@/types";
import { getErrorMessage } from "@/lib/api";

export function FileAppealModal({
  open,
  onOpenChange,
  image,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ModeratedImage | null;
  onSubmit: (justification: string) => Promise<void>;
}) {
  const [justification, setJustification] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tooShort = justification.trim().length > 0 && justification.trim().length < 10;

  const handleSubmit = async () => {
    if (justification.trim().length < 10) {
      setError("Justification must be at least 10 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(justification.trim());
      setJustification("");
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
        title="File an appeal"
        description={image ? `Explain why "${image.fileName}" was incorrectly moderated.` : undefined}
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <div>
            <Label htmlFor="justification">Justification</Label>
            <Textarea
              id="justification"
              rows={4}
              placeholder="This image was flagged incorrectly because…"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              aria-invalid={tooShort}
            />
            <FieldError>{tooShort ? "At least 10 characters required." : undefined}</FieldError>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Submit appeal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
