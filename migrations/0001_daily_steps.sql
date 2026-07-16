-- Daily step counts, fed by the Apple Health webhook (Health Auto Export).
-- Additive only; safe to re-run.

CREATE TABLE IF NOT EXISTS daily_steps (
  date DATE PRIMARY KEY,
  steps INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'apple_health',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
