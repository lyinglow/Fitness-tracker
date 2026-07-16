import type {
  Activity,
  ActivityType,
  DashboardData,
  IntensityLevel,
  RecoveryReading,
  StepsReading,
  TrainingLoadReading,
} from "./types";

// Deterministic PRNG so the same calendar day always renders the same mock
// values — avoids hydration mismatches between server and client.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(seedKey: string): () => number {
  return mulberry32(hashString(seedKey));
}

function randRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Last `days` calendar dates (yyyy-mm-dd), oldest first, ending at `reference`. */
export function lastNDays(reference: Date, days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(reference);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const STRAVA_TYPES: ActivityType[] = ["ride", "run"];
const APPLE_HEALTH_TYPES: ActivityType[] = ["walk", "swim", "strength", "other"];

function mockStravaActivityForDay(date: string): Activity | null {
  const rng = rngFor(`strava:${date}`);
  if (rng() >= 0.7) return null; // a ride or run on ~5/7 days
  const type = pick(rng, STRAVA_TYPES);
  return {
    id: `strava-${date}`,
    source: "strava",
    type,
    date,
    name: type === "ride" ? "Morning ride" : "Easy run",
    distanceKm: Math.round(randRange(rng, type === "ride" ? 15 : 4, type === "ride" ? 60 : 14) * 10) / 10,
    durationMin: Math.round(randRange(rng, 25, 120)),
    calories: Math.round(randRange(rng, 200, 900)),
  };
}

function mockAppleHealthActivityForDay(date: string): Activity | null {
  const rng = rngFor(`apple:${date}`);
  if (rng() >= 0.55) return null; // incidental activity most days
  const type = pick(rng, APPLE_HEALTH_TYPES);
  return {
    id: `apple-${date}`,
    source: "apple_health",
    type,
    date,
    name: type === "strength" ? "Strength session" : type === "swim" ? "Pool swim" : type === "walk" ? "Walk" : "Activity",
    distanceKm: type === "walk" || type === "swim" ? Math.round(randRange(rng, 1, 6) * 10) / 10 : null,
    durationMin: Math.round(randRange(rng, 15, 60)),
    calories: Math.round(randRange(rng, 100, 400)),
  };
}

export function mockStravaActivities(days: string[]): Activity[] {
  return days.map(mockStravaActivityForDay).filter((a): a is Activity => a !== null);
}

export function mockAppleHealthActivities(days: string[]): Activity[] {
  return days.map(mockAppleHealthActivityForDay).filter((a): a is Activity => a !== null);
}

function mockActivitiesForDay(date: string): Activity[] {
  return [mockStravaActivityForDay(date), mockAppleHealthActivityForDay(date)].filter(
    (a): a is Activity => a !== null,
  );
}

export function mockRecoveryReadings(days: string[]): RecoveryReading[] {
  return days.map(mockRecoveryForDay);
}

function mockRecoveryForDay(date: string): RecoveryReading {
  const rng = rngFor(`recovery:${date}`);
  return {
    date,
    recoveryScore: Math.round(randRange(rng, 35, 96)),
    restingHeartRate: Math.round(randRange(rng, 46, 62)),
    hrvMs: Math.round(randRange(rng, 35, 90)),
    sleepHours: Math.round(randRange(rng, 5.5, 8.5) * 10) / 10,
    sleepScore: Math.round(randRange(rng, 55, 95)),
  };
}

const INTENSITY_BY_LOAD = (load: number): IntensityLevel => {
  if (load < 20) return "rest";
  if (load < 60) return "low";
  if (load < 120) return "moderate";
  if (load < 200) return "high";
  return "max";
};

export function mockTrainingLoadReadings(days: string[]): TrainingLoadReading[] {
  return days.map(mockTrainingLoadForDay);
}

function mockTrainingLoadForDay(date: string): TrainingLoadReading {
  const rng = rngFor(`load:${date}`);
  const load = Math.round(randRange(rng, 0, 230));
  return {
    date,
    load,
    intensity: INTENSITY_BY_LOAD(load),
    strain: Math.round(randRange(rng, 4, 20) * 10) / 10,
  };
}

export function mockStepsReadings(days: string[]): StepsReading[] {
  return days.map(mockStepsForDay);
}

function mockStepsForDay(date: string): StepsReading {
  const rng = rngFor(`steps:${date}`);
  return { date, steps: Math.round(randRange(rng, 2500, 14000)) };
}

/** Builds a full mock dashboard payload for the 7 days ending at `reference`. */
export function buildMockDashboard(reference: Date = new Date()): DashboardData {
  const days = lastNDays(reference, 7);
  const now = reference.toISOString();

  return {
    activities: {
      status: "ok",
      data: days.flatMap(mockActivitiesForDay),
      lastUpdated: now,
    },
    recovery: {
      status: "ok",
      data: days.map(mockRecoveryForDay),
      lastUpdated: now,
    },
    trainingLoad: {
      status: "ok",
      data: days.map(mockTrainingLoadForDay),
      lastUpdated: now,
    },
    steps: {
      status: "ok",
      data: days.map(mockStepsForDay),
      lastUpdated: now,
    },
    generatedAt: now,
  };
}

/**
 * Simulates a real network call to a wearable's API: adds latency and an
 * occasional failure so the dashboard's error/stale-data handling has
 * something to exercise before real integrations replace these calls.
 */
export function simulateNetworkFetch<T>(value: T, failureRate = 0.12): Promise<T> {
  const delayMs = 300 + Math.random() * 700;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Error("Request timed out"));
      } else {
        resolve(value);
      }
    }, delayMs);
  });
}
