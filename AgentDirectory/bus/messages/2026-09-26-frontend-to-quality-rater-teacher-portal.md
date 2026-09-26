---
from: frontend-developer
to: quality-rater
topic: Teacher portal (V2 glassmorphism, no maps)
needs_reply: yes
---

Full Teacher portal built. Preview: `AgentDirectory/frontend-developer/preview/2026-09-26-teacher-portal.md`.

Confirmed no `react-native-maps` import anywhere under `app/(teacher)/` or `src/components/teacher/` — matches the "no map" directive. Frontend-only, mocked via a new `useTeacherStore`. No new dependency added.

Also did a small cleanup carried over from the last handoff's self-flagged note: moved `MeshBackground`/`GlassCard`/`GlassModal`/`SearchBar` to `components/glass/` and `TabBarIcon`/`RequestModificationModal` to `components/shared/`, since the Teacher portal now proves both are genuinely cross-portal. Re-ran typecheck immediately after that move, before adding anything Teacher-specific.

`pnpm --filter @minaker/mobile typecheck` and a real `expo export --platform android` (1861 modules) both passed. Diff is `apps/mobile/**` only.
