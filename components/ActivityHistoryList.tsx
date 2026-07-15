import { ACTIVITY_COLOR, ACTIVITY_LABEL } from "@/lib/colors";
import { formatDayLabel, formatDistance, formatDuration, formatWeekday, isToday } from "@/lib/format";
import type { Activity } from "@/lib/types";

export function ActivityHistoryList({ days, activities }: { days: string[]; activities: Activity[] }) {
  const byDay = [...days].reverse().map((date) => ({
    date,
    items: activities.filter((a) => a.date === date),
  }));

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-3">
      <h2 className="mb-2 text-sm font-semibold">Activity history</h2>
      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {byDay.map(({ date, items }) => (
          <li key={date} className="flex items-start gap-2 border-b border-border/60 pb-1.5 last:border-0">
            <div className="w-14 shrink-0 pt-0.5 text-xs text-subtle">
              <div className={isToday(date) ? "font-semibold text-foreground" : undefined}>
                {formatWeekday(date)}
              </div>
              <div>{formatDayLabel(date)}</div>
            </div>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {items.length === 0 ? (
                <span className="pt-0.5 text-xs text-subtle">Rest day</span>
              ) : (
                items.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
                    title={a.name}
                  >
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: ACTIVITY_COLOR[a.type] }} />
                    {ACTIVITY_LABEL[a.type]}
                    <span className="text-subtle">
                      {formatDuration(a.durationMin)}
                      {a.distanceKm !== null ? ` · ${formatDistance(a.distanceKm)}` : ""}
                    </span>
                  </span>
                ))
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
