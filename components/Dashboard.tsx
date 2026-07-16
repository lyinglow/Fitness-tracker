"use client";

import { useCallback, useEffect, useState } from "react";
import { ACTIVITY_LABEL, recoveryBand, SOURCE_STATUS_TAG } from "@/lib/colors";
import { formatDistance, formatDuration, formatRelativeTime } from "@/lib/format";
import { lastNDays } from "@/lib/mock-data";
import { refreshDashboardData } from "@/lib/refresh";
import type { DashboardData, IntensityLevel } from "@/lib/types";
import { ActivityList } from "./design-system/ActivityList";
import { MetricCard } from "./design-system/MetricCard";
import { MiniChart } from "./design-system/MiniChart";
import { PillButton } from "./design-system/PillButton";
import { SectionHeader } from "./design-system/SectionHeader";
import { StatusTag } from "./design-system/StatusTag";

const REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

const RECOVERY_LABEL: Record<ReturnType<typeof recoveryBand>, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  unknown: "—",
};

const INTENSITY_TAG_TONE: Record<IntensityLevel, "positive" | "warning" | "info" | "neutral"> = {
  rest: "neutral",
  low: "info",
  moderate: "info",
  high: "warning",
  max: "warning",
};

export function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
  const today = days[days.length - 1];
  const activities = data.activities.data;
  const todayActivities = activities.filter((a) => a.date === today);
  const latestRecovery = data.recovery.data.at(-1);
  const latestLoad = data.trainingLoad.data.at(-1);
  const latestSteps = data.steps.data.at(-1);

  const stepsSeries = days.map((d) => data.steps.data.find((s) => s.date === d)?.steps ?? 0);
  const caloriesSeries = days.map((d) =>
    activities.filter((a) => a.date === d).reduce((sum, a) => sum + (a.calories ?? 0), 0),
  );
  const caloriesToday = caloriesSeries.at(-1) ?? 0;
  const caloriesAvg = Math.round(caloriesSeries.reduce((sum, c) => sum + c, 0) / caloriesSeries.length);

  const band = recoveryBand(latestRecovery?.recoveryScore ?? null);
  const intensityTone = latestLoad ? INTENSITY_TAG_TONE[latestLoad.intensity] : "neutral";

  return (
    <div data-theme={theme} style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-6) var(--gutter-page) var(--space-9)" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            marginBottom: "var(--space-5)",
          }}
        >
          <SectionHeader
            title="Fitness Dashboard"
            subtitle={new Date(data.generatedAt).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)" }}>
            <a href="/design" style={{ font: "var(--text-label)", color: "var(--text-secondary)" }}>
              Design system →
            </a>
            {stravaConnected ? (
              <form action="/api/strava/disconnect" method="POST">
                <PillButton variant="secondary" size="sm">
                  Strava connected
                </PillButton>
              </form>
            ) : (
              <a href="/api/strava/authorize">
                <PillButton variant="ghost" size="sm">
                  Connect Strava
                </PillButton>
              </a>
            )}
            <PillButton variant="ghost" size="sm" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </PillButton>
            <span style={{ font: "var(--text-caption)", color: "var(--text-muted)" }}>
              Updated {formatRelativeTime(data.generatedAt)}
            </span>
            <PillButton variant="primary" size="sm" onClick={runRefresh} style={{ opacity: refreshing ? 0.6 : 1 }}>
              {refreshing ? "Refreshing…" : "Refresh"}
            </PillButton>
          </div>
        </div>

        {stravaError && (
          <div style={{ marginBottom: "var(--space-3)" }}>
            <StatusTag label={`Strava: ${stravaError}`} tone="warning" />
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
          <StatusTag label={`Activities · ${SOURCE_STATUS_TAG[data.activities.status].label}`} tone={SOURCE_STATUS_TAG[data.activities.status].tone} />
          <StatusTag label={`Recovery · ${SOURCE_STATUS_TAG[data.recovery.status].label}`} tone={SOURCE_STATUS_TAG[data.recovery.status].tone} />
          <StatusTag label={`Strain · ${SOURCE_STATUS_TAG[data.trainingLoad.status].label}`} tone={SOURCE_STATUS_TAG[data.trainingLoad.status].tone} />
          <StatusTag label={`Steps · ${SOURCE_STATUS_TAG[data.steps.status].label}`} tone={SOURCE_STATUS_TAG[data.steps.status].tone} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="col-span-2">
            <MetricCard
              variant="light"
              label="Steps"
              value={latestSteps?.steps != null ? latestSteps.steps.toLocaleString() : "—"}
              size="lg"
              chart={
                <MiniChart
                  type="bars"
                  data={stepsSeries}
                  highlightIndex={stepsSeries.length - 1}
                  color="var(--color-teal)"
                  trackColor="var(--bg-surface-2)"
                  height={72}
                />
              }
            />
          </div>

          <MetricCard
            variant="teal"
            label="Resting Heart Rate"
            value={latestRecovery?.restingHeartRate ?? "—"}
            unit="bpm"
            footer={latestRecovery?.hrvMs != null ? `HRV ${latestRecovery.hrvMs} ms` : undefined}
          />

          <MetricCard
            variant="lime"
            label="Recovery"
            value={RECOVERY_LABEL[band]}
            tagLabel={latestRecovery?.recoveryScore != null ? `${latestRecovery.recoveryScore}%` : undefined}
            tagTone={band === "high" ? "positive" : band === "unknown" ? "neutral" : "warning"}
          />

          <MetricCard
            variant="forest"
            label="Sleep Score"
            value={latestRecovery?.sleepScore ?? "—"}
            unit="/100"
            chart={
              <MiniChart
                type="ring"
                value={latestRecovery?.sleepScore ?? 0}
                ringLabel={latestRecovery?.sleepScore != null ? `${latestRecovery.sleepScore}%` : "—"}
                color="var(--color-lime)"
                trackColor="rgba(255,255,255,0.18)"
                height={72}
              />
            }
          />

          <MetricCard
            variant="coral"
            label="Strain"
            value={latestLoad?.strain ?? "—"}
            tagLabel={latestLoad ? latestLoad.intensity[0].toUpperCase() + latestLoad.intensity.slice(1) : undefined}
            tagTone={intensityTone}
          />

          <div className="col-span-2">
            <MetricCard
              variant="light"
              label="Calories Burned"
              value={caloriesToday > 0 ? caloriesToday.toLocaleString() : "—"}
              unit="kcal"
              footer={`Weekly avg ${caloriesAvg.toLocaleString()} kcal/day`}
              chart={<MiniChart type="line" data={caloriesSeries} color="var(--color-coral-600)" height={56} />}
            />
          </div>

          <div className="col-span-2 md:col-span-4">
            <MetricCard
              variant="dark"
              label="Today's Activities"
              value=""
              style={{ minHeight: "auto" }}
              chart={
                <ActivityList
                  variant="dark"
                  items={
                    todayActivities.length > 0
                      ? todayActivities.map((a) => ({
                          label: ACTIVITY_LABEL[a.type],
                          meta: `${formatDuration(a.durationMin)}${a.distanceKm !== null ? ` · ${formatDistance(a.distanceKm)}` : ""}`,
                          value: a.calories != null ? `${a.calories} kcal` : undefined,
                        }))
                      : [{ label: "Rest day", meta: "No tracked activity yet today" }]
                  }
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
