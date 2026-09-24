# Frontend Developer Preview — Mobile App Completion

**Date:** 2026-09-25  
**Task:** Complete the remaining mobile screens and telemetry hooks.  
**Status:** executing

---

## Scope of Work (`apps/mobile`)

### 1. Conductor Telemetry (MQTT Publishing)
- **File:** `apps/mobile/src/hooks/use-telemetry.ts`
- **Logic:** When a trip is active, request background location permissions via `expo-location`. Connect to the MQTT broker over WebSockets (port 9001). Publish GPS coordinates every 5 seconds to `minaker/{tenantId}/bus/{busId}/location`.

### 2. Parent Tracking Portal
- **File:** `apps/mobile/app/(parent)/index.tsx`
- **Logic:** Live map view. Connects to the NestJS `TrackingGateway` via `socket.io-client`. Listens for `bus_location_update` events and moves the bus marker on the map in real-time.

### 3. Parent Attendance History
- **File:** `apps/mobile/app/(parent)/attendance.tsx`
- **Logic:** Simple list view fetching the child's past attendance records (or relying on the roster endpoint for now).

### 4. School Admin Dashboard
- **File:** `apps/mobile/app/(school-admin)/index.tsx`
- **Logic:** Fetches `GET /v1/attendance/summary` and renders statistic cards (Present, Absent, Late, Unmarked).

### 5. Dependencies
- Install `socket.io-client` for the parent WebSocket connection.
- Install `paho-mqtt` for the conductor MQTT WebSocket connection.
- Install `expo-location` for GPS access.

## Why this approach
Using WebSockets for MQTT (`paho-mqtt`) is the most reliable way to publish telemetry from a React Native app without needing native TCP bridging. Socket.io handles the parent side perfectly with auto-reconnection.
