# Backend review of schools, fleet, telemetry, tracking, notifications

Date: 2026-09-25

The five modules are real Nest modules. Entities follow `database/schema.sql`. MQTT ingest, Socket.io tenant rooms, and BullMQ FCM stay on env configuration.

The previous tenant guard ran `SET` on a connection it immediately released, so row-level security never saw the tenant. Fleet, notifications, the notification worker, and GPS inserts now run inside `withTenant()` (`set_config(..., true)`, which is `SET LOCAL` for that transaction). The guard only copies `tenantId` onto the request.

`PATCH /notifications/read-all` is registered before `:id/read` so "read-all" is not captured as an id. Mark-all updates `read_at IS NULL` instead of matching an undefined timestamp.

Schools read the global `tenants` table, which has no row-level security policy in the schema. Isolation there is `id = tenantId` from the JWT.

`pnpm --filter @minaker/api typecheck` passed after this change.
