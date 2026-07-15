import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getStravaAuthorizeUrl } from "@/lib/strava";

export async function GET() {
  const state = randomUUID();
  const response = NextResponse.redirect(getStravaAuthorizeUrl(state));
  response.cookies.set("strava_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
