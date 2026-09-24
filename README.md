# 🚌 TheMinaker

> **Hardware-free, Multi-tenant School ERP & Transit Tracking SaaS**  
> Built for India. Zero hardware. Just smartphones.

[![CI](https://github.com/yourorg/theminaker/actions/workflows/ci.yml/badge.svg)](https://github.com/yourorg/theminaker/actions)

---

## What is TheMinaker?

TheMinaker is a SaaS platform for Indian schools that replaces expensive hardware with Android smartphones:

| Feature | How it works |
|---|---|
| 🗺️ **Live Bus Tracking** | Bus conductor's Android app publishes GPS via MQTT every 5s |
| 📲 **Parent Notifications** | FCM push + SMS when bus is near stop |
| 📷 **Gate Attendance** | Gatekeeper scans student QR code with camera |
| 📊 **Admin Dashboard** | Web portal for rosters, reports, fleet management |
| 🏫 **Multi-tenant** | Each school gets fully isolated data via PostgreSQL RLS |

---

## Architecture

```
📱 Conductor App ──MQTT──► Mosquitto ──► NestJS ──WebSocket──► 👨‍👩‍👧 Parent App
📱 Gatekeeper App ──REST──► NestJS ──► PostgreSQL + TimescaleDB
🌐 Web Dashboard ──REST/WS──► NestJS ──► Redis (cache + queues)
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS (Fastify), TypeORM, PostgreSQL 16 + TimescaleDB |
| **Multi-tenancy** | PostgreSQL Row-Level Security (shared schema) |
| **GPS Telemetry** | TimescaleDB hypertable (auto-partitioned by week) |
| **IoT** | Eclipse Mosquitto MQTT broker |
| **Real-time** | Socket.io with Redis adapter |
| **Queue** | BullMQ backed by Redis |
| **Web Dashboard** | Next.js 14 (App Router), Tailwind CSS, Mapbox |
| **Mobile** | React Native Expo (conductor, gatekeeper, school-admin) |
| **SMS** | MSG91 (TRAI DLT registered — India compliant) |
| **Push** | Firebase Cloud Messaging |
| **Monorepo** | Turborepo + PNPM workspaces |
| **Demo Deploy** | Oracle Cloud Free Tier (ap-mumbai-1, ARM) |
| **Prod Deploy** | AWS ECS Fargate + Aurora (ap-south-1) |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 20
- PNPM >= 9
- Docker Desktop

### Setup

```powershell
# 1. Install dependencies
pnpm install

# 2. Copy environment file
Copy-Item .env.example .env
# Edit .env with your values

# 3. Start all infrastructure services
docker compose up -d

# 4. Wait for health checks (30 seconds), then run schema
# The schema auto-runs on first postgres start via docker-entrypoint-initdb.d

# 5. Start all apps in dev mode
pnpm dev
```

### Services

| Service | URL | Credentials |
|---|---|---|
| API | http://localhost:3000 | — |
| Swagger Docs | http://localhost:3000/api/docs | — |
| Web Dashboard | http://localhost:3001 | — |
| Adminer (DB GUI) | http://localhost:8080 | Host: pgbouncer, User: minaker, Pass: minaker_secret |
| MQTT | mqtt://localhost:1883 | anonymous (dev) |
| LocalStack S3 | http://localhost:4566 | key: test, secret: test |

---

## Project Structure

```
TheMinaker/
├── apps/
│   ├── api/          ← NestJS Backend (port 3000)
│   ├── web/          ← Next.js Dashboard (port 3001)
│   └── mobile/
│       ├── apps/
│       │   ├── conductor/      ← Bus conductor GPS app
│       │   ├── gatekeeper/     ← QR scan attendance app
│       │   └── school-admin/   ← School admin mobile app
│       └── packages/
│           └── shared-mobile/  ← Shared RN components
├── packages/
│   ├── shared-types/  ← TypeScript interfaces (all apps)
│   └── ui-kit/        ← Design tokens + base components
├── database/
│   ├── schema.sql     ← PostgreSQL + TimescaleDB schema
│   └── seeds/         ← Demo data
├── infra/
│   ├── terraform/
│   │   ├── oracle/    ← Oracle Cloud Free Tier (demo)
│   │   └── aws/       ← AWS ECS Fargate (production)
│   └── docker/
│       └── mosquitto/ ← MQTT broker config
└── docker-compose.yml ← Local dev stack
```

---

## Compliance

- **DPDP Act 2023**: All data stored in India (ap-mumbai-1 / ap-south-1). No cross-border transfers.
- **TRAI DLT**: SMS OTPs sent via MSG91 with DLT-registered templates.

---

## License

Private — TheMinaker © 2026
