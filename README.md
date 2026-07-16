# Fitness Dashboard

A glanceable daily training dashboard pulling from Strava (rides/runs),
Whoop (recovery, sleep, strain), and Apple Health (step count, synced from a
Garmin watch).

## What's here

- **Mock data by default** — `lib/mock-data.ts` generates a deterministic
  7-day dataset for every source, so the dashboard runs with `npm run dev`
  and no credentials.
- **Strava OAuth2** — `lib/strava.ts` plus the routes under `app/api/strava/*`
  implement the real authorize → callback → token-refresh → activities flow
  against `https://www.strava.com/api/v3`.
- **Steps via Apple Health webhook** — `app/api/webhooks/apple-health/route.ts`
  receives step-count payloads pushed by the "Health Auto Export" iOS app and
  persists them to Postgres (`lib/steps.ts`). This is how Garmin step data
  reaches the dashboard: Garmin Connect can sync steps into Apple Health on
  the phone, and Health Auto Export forwards that to this app — no Garmin
  developer API access needed.
- **Whoop and the rest of Apple Health remain mocked** — Whoop would follow
  the same OAuth2 pattern as Strava; nothing else from Apple Health is wired
  up (steps was the one metric worth the integration cost — see the chat
  history / product notes for why).
- **Refresh model** — `lib/refresh.ts` re-fetches every source in parallel
  every 4 hours (and on demand via the Refresh button), merging results with
  the previous snapshot: a failed source falls back to its last known values
  (marked "stale") instead of blanking the UI, and a source with no data yet
  shows a placeholder ("no data").

## Running locally

```bash
npm install
npm run dev
```

Opens with mock data immediately — no setup required. Visit `/design` for
the design-system preview (separate route, separate mock data, not yet wired
to real sources).

## Connecting real Strava data

1. Create an API app at https://www.strava.com/settings/api.
2. Copy `.env.example` to `.env.local` and fill in `STRAVA_CLIENT_ID`,
   `STRAVA_CLIENT_SECRET`, and `STRAVA_REDIRECT_URI` (defaults to
   `http://localhost:3000/api/strava/callback`).
3. Click "Connect Strava" in the dashboard header.

Tokens are stored in httpOnly cookies for this example — swap in your own
session/user store before using this beyond local development.

## Connecting real step data (Garmin → Apple Health → this app)

This needs a database and a public HTTPS deployment (see "Deploying" below)
— a phone can't POST to `localhost`.

1. **Database**: create a free Postgres database at https://neon.tech (or
   any Postgres host) and set `DATABASE_URL` in your environment. The
   `daily_steps` table is created automatically on first use
   (`migrations/0001_daily_steps.sql`, run by `lib/db.ts`'s `ensureSchema`).
2. **Webhook secret**: set `HEALTH_WEBHOOK_SECRET` in your environment to any
   random string.
3. **On your iPhone**: install [Health Auto
   Export](https://apps.apple.com/app/health-auto-export/id1115567069), and
   in Garmin Connect enable Settings → Health Data Sync so Garmin writes
   steps into Apple Health.
4. In Health Auto Export, create a new **Automation**:
   - Type: REST API
   - URL: `https://<your-deployment>/api/webhooks/apple-health`
   - Header: `x-webhook-secret` = the value of `HEALTH_WEBHOOK_SECRET`
   - Metrics: Step Count
   - **Aggregation: Daily** (required — the endpoint keeps the larger of the
     existing and incoming value per date, which is only correct if each
     sync sends that day's running total, not an incremental hourly delta)
   - Frequency: whatever cadence you want steps to refresh at

Once triggered, `GET /api/steps` (used by the dashboard's refresh cycle)
starts returning real data instead of "no data."

## Deploying

Any host that runs Next.js works (Vercel, Netlify, Railway, a VPS) — Vercel
is the path of least friction since it's built by the Next.js team and
deploys straight from this GitHub repo with no config. Whichever you pick,
you'll need to set the same env vars from `.env.example` there
(`STRAVA_*`, `DATABASE_URL`, `HEALTH_WEBHOOK_SECRET`), using your real
deployed URL for `STRAVA_REDIRECT_URI` and the Health Auto Export webhook
URL above.
