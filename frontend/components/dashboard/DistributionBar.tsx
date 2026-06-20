import { cn } from "@/lib/utils";

export interface DistributionItem {
  label: string;
  value: number;
  colorClass: string;
}

export function DistributionBar({ items, total }: { items: DistributionItem[]; total: number }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium text-ink">{item.label}</span>
              <span className="text-ink-muted font-mono text-xs">
                {item.value} · {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={cn("h-full rounded-full transition-all duration-700", item.colorClass)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
