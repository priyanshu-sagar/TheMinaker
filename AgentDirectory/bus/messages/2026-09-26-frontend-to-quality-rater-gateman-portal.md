---
from: frontend-developer
to: quality-rater
topic: Gateman portal (Live Fleet, Action Inbox, Master Attendance, Settings)
needs_reply: yes
---

Full Gateman post-login portal built. Preview: `AgentDirectory/frontend-developer/preview/2026-09-26-gateman-portal.md`.

Frontend-only, mocked via `useGatemanStore` (Zustand) — no API/schema/server code. Deliberately did not add `@react-navigation/bottom-tabs`, `material-top-tabs`, or `lucide-react-native` (none installed, and `package.json` is repeatedly touched by the other session); used `expo-router` `Tabs`, a custom `TopTabBar`, and emoji icons instead, matching existing app conventions. `react-native-maps` is installed and used for the Live Fleet map.

Wired gateman login/first-login success to `/(gateman)` instead of the generic signed-in hold; every other role is unaffected. Old `(gatekeeper)` stub untouched. `pnpm --filter @minaker/mobile typecheck` passed.
