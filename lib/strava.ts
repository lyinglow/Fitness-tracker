import type { Activity } from "./types";

/**
 * Minimal Strava OAuth2 + Activities API client.
 * Env vars required: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI.
 * See https://developers.strava.com/docs/authentication/ and
 * https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
 */

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export class StravaApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "StravaApiError";
  }
}

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new StravaApiError(`Missing required env var ${name}`);
  }
  return value;
}

export function getStravaAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("STRAVA_CLIENT_ID"),
    redirect_uri: requireEnv("STRAVA_REDIRECT_URI"),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
    state,
  });
  return `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function requestTokens(body: Record<string, string>): Promise<StravaTokens> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireEnv("STRAVA_CLIENT_ID"),
      client_secret: requireEnv("STRAVA_CLIENT_SECRET"),
      ...body,
    }),
  });

  if (!response.ok) {
    throw new StravaApiError(`Strava token request failed: ${response.statusText}`, response.status);
  }

  const json = (await response.json()) as StravaTokenResponse;
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: json.expires_at,
  };
}

export function exchangeStravaCode(code: string): Promise<StravaTokens> {
  return requestTokens({ code, grant_type: "authorization_code" });
}

export function refreshStravaTokens(refreshToken: string): Promise<StravaTokens> {
  return requestTokens({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

/** Refreshes the access token only if it's expired or about to expire. */
export async function ensureFreshStravaTokens(tokens: StravaTokens): Promise<StravaTokens> {
  const expiresInSeconds = tokens.expiresAt - Math.floor(Date.now() / 1000);
  if (expiresInSeconds > 60) return tokens;
  return refreshStravaTokens(tokens.refreshToken);
}

interface StravaSummaryActivity {
  id: number;
  name: string;
  type: string;
  start_date_local: string;
  distance: number; // meters
  moving_time: number; // seconds
  calories?: number;
}

function mapStravaType(type: string): Activity["type"] {
  switch (type) {
    case "Ride":
    case "VirtualRide":
    case "EBikeRide":
      return "ride";
    case "Run":
    case "TrailRun":
    case "VirtualRun":
      return "run";
    case "Walk":
    case "Hike":
      return "walk";
    case "Swim":
      return "swim";
    case "WeightTraining":
    case "Workout":
    case "Crossfit":
      return "strength";
    default:
      return "other";
  }
}

/** Fetches the athlete's activities from the last `days` days. */
export async function fetchStravaActivities(accessToken: string, days = 7): Promise<Activity[]> {
  const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
  const params = new URLSearchParams({ after: String(after), per_page: "50" });

  let response: Response;
  try {
    response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Strava data changes slowly enough that a short cache avoids hammering
      // the API on every dashboard refresh.
      next: { revalidate: 60 },
    });
  } catch {
    throw new StravaApiError("Network error while contacting Strava");
  }

  if (response.status === 401) {
    throw new StravaApiError("Strava access token expired or invalid", 401);
  }
  if (response.status === 429) {
    throw new StravaApiError("Strava API rate limit exceeded", 429);
  }
  if (!response.ok) {
    throw new StravaApiError(`Strava API error: ${response.statusText}`, response.status);
  }

  const activities = (await response.json()) as StravaSummaryActivity[];
  return activities.map((a) => ({
    id: `strava-${a.id}`,
    source: "strava" as const,
    type: mapStravaType(a.type),
    date: a.start_date_local.slice(0, 10),
    name: a.name,
    distanceKm: Math.round((a.distance / 1000) * 10) / 10,
    durationMin: Math.round(a.moving_time / 60),
    calories: a.calories ?? null,
  }));
}
