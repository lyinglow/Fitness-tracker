import type { ActivityType, IntensityLevel, SourceStatus } from "./types";

// Categorical: fixed hue per activity type, in the palette's slot order.
export const ACTIVITY_COLOR: Record<ActivityType, string> = {
  ride: "var(--series-ride)",
  run: "var(--series-run)",
  walk: "var(--series-walk)",
  swim: "var(--series-swim)",
  strength: "var(--series-strength)",
  other: "var(--series-other)",
};

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  ride: "Ride",
  run: "Run",
  walk: "Walk",
  swim: "Swim",
  strength: "Strength",
  other: "Other",
};

// Sequential ordinal ramp, one hue, light (rest) -> dark (max effort).
export const INTENSITY_COLOR: Record<IntensityLevel, string> = {
  rest: "var(--intensity-rest)",
  low: "var(--intensity-low)",
  moderate: "var(--intensity-moderate)",
  high: "var(--intensity-high)",
  max: "var(--intensity-max)",
};

export const INTENSITY_LABEL: Record<IntensityLevel, string> = {
  rest: "Rest",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  max: "Max",
};

export const SOURCE_STATUS_COLOR: Record<SourceStatus, string> = {
  ok: "var(--status-good)",
  stale: "var(--status-warning)",
  error: "var(--status-critical)",
  no_data: "var(--status-neutral)",
};

export const SOURCE_STATUS_LABEL: Record<SourceStatus, string> = {
  ok: "Live",
  stale: "Stale",
  error: "Error",
  no_data: "No data",
};

/** Whoop-style recovery banding: green >= 67, yellow 34-66, red <= 33. */
export function recoveryStatusColor(score: number | null): string {
  if (score === null) return "var(--status-neutral)";
  if (score >= 67) return "var(--status-good)";
  if (score >= 34) return "var(--status-warning)";
  return "var(--status-critical)";
}
