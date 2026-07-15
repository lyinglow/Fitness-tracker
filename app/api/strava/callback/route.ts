import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode, StravaApiError } from "@/lib/strava";

const TOKEN_COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get("strava_oauth_state")?.value;

  if (oauthError) {
    return NextResponse.redirect(new URL(`/?strava_error=${encodeURIComponent(oauthError)}`, request.url));
  }
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL("/?strava_error=invalid_oauth_state", request.url));
  }

  try {
    const tokens = await exchangeStravaCode(code);
    const response = NextResponse.redirect(new URL("/?strava_connected=1", request.url));
    response.cookies.set("strava_access_token", tokens.accessToken, {
      ...TOKEN_COOKIE_OPTS,
      maxAge: Math.max(tokens.expiresAt - Math.floor(Date.now() / 1000), 60),
    });
    response.cookies.set("strava_refresh_token", tokens.refreshToken, {
      ...TOKEN_COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 180,
    });
    response.cookies.set("strava_expires_at", String(tokens.expiresAt), {
      ...TOKEN_COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 180,
    });
    response.cookies.delete("strava_oauth_state");
    return response;
  } catch (err) {
    const message = err instanceof StravaApiError ? err.message : "Failed to connect Strava";
    return NextResponse.redirect(new URL(`/?strava_error=${encodeURIComponent(message)}`, request.url));
  }
}
