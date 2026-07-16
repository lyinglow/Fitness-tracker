import { ensureSchema, sql } from "./db";
import type { StepsReading } from "./types";

/**
 * Upserts a day's step total, keeping the larger of the existing and
 * incoming value. Step count is monotonically non-decreasing through a day,
 * and Health Auto Export may re-sync the same day multiple times (e.g. with
 * "Daily" aggregation, each sync's total is a running total as of that
 * sync) — taking the max is correct for that config and safe against
 * duplicate/retried deliveries, at the cost of requiring "Daily" (not
 * incremental hourly-delta) aggregation to be configured on the export side.
 */
export async function upsertDailySteps(date: string, steps: number, source = "apple_health"): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO daily_steps (date, steps, source, received_at)
    VALUES (${date}, ${steps}, ${source}, now())
    ON CONFLICT (date) DO UPDATE SET
      steps = GREATEST(daily_steps.steps, EXCLUDED.steps),
      source = EXCLUDED.source,
      received_at = now()
  `;
}

/** Reads step totals for the given dates (yyyy-mm-dd), in the same order. Missing dates are simply absent from the result. */
export async function getDailySteps(dates: string[]): Promise<StepsReading[]> {
  if (dates.length === 0) return [];
  await ensureSchema();
  const rows = await sql`
    SELECT date, steps FROM daily_steps WHERE date = ANY(${dates}::date[]) ORDER BY date ASC
  `;
  return (rows as { date: string; steps: number }[]).map((r) => ({
    date: new Date(r.date).toISOString().slice(0, 10),
    steps: r.steps,
  }));
}
