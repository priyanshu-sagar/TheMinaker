# Teacher portal removed from the router

Date: 2026-10-13

Screens moved from `apps/mobile/app/(teacher)` to `apps/mobile/held/teacher-portal`. Nothing in that folder was deleted. Root redirect, login, and set-password no longer open `/(teacher)`. A signed-in teacher lands on `/(auth)/signed-in`. Gateman still opens `/(gateman)`.

`npx tsc --noEmit` in `apps/mobile` exits 0.
