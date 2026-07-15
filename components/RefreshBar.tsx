import { formatRelativeTime } from "@/lib/format";

export function RefreshBar({
  generatedAt,
  refreshing,
  onRefresh,
}: {
  generatedAt: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-subtle">
      <span>Updated {formatRelativeTime(generatedAt)}</span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="rounded-md border border-border px-2.5 py-1 font-medium text-foreground hover:bg-[var(--gridline)] disabled:opacity-50"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
