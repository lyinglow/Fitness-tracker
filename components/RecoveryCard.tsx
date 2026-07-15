import { recoveryStatusColor } from "@/lib/colors";
import type { RecoveryReading } from "@/lib/types";

export function RecoveryCard({ latest }: { latest: RecoveryReading | undefined }) {
  const score = latest?.recoveryScore ?? null;
  const color = recoveryStatusColor(score);

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-surface p-3">
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Recovery</h2>
          <span className="text-xs text-subtle">Whoop</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold leading-none" style={{ color }}>
            {score ?? "—"}
          </span>
          <span className="text-xs text-muted">/ 100</span>
        </div>
        <div
          className="mt-2 h-2 w-full rounded-full"
          style={{ background: `color-mix(in oklab, ${color} 22%, var(--surface))` }}
        >
          <div
            className="h-2 rounded-full transition-[width]"
            style={{ width: `${score ?? 0}%`, background: color }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-semibold leading-none">{latest?.sleepHours ?? "—"}</div>
          <div className="mt-1 text-[11px] text-subtle">Sleep (hrs)</div>
        </div>
        <div>
          <div className="text-lg font-semibold leading-none">{latest?.hrvMs ?? "—"}</div>
          <div className="mt-1 text-[11px] text-subtle">HRV (ms)</div>
        </div>
        <div>
          <div className="text-lg font-semibold leading-none">{latest?.restingHeartRate ?? "—"}</div>
          <div className="mt-1 text-[11px] text-subtle">RHR (bpm)</div>
        </div>
      </div>
    </div>
  );
}
