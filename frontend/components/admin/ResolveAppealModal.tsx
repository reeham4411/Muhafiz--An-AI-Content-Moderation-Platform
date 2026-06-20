"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/ErrorState";
import { Appeal, AppealStatus } from "@/types";
import { getErrorMessage } from "@/lib/api";

export function ResolveAppealModal({
  open,
  onOpenChange,
  appeal,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appeal: Appeal | null;
  onSubmit: (decision: Extract<AppealStatus, "ACCEPTED" | "REJECTED">, response: string) => Promise<void>;
}) {
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"ACCEPTED" | "REJECTED" | null>(null);

  const handleDecision = async (decision: "ACCEPTED" | "REJECTED") => {
    setError(null);
    setSubmitting(decision);
    try {
      await onSubmit(decision, response.trim());
      setResponse("");
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Resolve appeal"
        description="Accepting will automatically override the image verdict to Approved."
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          {appeal && (
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="text-xs font-medium text-ink-faint mb-1">User justification</p>
              <p className="text-sm text-ink">{appeal.justification}</p>
            </div>
          )}

          <div>
            <Label htmlFor="admin-response">Admin response (optional)</Label>
            <Textarea
              id="admin-response"
              rows={3}
              placeholder="Add context for the user…"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outlineDanger"
              onClick={() => handleDecision("REJECTED")}
              loading={submitting === "REJECTED"}
              disabled={submitting !== null}
            >
              Reject appeal
            </Button>
            <Button
              onClick={() => handleDecision("ACCEPTED")}
              loading={submitting === "ACCEPTED"}
              disabled={submitting !== null}
            >
              Accept appeal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
