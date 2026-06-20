"use client";

import { useState } from "react";
import { Flame, Skull, HeartCrack, Megaphone, Crosshair, MessageSquareWarning, Loader2 } from "lucide-react";
import { Policy, ModerationCategory, CATEGORY_LABELS } from "@/types";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<ModerationCategory, typeof Flame> = {
  GRAPHIC_VIOLENCE: Flame,
  HATE_SYMBOLS: Skull,
  SELF_HARM: HeartCrack,
  EXTREMIST_PROPAGANDA: Megaphone,
  WEAPONS_CONTRABAND: Crosshair,
  HARASSMENT_HUMILIATION: MessageSquareWarning,
};

export function PolicyCard({
  policy,
  onSave,
}: {
  policy: Policy;
  onSave: (updates: { enabled: boolean; confidenceThreshold: number; enforcementBehavior: string }) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(policy.enabled);
  const [threshold, setThreshold] = useState(policy.confidenceThreshold);
  const [enforcement, setEnforcement] = useState(policy.enforcementBehavior);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const Icon = CATEGORY_ICONS[policy.category];
  const dirty =
    enabled !== policy.enabled || threshold !== policy.confidenceThreshold || enforcement !== policy.enforcementBehavior;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave({ enabled, confidenceThreshold: threshold, enforcementBehavior: enforcement });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface p-6 shadow-soft transition-colors",
        enabled ? "border-border" : "border-border bg-surface-muted/40"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              enabled ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-ink">{CATEGORY_LABELS[policy.category]}</h3>
            <p className="text-xs text-ink-faint mt-0.5">{enabled ? "Active" : "Disabled"}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} label={`Enable ${CATEGORY_LABELS[policy.category]}`} />
      </div>

      <div className={cn("mt-5 space-y-4 transition-opacity", !enabled && "opacity-50 pointer-events-none")}>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor={`threshold-${policy._id}`} className="mb-0">
              Confidence threshold
            </Label>
            <span className="font-mono text-sm font-semibold text-teal-700">
              {Math.round(threshold * 100)}%
            </span>
          </div>
          <input
            id={`threshold-${policy._id}`}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full accent-teal-600 h-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-full"
            aria-label={`Confidence threshold for ${CATEGORY_LABELS[policy.category]}`}
          />
        </div>

        <div>
          <Label htmlFor={`enforcement-${policy._id}`}>Enforcement behavior</Label>
          <Select
            ariaLabel={`Enforcement behavior for ${CATEGORY_LABELS[policy.category]}`}
            value={enforcement}
            onValueChange={(v) => setEnforcement(v as Policy["enforcementBehavior"])}
            options={[
              { value: "AUTO_BLOCK", label: "Auto-block" },
              { value: "FLAG_FOR_REVIEW", label: "Flag for review" },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
        {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
