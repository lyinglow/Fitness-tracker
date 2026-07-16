import type { ActivityType, IntensityLevel, SourceStatus } from "./types";

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  ride: "Ride",
  run: "Run",
  walk: "Walk",
  swim: "Swim",
  strength: "Strength",
  other: "Other",
};

export const INTENSITY_LABEL: Record<IntensityLevel, string> = {
  rest: "Rest",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  max: "Max",
};

/** Whoop-style recovery banding: green >= 67, yellow 34-66, red <= 33. */
export function recoveryBand(score: number | null): "high" | "medium" | "low" | "unknown" {
  if (score === null) return "unknown";
  if (score >= 67) return "high";
  if (score >= 34) return "medium";
  return "low";
}

export const SOURCE_STATUS_TAG: Record<SourceStatus, { label: string; tone: "positive" | "warning" | "info" | "neutral" }> = {
  ok: { label: "Live", tone: "positive" },
  stale: { label: "Stale", tone: "warning" },
  error: { label: "Error", tone: "warning" },
  no_data: { label: "No data", tone: "neutral" },
};
