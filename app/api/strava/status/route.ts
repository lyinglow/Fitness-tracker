import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const connected = Boolean(
    request.cookies.get("strava_access_token")?.value && request.cookies.get("strava_refresh_token")?.value,
  );
  return NextResponse.json({ connected });
}
