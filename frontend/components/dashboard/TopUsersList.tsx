interface TopUser {
  userId: string;
  name: string;
  email: string;
  count: number;
}

export function TopUsersList({ users, countLabel }: { users: TopUser[]; countLabel: string }) {
  if (users.length === 0) {
    return <p className="text-sm text-ink-faint py-4">No data available yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {users.map((u, idx) => (
        <li key={u.userId} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-muted">
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{u.name}</p>
            <p className="truncate text-xs text-ink-faint">{u.email}</p>
          </div>
          <span className="shrink-0 font-mono text-sm font-semibold text-teal-700">
            {u.count} {countLabel}
          </span>
        </li>
      ))}
    </ol>
  );
}
