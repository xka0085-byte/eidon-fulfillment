-- Eidon Analytics — D1 schema
-- Apply once:  wrangler d1 execute eidon-analytics --file=analytics/schema.sql
CREATE TABLE IF NOT EXISTS events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,                 -- epoch ms
  type     TEXT    NOT NULL,                 -- 'pageview' | 'purchase' | custom
  path     TEXT    NOT NULL DEFAULT '/',
  referrer TEXT    NOT NULL DEFAULT '',
  value    REAL    NOT NULL DEFAULT 0,        -- revenue for purchases
  day      TEXT    NOT NULL                  -- YYYY-MM-DD (local-ish bucket)
);
CREATE INDEX IF NOT EXISTS idx_events_day  ON events(day);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
