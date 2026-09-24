-- ============================================================
-- TheMinaker — PostgreSQL 16 + TimescaleDB + PostGIS Schema
-- DPDP Act 2023 compliant: all PII stored in ap-south-1 / ap-mumbai-1
-- Run on a fresh database: psql -f schema.sql
-- v2 — No QR codes. Attendance marked manually from student roster.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Helper: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TENANTS  (Global — no RLS, super-admin only)
-- ============================================================
CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  plan            TEXT NOT NULL DEFAULT 'starter'
                  CHECK (plan IN ('starter', 'growth', 'enterprise')),
  status          TEXT NOT NULL DEFAULT 'trial'
                  CHECK (status IN ('active', 'suspended', 'trial')),
  dpdp_region     TEXT NOT NULL DEFAULT 'ap-south-1',
  logo_url        TEXT,
  max_students    INTEGER NOT NULL DEFAULT 500,
  max_buses       INTEGER NOT NULL DEFAULT 5,
  settings        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- USERS  (All portal users — role drives which app portal they see)
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role            TEXT NOT NULL
                  CHECK (role IN (
                    'super_admin',   -- SaaS management (no tenant)
                    'school_admin',  -- Web + mobile admin portal
                    'teacher',       -- Mobile school-admin portal
                    'conductor',     -- Mobile conductor portal
                    'gatekeeper',    -- Mobile gatekeeper portal
                    'parent'         -- Mobile parent portal
                  )),
  full_name       TEXT NOT NULL,

  -- ─── Contact (at least one required) ──────────────────────
  email           TEXT,
  phone           TEXT,

  -- ─── Auth credentials (role-specific) ────────────────────
  password_hash   TEXT,               -- bcrypt, for school_admin/teacher via web
  pin_hash        TEXT,               -- bcrypt hash of 4–6 digit PIN (conductor/gatekeeper)
  parent_uid      TEXT UNIQUE,        -- e.g. "DPS-P-00123" — printed on school letter
  employee_id     TEXT,               -- conductor/gatekeeper staff ID

  -- ─── App state ───────────────────────────────────────────
  fcm_token       TEXT,               -- Firebase push notification token
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at   TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- super_admin has no tenant_id; all others must have one
  CONSTRAINT chk_tenant_required
    CHECK (role = 'super_admin' OR tenant_id IS NOT NULL),
  -- At least one contact method required
  CONSTRAINT chk_contact_required
    CHECK (email IS NOT NULL OR phone IS NOT NULL),
  -- employee_id unique within a tenant
  CONSTRAINT uq_employee_per_tenant
    UNIQUE (tenant_id, employee_id),

  UNIQUE(email),
  UNIQUE(phone)
);
CREATE INDEX idx_users_tenant_id ON users (tenant_id);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_parent_uid ON users (parent_uid) WHERE parent_uid IS NOT NULL;
CREATE INDEX idx_users_employee ON users (tenant_id, employee_id) WHERE employee_id IS NOT NULL;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_tenant_isolation ON users
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    OR role = 'super_admin'
  );

-- ============================================================
-- OTP  (Phone OTP — MSG91 TRAI DLT compliant flow)
-- ============================================================
CREATE TABLE otps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           TEXT NOT NULL,
  otp_hash        TEXT NOT NULL,   -- bcrypt hash — never store plaintext
  expires_at      TIMESTAMPTZ NOT NULL,
  verified_at     TIMESTAMPTZ,
  attempts        SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otps_phone ON otps (phone);
CREATE INDEX idx_otps_expires_at ON otps (expires_at);

-- ============================================================
-- STUDENTS
-- No QR codes — attendance is marked manually from the roster.
-- ============================================================
CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  roll_number     TEXT NOT NULL,
  student_uid     TEXT,              -- Optional short ID e.g. "DPS-2024-0042" for reports
  full_name       TEXT NOT NULL,
  class_section   TEXT NOT NULL,     -- e.g. "10-A"
  dob             DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other')),
  parent_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  photo_url       TEXT,              -- Stored in S3/Oracle Object Storage
  bus_route_id    UUID,              -- FK added after routes table
  address         TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, roll_number)
);
CREATE INDEX idx_students_tenant_id ON students (tenant_id);
CREATE INDEX idx_students_parent ON students (parent_user_id);
CREATE INDEX idx_students_route ON students (bus_route_id);
CREATE INDEX idx_students_class ON students (tenant_id, class_section);
-- Full-text search index for name search in gatekeeper/conductor app
CREATE INDEX idx_students_name_fts ON students
  USING GIN (to_tsvector('english', full_name));

CREATE TRIGGER set_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY students_tenant_isolation ON students
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================
-- ROUTES
-- ============================================================
CREATE TABLE routes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  stops           JSONB NOT NULL DEFAULT '[]',
  -- stops: [{name, lat, lng, order, estimatedMinutesFromStart}]
  polyline        TEXT,   -- Encoded polyline for map display
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY routes_tenant_isolation ON routes
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================
-- BUSES
-- ============================================================
CREATE TABLE buses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number_plate    TEXT NOT NULL,
  route_id        UUID REFERENCES routes(id) ON DELETE SET NULL,
  conductor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  make_model      TEXT,
  capacity        INTEGER NOT NULL DEFAULT 40
                  CHECK (capacity > 0 AND capacity <= 100),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, number_plate)
);

-- FK for students.bus_route_id (added after routes table exists)
ALTER TABLE students ADD CONSTRAINT fk_student_route
  FOREIGN KEY (bus_route_id) REFERENCES routes(id) ON DELETE SET NULL;

CREATE TRIGGER set_buses_updated_at
  BEFORE UPDATE ON buses
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
CREATE POLICY buses_tenant_isolation ON buses
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE trips (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bus_id          UUID NOT NULL REFERENCES buses(id),
  route_id        UUID NOT NULL REFERENCES routes(id),
  conductor_id    UUID NOT NULL REFERENCES users(id),
  trip_type       TEXT NOT NULL CHECK (trip_type IN ('morning', 'afternoon', 'custom')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  student_count   INTEGER DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_trips_tenant_bus ON trips (tenant_id, bus_id);
CREATE INDEX idx_trips_conductor ON trips (conductor_id);
CREATE INDEX idx_trips_status ON trips (status) WHERE status IN ('pending', 'active');

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY trips_tenant_isolation ON trips
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================
-- GPS TELEMETRY — TimescaleDB Hypertable
-- Conductor's phone publishes GPS every 5s via MQTT.
-- ============================================================
CREATE TABLE gps_telemetry (
  time            TIMESTAMPTZ NOT NULL,
  tenant_id       UUID NOT NULL,
  bus_id          UUID NOT NULL,
  conductor_id    UUID NOT NULL,
  trip_id         UUID,
  location        geography(Point, 4326) NOT NULL,
  speed_kmh       NUMERIC(5, 2),
  heading         NUMERIC(5, 2),
  accuracy_m      NUMERIC(6, 2),
  battery_pct     SMALLINT CHECK (battery_pct BETWEEN 0 AND 100)
);

SELECT create_hypertable('gps_telemetry', 'time', chunk_time_interval => INTERVAL '1 week');

CREATE INDEX idx_gps_location ON gps_telemetry USING GIST (location);
CREATE INDEX idx_gps_bus_time ON gps_telemetry (bus_id, time DESC);

ALTER TABLE gps_telemetry SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'bus_id, tenant_id'
);
SELECT add_compression_policy('gps_telemetry', INTERVAL '7 days');
SELECT add_retention_policy('gps_telemetry', INTERVAL '90 days');

-- ============================================================
-- ATTENDANCE EVENTS
-- Marked manually by gatekeeper (school entry/exit) or
-- conductor (bus boarding/alighting). No QR scanning.
-- ============================================================
CREATE TABLE attendance_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id),
  marked_by       UUID NOT NULL REFERENCES users(id),   -- gatekeeper or conductor user
  trip_id         UUID REFERENCES trips(id) ON DELETE SET NULL, -- only for bus marks
  attendance_type TEXT NOT NULL
                  CHECK (attendance_type IN (
                    'school_entry',    -- Gatekeeper: student entered school campus
                    'school_exit',     -- Gatekeeper: student left school campus
                    'bus_boarding',    -- Conductor: student boarded the bus
                    'bus_alighting',   -- Conductor: student alighted from bus
                    'absent'           -- Explicitly marked absent for the day
                  )),
  status          TEXT NOT NULL DEFAULT 'present'
                  CHECK (status IN ('present', 'absent', 'late')),
  marked_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  gate_location   TEXT,   -- e.g. "Main Gate", "Back Gate"
  notes           TEXT,   -- Optional remark (e.g. "Parent pickup")
  -- One record per student per attendance_type per calendar day
  CONSTRAINT no_duplicate_mark
    EXCLUDE USING btree (
      student_id WITH =,
      attendance_type WITH =,
      date_trunc('day', marked_at) WITH =
    )
);
CREATE INDEX idx_attendance_tenant_date ON attendance_events (tenant_id, marked_at DESC);
CREATE INDEX idx_attendance_student ON attendance_events (student_id, marked_at DESC);
CREATE INDEX idx_attendance_marked_by ON attendance_events (marked_by);
CREATE INDEX idx_attendance_trip ON attendance_events (trip_id) WHERE trip_id IS NOT NULL;

ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY attendance_tenant_isolation ON attendance_events
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL
                  CHECK (type IN (
                    'student_arrived', 'student_departed',
                    'bus_arriving', 'bus_delayed',
                    'attendance_marked', 'report_ready'
                  )),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  data            JSONB NOT NULL DEFAULT '{}',
  channel         TEXT NOT NULL CHECK (channel IN ('fcm', 'sms', 'in_app')),
  sent_at         TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_recipient ON notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (recipient_id) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_tenant_isolation ON notifications
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================
-- AUDIT LOG  (Immutable — append only)
-- ============================================================
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID REFERENCES tenants(id),
  actor_id        UUID,
  actor_role      TEXT,
  action          TEXT NOT NULL,   -- e.g. 'attendance.marked', 'trip.started'
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant_date ON audit_log (tenant_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_resource ON audit_log (resource_type, resource_id);
