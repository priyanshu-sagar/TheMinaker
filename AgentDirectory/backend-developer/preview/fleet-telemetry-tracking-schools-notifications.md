# Backend Developer Preview — Fleet, Telemetry, Tracking, Schools, Notifications

**Date:** 2026-09-25  
**Triggered by:** human (continue)  
**Status:** executing

---

## Execution order (dependency-safe)

1. **schools** — school profile (tenant-scoped settings, no deps)
2. **fleet** — routes → buses → trips (needed by telemetry + tracking)
3. **telemetry** — MQTT subscriber → gps_telemetry hypertable + Redis last-pos
4. **tracking** — Socket.io gateway, bridges MQTT → authenticated parent WebSocket
5. **notifications** — BullMQ processor → FCM push to parent when child marked

---

## Key architecture choices

### Telemetry (MQTT → TimescaleDB)
- NestJS `ClientMqtt` in `TelemetryModule` subscribes to
  `minaker/+/bus/+/location` (wildcard).
- Parse topic → extract `tenantId` and `busId`.
- Insert row into `gps_telemetry` hypertable via raw SQL (fastest path,
  avoids TypeORM overhead on hot path — 5s cadence per bus).
- Cache last position in Redis key `bus:pos:{busId}` (TTL 30s) so parents
  see instant position without hitting TimescaleDB.

### Tracking (Socket.io gateway)
- `@WebSocketGateway` with Socket.io and `@socket.io/redis-adapter`
  (already in package.json).
- On connect: JWT verified, client joins room `tenant:{tenantId}`.
- Telemetry service emits `bus:location` Redis pub/sub event after
  each GPS insert → TrackingGateway broadcasts to the right tenant room.
- Parents only see their tenant's buses.

### Fleet — trips
- Conductor starts a trip via `POST /v1/fleet/trips`.
- `status: active` → supervisor detects conductor is on duty.
- Attendance marks reference `trip_id`.

### Notifications (BullMQ + FCM)
- `AttendanceService.mark()` enqueues a job to `notifications` queue.
- `NotificationsProcessor` picks it up, looks up parent FCM token, sends push.
- School admin can also trigger manual announcements.

---

## Files that will change

| File | Action |
|---|---|
| `apps/api/src/modules/schools/school.entity.ts` | create |
| `apps/api/src/modules/schools/schools.service.ts` | create |
| `apps/api/src/modules/schools/schools.controller.ts` | create |
| `apps/api/src/modules/schools/schools.module.ts` | update |
| `apps/api/src/modules/fleet/route.entity.ts` | create |
| `apps/api/src/modules/fleet/bus.entity.ts` | create |
| `apps/api/src/modules/fleet/trip.entity.ts` | create |
| `apps/api/src/modules/fleet/fleet.service.ts` | create |
| `apps/api/src/modules/fleet/fleet.controller.ts` | create |
| `apps/api/src/modules/fleet/fleet.module.ts` | update |
| `apps/api/src/modules/telemetry/gps-telemetry.entity.ts` | create |
| `apps/api/src/modules/telemetry/telemetry.service.ts` | create |
| `apps/api/src/modules/telemetry/telemetry.module.ts` | update |
| `apps/api/src/modules/tracking/tracking.gateway.ts` | create |
| `apps/api/src/modules/tracking/tracking.module.ts` | update |
| `apps/api/src/modules/notifications/notification.entity.ts` | create |
| `apps/api/src/modules/notifications/notifications.processor.ts` | create |
| `apps/api/src/modules/notifications/notifications.service.ts` | create |
| `apps/api/src/modules/notifications/notifications.controller.ts` | create |
| `apps/api/src/modules/notifications/notifications.module.ts` | update |
