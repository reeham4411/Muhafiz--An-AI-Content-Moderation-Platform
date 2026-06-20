import { Submission, CATEGORY_LABELS } from "@/types";
import { formatDate, formatConfidence, formatFileSize } from "./format";

// Builds a plain-text moderation report and triggers a browser download.
// No backend endpoint exists for this — it's generated entirely client-side
// from data already available on the submission detail page.
export function downloadSubmissionReport(submission: Submission): void {
  const lines: string[] = [];

  lines.push("AI CONTENT MODERATION REPORT");
  lines.push("=".repeat(60));
  lines.push(`Submission ID: ${submission._id}`);
  lines.push(`Submitted: ${formatDate(submission.createdAt)}`);
  lines.push(`Total images: ${submission.images.length}`);
  lines.push("");

  submission.images.forEach((image, idx) => {
    lines.push("-".repeat(60));
    lines.push(`IMAGE ${idx + 1}: ${image.fileName}`);
    lines.push("-".repeat(60));
    lines.push(`Verdict: ${image.verdict}`);
    lines.push(`Uploaded: ${formatDate(image.createdAt)}`);
    lines.push(`Size: ${formatFileSize(image.sizeBytes)}`);
    lines.push(`Provider: ${image.provider}`);
    lines.push(`Overridden: ${image.overridden ? "Yes" : "No"}`);
    if (image.overridden && image.overrideReason) {
      lines.push(`Override reason: ${image.overrideReason}`);
    }
    lines.push("");
    lines.push("Category breakdown:");
    if (image.categoryBreakdown.length === 0) {
      lines.push("  (no categories were evaluated)");
    } else {
      image.categoryBreakdown.forEach((c) => {
        lines.push(`  • ${CATEGORY_LABELS[c.category]}`);
        lines.push(`    Violation detected: ${c.violationDetected ? "Yes" : "No"}`);
        lines.push(`    Confidence: ${formatConfidence(c.confidenceScore)} (threshold: ${formatConfidence(c.thresholdUsed)})`);
        lines.push(`    Enforcement: ${c.enforcementUsed}`);
        lines.push(`    Contributed to verdict: ${c.contributedToVerdict ? "Yes" : "No"}`);
        lines.push(`    Reasoning: ${c.reasoning}`);
        lines.push("");
      });
    }
  });

  lines.push("=".repeat(60));
  lines.push(`Report generated: ${new Date().toLocaleString()}`);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `moderation-report-${submission._id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
