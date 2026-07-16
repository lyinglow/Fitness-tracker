"use client";

import { useState } from "react";
import { ActivityList } from "./ActivityList";
import { MetricCard } from "./MetricCard";
import { MiniChart } from "./MiniChart";
import { PillButton } from "./PillButton";
import { SectionHeader } from "./SectionHeader";

const FILTERS = ["All", "Meditation", "Sports", "Mind"];

/**
 * DashboardTemplateDesktop — wide-viewport variant of DashboardTemplate.
 * Same 10 slots, same components and mock data, laid out on a 4-column
 * desktop grid with the header/filters in a single row instead of stacked.
 */
export function DashboardTemplateDesktop({ userName = "Jonathan", dateLabel = "Monday, 27 Nov 2025" }: { userName?: string; dateLabel?: string }) {
  const [filter, setFilter] = useState("All");

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        background: "var(--bg-app)",
        padding: "var(--space-8) var(--space-8) var(--space-10)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-7)",
        fontFamily: "var(--font-body)",
        color: "var(--text-primary)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-6)" }}>
        <SectionHeader title={`Good Morning, ${userName}`} subtitle={dateLabel} actionLabel="Edit" />
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {FILTERS.map((f) => (
            <PillButton key={f} variant="ghost" size="sm" active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </PillButton>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "var(--space-4)" }}>
        {/* Slot 1 — Steps. Expects: { value: number, series: number[] } */}
        <div style={{ gridColumn: "span 2" }}>
          <MetricCard
            variant="light"
            label="Steps"
            value="7,435"
            tagLabel="On track"
            tagTone="positive"
            size="lg"
            chart={<MiniChart type="bars" data={[40, 55, 48, 90, 52, 44, 38]} highlightIndex={3} color="var(--color-teal)" trackColor="var(--bg-surface-2)" height={72} />}
          />
        </div>

        {/* Slot 2 — Heart Rate. Expects: { value: number, unit, status } */}
        <MetricCard variant="teal" label="Heart Rate" value={101} unit="bpm" tagLabel="High HR" tagTone="warning" />

        {/* Slot 3 — Weight. Expects: { value: number, unit, trendLabel } */}
        <MetricCard variant="light" label="Weight" value="72.2" unit="kg" footer="Stable this week" />

        {/* Slot 4 — Sleep Score. Expects: { percent: number } */}
        <MetricCard
          variant="forest"
          label="Sleep Score"
          value={82}
          unit="/100"
          chart={<MiniChart type="ring" value={82} color="var(--color-lime)" trackColor="rgba(255,255,255,0.18)" height={72} />}
        />

        {/* Slot 5 — Body Composition. Expects: { value: number, series: number[] } */}
        <MetricCard
          variant="dark"
          label="Body Composition"
          value="87.9"
          unit="%"
          tagLabel="Gaining muscle"
          tagTone="positive"
          chart={<MiniChart type="line" data={[60, 68, 66, 74, 80, 84, 88]} color="var(--color-lime)" height={48} />}
        />

        {/* Slot 6 — Recovery. Expects: { label: string, delta: string } */}
        <MetricCard variant="lime" label="Recovery" value="High" tagLabel="+12%" tagTone="positive" />

        {/* Slot 7 — Stress. Expects: { label: string, status: string } */}
        <MetricCard variant="coral" label="Stress" value="Low" tagLabel="Calm" tagTone="neutral" />

        {/* Slot 8 — Calories. Expects: { value: number, unit, series: number[], goal: string } */}
        <MetricCard
          variant="light"
          label="Calories Burned"
          value="1,842"
          unit="kcal"
          footer="Goal: 2,200 kcal"
          chart={<MiniChart type="line" data={[300, 620, 900, 1150, 1500, 1842]} color="var(--color-coral-600)" height={48} />}
        />

        {/* Slot 9 — Activity log. Expects: array of { icon, label, meta, value } */}
        <div style={{ gridColumn: "span 2" }}>
          <MetricCard
            variant="dark"
            label="Today's Activities"
            value=""
            style={{ minHeight: "auto" }}
            chart={
              <ActivityList
                variant="dark"
                items={[
                  { label: "Walking", meta: "Agenda · Morning", value: "7,435 steps" },
                  { label: "Running", meta: "32 min · 4.1 km", value: "312 kcal" },
                  { label: "Skateboard", meta: "18 min", value: "88 kcal" },
                ]}
              />
            }
          />
        </div>

        {/* Slot 10 — Benchmark ranges. Expects: array of { label, range, value } */}
        <div style={{ gridColumn: "span 2" }}>
          <MetricCard
            variant="teal"
            label="Benchmark Ranges For Your Age"
            value=""
            style={{ minHeight: "auto" }}
            chart={<MiniChart type="bars" data={[70, 45, 25, 60]} highlightIndex={0} color="var(--color-lime)" trackColor="rgba(255,255,255,0.2)" height={56} />}
          />
        </div>
      </div>
    </div>
  );
}
