import { NextRequest, NextResponse } from "next/server";
import { upsertDailySteps } from "@/lib/steps";

/**
 * Receives step-count data from the "Health Auto Export" iOS app's REST API
 * automation. Configure it in the app as: Automations -> new automation ->
 * REST API -> URL = this route -> Header "x-webhook-secret" = the value of
 * HEALTH_WEBHOOK_SECRET -> Metrics = Step Count -> Aggregation = Daily
 * (required: see upsertDailySteps for why hourly deltas aren't supported).
 */

interface HealthAutoExportPayload {
  data?: {
    metrics?: Array<{
      name: string;
      units?: string;
      data?: Array<{ date: string; qty: number }>;
    }>;
  };
}

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.HEALTH_WEBHOOK_SECRET;
  if (!expected) return false;
  const provided = request.headers.get("x-webhook-secret") ?? request.nextUrl.searchParams.get("secret");
  return provided === expected;
}

export async function POST(request: NextRequest) {
  if (!process.env.HEALTH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured: HEALTH_WEBHOOK_SECRET is unset" }, { status: 500 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: HealthAutoExportPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const stepsMetric = payload.data?.metrics?.find((m) => m.name === "step_count");
  if (!stepsMetric?.data?.length) {
    return NextResponse.json({ received: true, daysUpdated: 0, note: "No step_count data in payload" });
  }

  const totalsByDate = new Map<string, number>();
  for (const point of stepsMetric.data) {
    if (typeof point.qty !== "number" || !point.date) continue;
    const date = point.date.slice(0, 10); // "YYYY-MM-DD HH:mm:ss +ZZZZ" -> "YYYY-MM-DD"
    totalsByDate.set(date, (totalsByDate.get(date) ?? 0) + point.qty);
  }

  try {
    await Promise.all(
      Array.from(totalsByDate.entries()).map(([date, steps]) => upsertDailySteps(date, Math.round(steps))),
    );
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Database error" }, { status: 500 });
  }

  return NextResponse.json({ received: true, daysUpdated: totalsByDate.size });
}
