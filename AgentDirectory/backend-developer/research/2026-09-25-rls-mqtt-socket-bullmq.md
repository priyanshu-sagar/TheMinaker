# RLS, MQTT, Socket.io, and BullMQ

Date: 2026-09-25

- PostgreSQL `set_config(name, value, is_local)` with `is_local = true` is `SET LOCAL`, scoped to the current transaction: https://www.postgresql.org/docs/current/functions-admin.html
- NestJS WebSocket gateways: https://docs.nestjs.com/websockets/gateways
- NestJS BullMQ queues: https://docs.nestjs.com/techniques/queues
- MQTT.js client subscribe: https://github.com/mqttjs/MQTT.js#subscribe

Fleet, notifications, and GPS inserts for the woken modules run inside `withTenant`, which calls `set_config` in the same transaction as the query.
