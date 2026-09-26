# Backend review

Date: 2026-09-26

`git status --short` shows no diff for `apps/api/src/modules/auth/auth.controller.ts` or `apps/api/src/modules/tenants/tenants.controller.ts` — this ticket was a save notification, not a pending edit. Both files still meet the standard: `LoginRequestDto` validates role and `LoginMethod`; `TenantsController` stays behind `JwtAuthGuard` + `RolesGuard(SUPER_ADMIN)`. No change made.
