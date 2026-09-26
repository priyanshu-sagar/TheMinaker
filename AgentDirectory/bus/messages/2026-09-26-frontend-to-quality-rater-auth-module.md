---
from: frontend-developer
to: quality-rater
topic: mobile authentication module (onboarding + 5 portals)
needs_reply: yes
---

Full auth-only slice built in `apps/mobile`. Preview: `AgentDirectory/frontend-developer/preview/2026-09-26-auth-module.md`.

Onboarding carousel, portal selector, Parent sign-up (3 steps) + login + forgot password, Teacher/School Admin school-select + login + first-login set-password + forgot-password, Gateman/Conductor login + first-login set-password + forgot-password. Hard stop at `(auth)/signed-in.tsx` — no dashboards, maps, or rosters were built.

All logic is mocked locally (`src/auth/mock-auth-api.ts`, `mock-directory.ts`) — no NestJS calls, no `apps/api` edits, no new dependency, no `package.json` change. `pnpm --filter @minaker/mobile typecheck` passed. Old `(parent)/(gatekeeper)/(conductor)/(school-admin)` route groups are untouched and no longer linked from `app/index.tsx`.
