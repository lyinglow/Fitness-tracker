import { NextRequest, NextResponse } from "next/server";
import { ensureFreshStravaTokens, fetchStravaActivities, StravaApiError } from "@/lib/strava";

const TOKEN_COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("strava_access_token")?.value;
  const refreshToken = request.cookies.get("strava_refresh_token")?.value;
  const expiresAt = Number(request.cookies.get("strava_expires_at")?.value ?? 0);

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  try {
    const fresh = await ensureFreshStravaTokens({ accessToken, refreshToken, expiresAt });
    const activities = await fetchStravaActivities(fresh.accessToken);

    const response = NextResponse.json({ activities });
    if (fresh.accessToken !== accessToken) {
      response.cookies.set("strava_access_token", fresh.accessToken, {
        ...TOKEN_COOKIE_OPTS,
        maxAge: Math.max(fresh.expiresAt - Math.floor(Date.now() / 1000), 60),
      });
      response.cookies.set("strava_expires_at", String(fresh.expiresAt), {
        ...TOKEN_COOKIE_OPTS,
        maxAge: 60 * 60 * 24 * 180,
      });
    }
    return response;
  } catch (err) {
    if (err instanceof StravaApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
    }
    return NextResponse.json({ error: "Unexpected error fetching Strava activities" }, { status: 500 });
  }
}
