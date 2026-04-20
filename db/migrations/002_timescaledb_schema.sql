-- Ensure TimescaleDB extension is active
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ── CROWD DENSITY READINGS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS crowd_density (
  time             TIMESTAMPTZ NOT NULL,
  zone_id          UUID NOT NULL,
  event_id         UUID NOT NULL,
  person_count     INTEGER NOT NULL,
  fill_pct         FLOAT NOT NULL CHECK (fill_pct BETWEEN 0.0 AND 1.0),
  flow_direction   VARCHAR(10),
  data_source      VARCHAR(20)   -- 'VISION','WIFI_PROBE','BEACON','MANUAL'
);
SELECT create_hypertable('crowd_density', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_crowd_density_zone_time ON crowd_density (zone_id, time DESC);

-- ── QUEUE READINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS queue_readings (
  time             TIMESTAMPTZ NOT NULL,
  queue_id         UUID NOT NULL,
  event_id         UUID NOT NULL,
  queue_length     INTEGER,
  throughput_per_min FLOAT,
  predicted_wait_mins FLOAT,
  actual_wait_mins FLOAT          -- populated from feedback
);
SELECT create_hypertable('queue_readings', 'time', if_not_exists => TRUE);

-- ── GATE THROUGHPUT ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gate_throughput (
  time             TIMESTAMPTZ NOT NULL,
  gate_id          UUID NOT NULL,
  event_id         UUID NOT NULL,
  scans_per_minute INTEGER,
  failure_count    SMALLINT DEFAULT 0,
  status           VARCHAR(20)
);
SELECT create_hypertable('gate_throughput', 'time', if_not_exists => TRUE);

-- Retention: auto-drop raw data > 90 days; keep 5-min aggregates for 3 years
SELECT add_retention_policy('crowd_density',
  INTERVAL '90 days', if_not_exists => TRUE);
  
-- Note: Continuous aggregates typically require creating a materialized view first.
-- For now, we will add the retention policy which is standard TimescaleDB functionality.
