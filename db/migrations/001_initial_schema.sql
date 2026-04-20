-- ── VENUES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  venue_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(200) NOT NULL,
  country          CHAR(2) NOT NULL,               -- ISO 3166-1 alpha-2
  city             VARCHAR(100) NOT NULL,
  capacity         INTEGER NOT NULL CHECK (capacity > 0),
  sport_type       VARCHAR(50)[],                  -- ['CRICKET','FOOTBALL']
  timezone         VARCHAR(50) NOT NULL,            -- IANA timezone
  data_residency   VARCHAR(50) NOT NULL,            -- 'IN','PK','GB','PL'
  geo_lat          DECIMAL(9,6),
  geo_lng          DECIMAL(9,6),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── ZONES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
  zone_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID NOT NULL REFERENCES venues(venue_id),
  name             VARCHAR(100) NOT NULL,
  type             VARCHAR(30) NOT NULL CHECK (type IN (
                     'STAND','CONCOURSE','CONCESSION','TOILET',
                     'GATE','EXIT','CORRIDOR','ACCESSIBLE_AREA')),
  capacity         INTEGER NOT NULL,
  floor_level      SMALLINT DEFAULT 0,
  accessible       BOOLEAN DEFAULT FALSE,
  geo_polygon      JSONB,                           -- GeoJSON polygon
  sensor_ids       VARCHAR(50)[]
);

-- ── EVENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  event_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID NOT NULL REFERENCES venues(venue_id),
  tournament_id    UUID,
  name             VARCHAR(200) NOT NULL,
  sport            VARCHAR(30) NOT NULL CHECK (sport IN (
                     'CRICKET_T20','CRICKET_ODI','CRICKET_TEST',
                     'FOOTBALL','RUGBY','ATHLETICS','MULTI')),
  format_detail    JSONB,
    -- { "inningsBreakMinutes": 20, "halftimeMinutes": null, "teaBreak": false }
  scheduled_start  TIMESTAMPTZ NOT NULL,
  scheduled_end    TIMESTAMPTZ NOT NULL,
  expected_attendance INTEGER,
  status           VARCHAR(20) DEFAULT 'SCHEDULED'
                     CHECK (status IN ('SCHEDULED','LIVE','DELAYED',
                                       'COMPLETED','CANCELLED')),
  ticketing_provider VARCHAR(30),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── GRAPH EDGES (for navigation) ────────────────────────────────
CREATE TABLE IF NOT EXISTS venue_graph_edges (
  edge_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID NOT NULL REFERENCES venues(venue_id),
  from_zone_id     UUID NOT NULL REFERENCES zones(zone_id),
  to_zone_id       UUID NOT NULL REFERENCES zones(zone_id),
  distance_meters  FLOAT NOT NULL,
  traversal_type   VARCHAR(20) NOT NULL CHECK (traversal_type IN (
                     'CORRIDOR','STAIRS','RAMP','ELEVATOR','OUTDOOR')),
  base_travel_secs INTEGER NOT NULL,
  accessible       BOOLEAN DEFAULT TRUE,
  bidirectional    BOOLEAN DEFAULT TRUE
);

-- ── STAFF ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  staff_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID NOT NULL REFERENCES venues(venue_id),
  employee_ref     VARCHAR(100) NOT NULL,
  role             VARCHAR(30) NOT NULL CHECK (role IN (
                     'STEWARD','SUPERVISOR','ADMIN','INCIDENT_COMMANDER',
                     'GATE_OPERATOR','MEDICAL')),
  assigned_zones   UUID[],
  language_codes   VARCHAR(10)[],
  active           BOOLEAN DEFAULT TRUE
);

-- ── INCIDENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  incident_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(event_id),
  zone_id          UUID NOT NULL REFERENCES zones(zone_id),
  reported_by      UUID NOT NULL REFERENCES staff(staff_id),
  type             VARCHAR(30) NOT NULL CHECK (type IN (
                     'CROWD_CRUSH','MEDICAL','FIRE','SECURITY',
                     'GATE_FAILURE','ACCESSIBILITY_BLOCKED','OTHER')),
  severity         VARCHAR(10) NOT NULL CHECK (severity IN (
                     'LOW','MEDIUM','HIGH','CRITICAL')),
  description      TEXT,
  status           VARCHAR(20) DEFAULT 'OPEN'
                     CHECK (status IN (
                       'OPEN','ACKNOWLEDGED','RESPONDING','RESOLVED')),
  assigned_stewards UUID[],
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at  TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  requires_evacuation BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_incidents_event_status ON incidents(event_id, status);

-- ── ATTENDEE SESSIONS (minimal data, privacy-first) ─────────────
CREATE TABLE IF NOT EXISTS attendee_sessions (
  session_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(event_id),
  ticket_hash      VARCHAR(64) NOT NULL,            -- SHA-256 of barcode
  section_code     VARCHAR(20),
  language_code    VARCHAR(10) DEFAULT 'en',
  mobility_flag    VARCHAR(30) DEFAULT 'NONE',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL,
  -- NO name, email, phone, or biometric data stored
  CONSTRAINT sessions_expire_after_event
    CHECK (expires_at <= created_at + INTERVAL '12 hours')
);

-- ── NAVIGATION REQUESTS (anonymised, for analytics) ─────────────
CREATE TABLE IF NOT EXISTS navigation_requests (
  request_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(event_id),
  session_hash     VARCHAR(64) NOT NULL,            -- hashed session_id
  from_zone_id     UUID REFERENCES zones(zone_id),
  destination_type VARCHAR(30),
  mobility_flag    VARCHAR(30),
  requested_at     TIMESTAMPTZ DEFAULT NOW(),
  route_returned   BOOLEAN,
  estimated_mins   SMALLINT
  -- no session_id stored — privacy-preserving
);
