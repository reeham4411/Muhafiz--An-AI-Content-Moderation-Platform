import { AlertTriangle, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-coral-100 bg-coral-50 px-6 py-16 text-center"
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
        <AlertTriangle className="h-6 w-6 text-coral-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-6">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

type AlertTone = "error" | "success" | "info" | "warning";

const ALERT_CONFIG: Record<AlertTone, { classes: string; icon: typeof Info }> = {
  error: { classes: "bg-coral-50 border-coral-100 text-coral-700", icon: AlertTriangle },
  success: { classes: "bg-emerald-50 border-emerald-100 text-emerald-700", icon: CheckCircle2 },
  info: { classes: "bg-teal-50 border-teal-100 text-teal-700", icon: Info },
  warning: { classes: "bg-amber-50 border-amber-100 text-amber-700", icon: AlertTriangle },
};

export function Alert({ tone = "info", children }: { tone?: AlertTone; children: React.ReactNode }) {
  const config = ALERT_CONFIG[tone];
  const Icon = config.icon;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${config.classes}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
