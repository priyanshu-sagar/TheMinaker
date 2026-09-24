# Database standard

- `database/schema.sql` is the source of truth. TypeORM `synchronize` stays false.
- Every school-scoped table has `tenant_id`, a foreign key, and a row-level security policy.
- Tenant context is `SET LOCAL` inside the transaction, compatible with PgBouncer transaction pooling.
- GPS history stays a Timescale hypertable.
- Attendance is marked from the student roster. No QR payload column.
- Seeds contain no real phone numbers, names of real children, or secrets.
- Confirm PostgreSQL, Timescale, or PostGIS behavior against current docs and save the URL under `research/`.
