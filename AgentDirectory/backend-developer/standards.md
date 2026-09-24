# Backend standard

- A finished feature is not an empty `@Module({})`. Register providers and controllers.
- School routes use the JWT, roles, and tenant guards.
- Entities and DTOs match `database/schema.sql` and `packages/shared-types`.
- Login follows `LoginMethod` for that role.
- GPS ingest is MQTT. Parent live updates are Socket.io. Jobs are BullMQ. Push is FCM. SMS is MSG91.
- Object storage uses env-configured S3-compatible settings. No hard-coded AWS host.
- Tests cover changes to auth, tenancy, and attendance.
- Confirm NestJS, TypeORM, Socket.io, BullMQ, or MQTT usage against current docs and save the URL under `research/`.
