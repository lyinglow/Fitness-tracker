import { ACTIVITY_COLOR, ACTIVITY_LABEL } from "@/lib/colors";
import { formatDuration } from "@/lib/format";
import type { Activity, ActivityType } from "@/lib/types";
import { ChartCard } from "./ChartCard";

const TYPE_ORDER: ActivityType[] = ["ride", "run", "walk", "swim", "strength", "other"];

export function WeeklyVolumeChart({ activities }: { activities: Activity[] }) {
  const totals = TYPE_ORDER.map((type) => ({
    type,
    minutes: activities.filter((a) => a.type === type).reduce((sum, a) => sum + a.durationMin, 0),
  }))
    .filter((t) => t.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const max = Math.max(...totals.map((t) => t.minutes), 1);

  if (totals.length === 0) {
    return (
      <ChartCard title="Weekly training volume" subtitle="By activity type" tableHeaders={[]} tableRows={[]}>
        <p className="flex h-full items-center justify-center text-xs text-subtle">No activity this week</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Weekly training volume"
      subtitle="By activity type, last 7 days"
      tableHeaders={["Type", "Duration"]}
      tableRows={totals.map((t) => [ACTIVITY_LABEL[t.type], formatDuration(t.minutes)])}
    >
      <div className="flex h-full flex-col justify-center gap-2">
        {totals.map((t) => (
          <div key={t.type} className="flex items-center gap-2">
            <span className="flex w-20 shrink-0 items-center gap-1.5 text-xs text-muted">
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: ACTIVITY_COLOR[t.type] }} />
              {ACTIVITY_LABEL[t.type]}
            </span>
            <div className="h-4 flex-1 rounded-full bg-[var(--gridline)]">
              <div
                className="h-4 min-w-[4px] rounded-full"
                style={{ width: `${(t.minutes / max) * 100}%`, background: ACTIVITY_COLOR[t.type] }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs text-subtle">{formatDuration(t.minutes)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
