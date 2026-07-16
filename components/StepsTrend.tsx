import { formatWeekday, isToday } from "@/lib/format";
import type { StepsReading } from "@/lib/types";
import { ChartCard } from "./ChartCard";

export function StepsTrend({ days, steps }: { days: string[]; steps: StepsReading[] }) {
  const byDay = days.map((date) => ({ date, steps: steps.find((s) => s.date === date)?.steps ?? null }));
  const known = byDay.filter((d) => d.steps !== null).map((d) => d.steps as number);
  const max = Math.max(...known, 1);
  const average = known.length > 0 ? Math.round(known.reduce((sum, s) => sum + s, 0) / known.length) : null;

  return (
    <ChartCard
      title="Steps"
      subtitle={average !== null ? `Last 7 days · avg ${average.toLocaleString()}/day` : "Last 7 days"}
      tableHeaders={["Day", "Steps"]}
      tableRows={byDay.map((d) => [formatWeekday(d.date), d.steps !== null ? d.steps.toLocaleString() : "—"])}
    >
      <div className="flex h-full items-end gap-2">
        {byDay.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[11px] text-subtle">{d.steps !== null ? Math.round(d.steps / 1000) + "k" : "—"}</span>
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full min-h-[4px] rounded-full"
                style={{
                  height: d.steps !== null ? `${Math.max(4, (d.steps / max) * 100)}%` : "4px",
                  background: d.steps !== null ? "var(--accent)" : "var(--gridline)",
                }}
              />
            </div>
            <span className={`text-[11px] ${isToday(d.date) ? "font-semibold text-foreground" : "text-subtle"}`}>
              {formatWeekday(d.date)}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
