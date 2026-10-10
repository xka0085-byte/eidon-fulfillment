-- Eidon backend — D1 schema (analytics + products + orders)
-- Apply once:  wrangler d1 execute eidon-analytics --file=analytics/schema.sql

-- analytics events
CREATE TABLE IF NOT EXISTS events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,
  type     TEXT    NOT NULL,
  path     TEXT    NOT NULL DEFAULT '/',
  referrer TEXT    NOT NULL DEFAULT '',
  value    REAL    NOT NULL DEFAULT 0,
  day      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_day  ON events(day);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- products (whole product object stored as JSON; flexible, matches products-data.js)
CREATE TABLE IF NOT EXISTS products (
  id      TEXT PRIMARY KEY,
  data    TEXT NOT NULL,
  updated INTEGER NOT NULL
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id     TEXT PRIMARY KEY,
  data   TEXT NOT NULL,
  ts     INTEGER NOT NULL,
  day    TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_day    ON orders(day);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
