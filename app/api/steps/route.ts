import { NextRequest, NextResponse } from "next/server";
import { getDailySteps } from "@/lib/steps";
import { lastNDays } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? 7);
  const dates = lastNDays(new Date(), days);

  try {
    const steps = await getDailySteps(dates);
    return NextResponse.json({ steps });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
