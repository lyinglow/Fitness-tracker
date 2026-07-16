"use client";

import { useCallback, useEffect, useState } from "react";
import { lastNDays } from "@/lib/mock-data";
import { refreshDashboardData } from "@/lib/refresh";
import type { DashboardData } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { ActivityHistoryList } from "./ActivityHistoryList";
import { IntensityDistribution } from "./IntensityDistribution";
import { MetricTile } from "./MetricTile";
import { RecoveryCard } from "./RecoveryCard";
import { RefreshBar } from "./RefreshBar";
import { StatusDot } from "./StatusDot";
import { StravaConnect } from "./StravaConnect";
import { WeeklyVolumeChart } from "./WeeklyVolumeChart";

const REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

export function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);

  // Resolve Strava connection state on mount: read the OAuth redirect
  // params if present, then confirm against the server (cookies are
  // httpOnly, so the client can't read them directly).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("strava_error");
    if (params.has("strava_connected") || params.has("strava_error")) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    fetch("/api/strava/status")
      .then((res) => res.json())
      .then((body: { connected: boolean }) => {
        setStravaConnected(body.connected);
        if (oauthError) setStravaError(oauthError);
      })
      .catch(() => setStravaConnected(false));
  }, []);

  const runRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await refreshDashboardData(data, { stravaConnected });
      setData(next);
      setStravaError(null);
    } catch {
      // refreshDashboardData already falls back per-source; a throw here
      // would only be an unexpected bug, so just stop the spinner.
    } finally {
      setRefreshing(false);
    }
  }, [data, stravaConnected]);

  useEffect(() => {
    const id = setInterval(runRefresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [runRefresh]);

  const days = lastNDays(new Date(data.generatedAt), 7);
  const activities = data.activities.data;
  const totalDistanceKm = activities.reduce((sum, a) => sum + (a.distanceKm ?? 0), 0);
  const totalMinutes = activities.reduce((sum, a) => sum + a.durationMin, 0);
  const latestRecovery = data.recovery.data.at(-1);
  const latestLoad = data.trainingLoad.data.at(-1);
  const latestSteps = data.steps.data.at(-1);

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Fitness Dashboard</h1>
          <p className="text-xs text-subtle">Strava · Whoop · Apple Health (steps)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/design" className="text-xs text-subtle underline hover:text-foreground">
            Design preview →
          </a>
          <StravaConnect connected={stravaConnected} error={stravaError} />
          <RefreshBar generatedAt={data.generatedAt} refreshing={refreshing} onRefresh={runRefresh} />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <StatusDot status={data.activities.status} lastUpdated={data.activities.lastUpdated} error={data.activities.error} />
        <StatusDot status={data.recovery.status} lastUpdated={data.recovery.lastUpdated} error={data.recovery.error} />
        <StatusDot status={data.trainingLoad.status} lastUpdated={data.trainingLoad.lastUpdated} error={data.trainingLoad.error} />
        <StatusDot status={data.steps.status} lastUpdated={data.steps.lastUpdated} error={data.steps.error} />
      </div>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <MetricTile label="Weekly distance" value={totalDistanceKm.toFixed(1)} unit="km" />
        <MetricTile label="Weekly training time" value={formatDuration(totalMinutes)} />
        <MetricTile label="Activities this week" value={String(activities.length)} />
        <MetricTile
          label="Today's training load"
          value={latestLoad?.load != null ? String(latestLoad.load) : "—"}
          sublabel={latestLoad ? latestLoad.intensity : undefined}
        />
        <MetricTile
          label="Today's steps"
          value={latestSteps?.steps != null ? latestSteps.steps.toLocaleString() : "—"}
        />
      </section>

      <section className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RecoveryCard latest={latestRecovery} />
        </div>
        <div className="lg:col-span-2">
          <WeeklyVolumeChart activities={activities} />
        </div>
        <div className="lg:col-span-1">
          <IntensityDistribution readings={data.trainingLoad.data} />
        </div>
        <div className="lg:col-span-2">
          <ActivityHistoryList days={days} activities={activities} />
        </div>
      </section>
    </div>
  );
}
