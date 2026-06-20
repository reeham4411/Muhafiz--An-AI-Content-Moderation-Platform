import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Verdict } from "@/types";
import { cn } from "@/lib/utils";

const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; icon: typeof ShieldCheck; classes: string }
> = {
  APPROVED: {
    label: "Approved",
    icon: ShieldCheck,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  FLAGGED: {
    label: "Flagged",
    icon: ShieldAlert,
    classes: "bg-amber-50 text-amber-700 border-amber-100",
  },
  BLOCKED: {
    label: "Blocked",
    icon: ShieldX,
    classes: "bg-coral-50 text-coral-700 border-coral-100",
  },
};

export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: Verdict;
  size?: "sm" | "md" | "lg";
}) {
  const config = VERDICT_CONFIG[verdict];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3.5 py-1.5 gap-2",
  };
  const iconSizes = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4.5 w-4.5" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        config.classes,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
      {config.label}
    </span>
  );
}
