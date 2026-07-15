# Fitness Dashboard

A glanceable daily training dashboard pulling from Strava (rides/runs), Apple
Health (activity data), Whoop (recovery, sleep), and Garmin (training load,
intensity).

## What's here

- **Mock data by default** — `lib/mock-data.ts` generates a deterministic
  7-day dataset for all four sources, so the dashboard runs with
  `npm run dev` and no credentials.
- **One real integration: Strava OAuth2** — `lib/strava.ts` plus the routes
  under `app/api/strava/*` implement the actual authorize → callback →
  token-refresh → activities flow against `https://www.strava.com/api/v3`.
  Apple Health, Whoop, and Garmin remain mocked (Apple Health has no public
  REST API; Whoop/Garmin would follow the same OAuth2 pattern as Strava).
- **Refresh model** — `lib/refresh.ts` re-fetches all sources in parallel
  every 4 hours (and on demand via the Refresh button), merging results with
  the previous snapshot: a failed source falls back to its last known values
  (marked "stale") instead of blanking the UI, and a source with no prior
  data shows a placeholder ("error"/"no data").

## Running locally

```bash
npm install
npm run dev
```

Opens with mock data immediately — no setup required.

## Connecting real Strava data

1. Create an API app at https://www.strava.com/settings/api.
2. Copy `.env.example` to `.env.local` and fill in `STRAVA_CLIENT_ID`,
   `STRAVA_CLIENT_SECRET`, and `STRAVA_REDIRECT_URI` (defaults to
   `http://localhost:3000/api/strava/callback`).
3. Click "Connect Strava" in the dashboard header.

Tokens are stored in httpOnly cookies for this example — swap in your own
session/user store before using this beyond local development.
