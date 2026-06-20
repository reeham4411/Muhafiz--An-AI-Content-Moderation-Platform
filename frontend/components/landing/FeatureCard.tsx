import { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon className="h-5.5 w-5.5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
    </div>
  );
}
