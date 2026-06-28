import {
  Flame,
  Skull,
  HeartCrack,
  Megaphone,
  Crosshair,
  MessageSquareWarning,
  ShieldCheck,
} from "lucide-react";
import {
  ModerationCategory,
  DefaultModerationCategory,
  getCategoryLabel,
} from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<DefaultModerationCategory, typeof Flame> = {
  GRAPHIC_VIOLENCE: Flame,
  HATE_SYMBOLS: Skull,
  SELF_HARM: HeartCrack,
  EXTREMIST_PROPAGANDA: Megaphone,
  WEAPONS_CONTRABAND: Crosshair,
  HARASSMENT_HUMILIATION: MessageSquareWarning,
};

export function CategoryBadge({
  category,
  active = false,
}: {
  category: ModerationCategory;
  active?: boolean;
}) {
  const Icon =
    CATEGORY_ICONS[category as DefaultModerationCategory] || ShieldCheck;

  const label = getCategoryLabel(category);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        active
          ? "bg-coral-50 text-coral-700 border-coral-100"
          : "bg-surface-muted text-ink-muted border-border",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
