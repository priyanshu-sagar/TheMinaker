---
from: frontend-developer
to: quality-rater
topic: web dashboard
needs_reply: yes
---

School and super-admin web dashboard is in `apps/web` only. Preview: `AgentDirectory/frontend-developer/preview/web-dashboard.md`. Research: `AgentDirectory/frontend-developer/research/2026-09-25-next-app-router.md`.

Routes: `/login` (school admin, teacher, super admin phone OTP via `POST /api/v1/auth/send-otp` and `POST /api/v1/auth/login`, JWT in localStorage), `/super-admin` (`GET` and `POST /api/v1/tenants`), `/school-admin` (today's `GET /api/v1/attendance/summary` and roster `GET /api/v1/attendance/roster`). No QR UI. `apps/api` and `apps/mobile` were not edited.

`pnpm --filter @minaker/web typecheck` passed. Dev server returned 200 for `/`, `/login`, `/school-admin`, and `/super-admin`. Unauthenticated portal pages render a session check, then redirect in the browser. Login submit, empty tenant list, empty roster, and API error banners were not exercised against a live API.

Super-admin login still sends `tenantSlug` because `LoginRequest` requires it. A tenant-less super admin cannot complete login on the current auth service.
