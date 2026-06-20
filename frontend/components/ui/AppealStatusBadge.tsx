import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { AppealStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<AppealStatus, { label: string; icon: typeof Clock; classes: string }> = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    classes: "bg-slate-100 text-slate-700 border-slate-300",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    classes: "bg-coral-50 text-coral-700 border-coral-100",
  },
};

export function AppealStatusBadge({ status }: { status: AppealStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold",
        config.classes
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
