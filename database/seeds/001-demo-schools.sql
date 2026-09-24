-- Seed: Demo Schools (5 tenants for MVP testing)
-- Run after schema.sql
-- Usage: psql -f seeds/001-demo-schools.sql

BEGIN;

-- ─── 5 Demo Tenants ──────────────────────────────────────────
INSERT INTO tenants (id, name, slug, plan, status, dpdp_region, max_students, max_buses) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Delhi Public School Noida', 'dps-noida',     'growth',    'active', 'ap-south-1', 2000, 20),
  ('11111111-0000-0000-0000-000000000002', 'St. Mary''s School Mumbai',  'stmarys-mumbai','starter',   'active', 'ap-south-1', 500,  5),
  ('11111111-0000-0000-0000-000000000003', 'Kendriya Vidyalaya Pune',    'kv-pune',       'starter',   'trial',  'ap-south-1', 500,  5),
  ('11111111-0000-0000-0000-000000000004', 'DAV Public School Chennai',  'dav-chennai',   'enterprise','active', 'ap-south-1', 5000, 50),
  ('11111111-0000-0000-0000-000000000005', 'Ryan International Bhopal',  'ryan-bhopal',   'starter',   'active', 'ap-south-1', 500,  5);

-- ─── Super Admin ─────────────────────────────────────────────
INSERT INTO users (id, tenant_id, role, full_name, email, phone, password_hash) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    NULL,
    'super_admin',
    'Minaker Admin',
    'admin@theminaker.in',
    '+919999999999',
    -- bcrypt hash of 'Admin@123' (12 rounds) — change in production
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpR1WOLoHCCK8a'
  );

-- ─── School Admins ───────────────────────────────────────────
INSERT INTO users (id, tenant_id, role, full_name, email, phone) VALUES
  ('aaaaaaaa-0000-0000-0001-000000000001', '11111111-0000-0000-0000-000000000001', 'school_admin', 'Rajesh Sharma',   'admin@dps-noida.in',    '+919811111111'),
  ('aaaaaaaa-0000-0000-0002-000000000001', '11111111-0000-0000-0000-000000000002', 'school_admin', 'Maria Fernandes', 'admin@stmarys.in',      '+919822222222'),
  ('aaaaaaaa-0000-0000-0003-000000000001', '11111111-0000-0000-0000-000000000003', 'school_admin', 'Suresh Patil',    'admin@kv-pune.in',      '+919833333333'),
  ('aaaaaaaa-0000-0000-0004-000000000001', '11111111-0000-0000-0000-000000000004', 'school_admin', 'Priya Nair',      'admin@dav-chennai.in',  '+919844444444'),
  ('aaaaaaaa-0000-0000-0005-000000000001', '11111111-0000-0000-0000-000000000005', 'school_admin', 'Vikram Gupta',    'admin@ryan-bhopal.in',  '+919855555555');

COMMIT;
