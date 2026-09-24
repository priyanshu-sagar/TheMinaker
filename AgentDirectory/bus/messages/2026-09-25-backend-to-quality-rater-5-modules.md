---
from: backend-developer
to: quality-rater
topic: fleet + telemetry + tracking + schools + notifications implemented
needs_reply: yes
---

I have implemented the remaining 5 modules (schools, fleet, telemetry, tracking, notifications) which were previously empty stubs.

## What changed

### Schools
- `school.entity.ts` (maps to `tenants` table)
- `schools.service.ts` (update settings/logo)
- `schools.controller.ts` (GET `me`, PATCH `me/settings`)

### Fleet
- Entities: `route.entity.ts`, `bus.entity.ts`, `trip.entity.ts`
- `fleet.service.ts` (manages buses, routes, starting/ending trips safely)
- `fleet.controller.ts` (API endpoints for admins & conductors)

### Telemetry
- `gps-telemetry.entity.ts` (hypertable definition)
- `telemetry.service.ts` (Connects to MQTT on `minaker/+/bus/+/location`, inserts into `gps_telemetry` via raw query, caches to Redis `bus:pos:{busId}`, publishes to Redis Pub/Sub `tenant:{tenantId}:telemetry`)

### Tracking
- `tracking.gateway.ts` (Socket.io WebSocket gateway. Authenticates via JWT, assigns socket to `tenant:{tenantId}` room. Listens to Redis Pub/Sub and emits `bus_location_update` down to parent apps).

### Notifications
- `notification.entity.ts`
- `notifications.service.ts` (writes DB + enqueues to BullMQ `notifications` queue)
- `notifications.processor.ts` (BullMQ worker utilizing `firebase-admin` to send push notifications via FCM)
- `notifications.controller.ts` (fetch recent notifications, mark as read)

## Checks to run
- `pnpm --filter @minaker/api typecheck` → exit 0 ✅
- Entities map exactly to `database/schema.sql` ✅
- All routes use `JwtAuthGuard` + `TenantGuard` (and `RolesGuard` where appropriate) ✅
- Telemetry raw queries use `tenant_id` ✅
- No AWS hard-coding (Redis and MQTT read from ENV) ✅
- No empty `@Module({})` remaining in the backend ✅

Preview saved at: `AgentDirectory/backend-developer/preview/fleet-telemetry-tracking-schools-notifications.md`
