import {
  lastNDays,
  mockAppleHealthActivities,
  mockRecoveryReadings,
  mockStravaActivities,
  mockTrainingLoadReadings,
  simulateNetworkFetch,
} from "./mock-data";
import type { Activity, DashboardData, SourceState, StepsReading } from "./types";

async function fetchStravaActivitiesClient(): Promise<Activity[]> {
  const res = await fetch("/api/strava/activities");
  if (res.status === 401) {
    throw new Error("Strava not connected");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Strava request failed (${res.status})`);
  }
  const body = (await res.json()) as { activities: Activity[] };
  return body.activities;
}

async function fetchStepsClient(days: number): Promise<StepsReading[]> {
  const res = await fetch(`/api/steps?days=${days}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Steps request failed (${res.status})`);
  }
  const body = (await res.json()) as { steps: StepsReading[] };
  return body.steps;
}

function mergeSource<T>(
  previous: SourceState<T>,
  result: PromiseSettledResult<T>,
  now: string,
  isEmpty: (v: T) => boolean,
): SourceState<T> {
  if (result.status === "fulfilled") {
    return { status: isEmpty(result.value) ? "no_data" : "ok", data: result.value, lastUpdated: now };
  }
  const hasPrevious = previous.lastUpdated !== null && !isEmpty(previous.data);
  return {
    status: hasPrevious ? "stale" : "error",
    data: previous.data,
    lastUpdated: previous.lastUpdated,
    error: result.reason instanceof Error ? result.reason.message : "Unknown error",
  };
}

export interface RefreshOptions {
  stravaConnected: boolean;
  referenceDate?: Date;
}

/** Re-fetches all four sources in parallel and merges with `previous`, falling back to last-known data per source on failure. */
export async function refreshDashboardData(previous: DashboardData, options: RefreshOptions): Promise<DashboardData> {
  const referenceDate = options.referenceDate ?? new Date();
  const now = referenceDate.toISOString();
  const days = lastNDays(referenceDate, 7);

  const [stravaResult, appleResult, recoveryResult, loadResult, stepsResult] = await Promise.allSettled([
    options.stravaConnected ? fetchStravaActivitiesClient() : simulateNetworkFetch(mockStravaActivities(days)),
    simulateNetworkFetch(mockAppleHealthActivities(days)),
    simulateNetworkFetch(mockRecoveryReadings(days)),
    simulateNetworkFetch(mockTrainingLoadReadings(days)),
    fetchStepsClient(days.length),
  ]);

  const activities = mergeActivities(previous.activities, stravaResult, appleResult, now);

  return {
    activities,
    recovery: mergeSource(previous.recovery, recoveryResult, now, (v) => v.length === 0),
    trainingLoad: mergeSource(previous.trainingLoad, loadResult, now, (v) => v.length === 0),
    steps: mergeSource(previous.steps, stepsResult, now, (v) => v.length === 0),
    generatedAt: now,
  };
}

// Activities come from two independent sources (Strava + Apple Health), so
// one failing shouldn't blank out the other — it's a partial refresh, not a
// hard error.
function mergeActivities(
  previous: SourceState<Activity[]>,
  stravaResult: PromiseSettledResult<Activity[]>,
  appleResult: PromiseSettledResult<Activity[]>,
  now: string,
): SourceState<Activity[]> {
  const bothFailed = stravaResult.status === "rejected" && appleResult.status === "rejected";
  if (bothFailed) {
    const hasPrevious = previous.data.length > 0;
    return {
      status: hasPrevious ? "stale" : "error",
      data: previous.data,
      lastUpdated: previous.lastUpdated,
      error: "Strava and Apple Health both failed to refresh",
    };
  }

  const data = [
    ...(stravaResult.status === "fulfilled" ? stravaResult.value : []),
    ...(appleResult.status === "fulfilled" ? appleResult.value : []),
  ];
  const partial = stravaResult.status === "rejected" || appleResult.status === "rejected";

  return {
    status: partial ? "stale" : data.length > 0 ? "ok" : "no_data",
    data,
    lastUpdated: now,
    error: partial
      ? `${stravaResult.status === "rejected" ? "Strava" : "Apple Health"} failed to refresh; showing available data`
      : undefined,
  };
}
