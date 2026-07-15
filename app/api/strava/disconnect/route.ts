import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete("strava_access_token");
  response.cookies.delete("strava_refresh_token");
  response.cookies.delete("strava_expires_at");
  return response;
}
