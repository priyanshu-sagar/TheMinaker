# Web dashboard

Date: 2026-09-25

## What changes in the root

Only `apps/web`. No edits to `apps/api` or `apps/mobile`.

- `src/app/login/page.tsx` — school admin, teacher, and super admin sign-in. Sends `POST /api/v1/auth/send-otp`, then `POST /api/v1/auth/login` with `LoginRequest` from shared types. Stores `accessToken` and the user in `localStorage` and on `apiClient`.
- `src/app/super-admin/page.tsx` — `GET /api/v1/tenants` and `POST /api/v1/tenants` (`name`, `slug`, optional `plan`).
- `src/app/school-admin/page.tsx` — `GET /api/v1/attendance/summary` and `GET /api/v1/attendance/roster` for today's roster. No QR scanner.
- `src/lib/api-client.ts` — accept the API's raw JSON success body (errors stay `{ success: false }`). Add `auth.login`, attendance, and students calls. `tenants.list` returns the array the API actually sends.
- `tailwind.config.js`, `postcss.config.js`, and `tsconfig.json` so the existing Tailwind setup compiles.
- Home links point at `/login`.

## Why this is the best fit

The Nest controllers already expose these routes. School admin and teacher login is phone OTP plus school slug (`LoginMethod.PHONE_OTP`). The client method `auth.verifyOtp` called `/auth/verify-otp`, which is not a controller. Login uses `/auth/login` instead.

Super-admin login uses the same `LoginRequest`. The current auth service looks the phone up inside a tenant, so a tenant-less super admin cannot complete login until the backend adds that case. The portal still loads tenants when a super-admin JWT is stored.

Attendance summary and roster are the school-admin endpoints. `GET /students` is not required for this roster because `GET /attendance/roster` returns the student list with today's status.
