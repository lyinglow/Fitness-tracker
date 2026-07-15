export type DataSource = "strava" | "apple_health" | "whoop" | "garmin";

export type ActivityType = "ride" | "run" | "walk" | "swim" | "strength" | "other";

export interface Activity {
  id: string;
  source: DataSource;
  type: ActivityType;
  date: string; // yyyy-mm-dd
  name: string;
  distanceKm: number | null;
  durationMin: number;
  calories: number | null;
}

export interface RecoveryReading {
  date: string; // yyyy-mm-dd
  recoveryScore: number | null; // 0-100, Whoop-style
  restingHeartRate: number | null; // bpm
  hrvMs: number | null;
  sleepHours: number | null;
  sleepScore: number | null; // 0-100
}

export type IntensityLevel = "rest" | "low" | "moderate" | "high" | "max";

export interface TrainingLoadReading {
  date: string; // yyyy-mm-dd
  load: number | null; // Garmin-style daily training load
  intensity: IntensityLevel;
  strain: number | null; // 0-21 style strain score
}

export type SourceStatus = "ok" | "stale" | "error" | "no_data";

export interface SourceState<T> {
  status: SourceStatus;
  data: T;
  lastUpdated: string | null; // ISO timestamp of the last successful fetch
  error?: string;
}

export interface DashboardData {
  activities: SourceState<Activity[]>; // Strava rides/runs + Apple Health activity data
  recovery: SourceState<RecoveryReading[]>; // Whoop
  trainingLoad: SourceState<TrainingLoadReading[]>; // Garmin
  generatedAt: string;
}
