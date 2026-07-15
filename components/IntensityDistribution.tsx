import { INTENSITY_COLOR, INTENSITY_LABEL } from "@/lib/colors";
import type { IntensityLevel, TrainingLoadReading } from "@/lib/types";
import { ChartCard } from "./ChartCard";

const LEVEL_ORDER: IntensityLevel[] = ["rest", "low", "moderate", "high", "max"];

export function IntensityDistribution({ readings }: { readings: TrainingLoadReading[] }) {
  const counts = LEVEL_ORDER.map((level) => ({
    level,
    days: readings.filter((r) => r.intensity === level).length,
  }));
  const max = Math.max(...counts.map((c) => c.days), 1);

  return (
    <ChartCard
      title="Weekly intensity distribution"
      subtitle="Days by training intensity"
      tableHeaders={["Intensity", "Days"]}
      tableRows={counts.map((c) => [INTENSITY_LABEL[c.level], c.days])}
    >
      <div className="flex h-full flex-col justify-center gap-2">
        {counts.map((c) => (
          <div key={c.level} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted">{INTENSITY_LABEL[c.level]}</span>
            <div className="h-4 flex-1 rounded-full bg-[var(--gridline)]">
              {c.days > 0 && (
                <div
                  className="h-4 min-w-[4px] rounded-full"
                  style={{ width: `${(c.days / max) * 100}%`, background: INTENSITY_COLOR[c.level] }}
                />
              )}
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-subtle">{c.days}d</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
