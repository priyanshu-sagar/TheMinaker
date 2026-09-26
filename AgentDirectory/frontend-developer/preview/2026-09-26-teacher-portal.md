# Teacher portal (V2 glassmorphism)

Date: 2026-09-26

## Scope

Only `apps/mobile`. No map component anywhere in this portal (`react-native-maps` is not imported by any `(teacher)` file). No API route, schema, or server logic — all data is `src/store/teacher.store.ts` (Zustand).

## Refactor done first

Before building, relocated the four glass primitives that the earlier Gateman-only pass had left under `components/gateman/` despite being portal-neutral (flagged in that pass's preview): `MeshBackground`, `GlassCard`, `GlassModal`, `SearchBar` now live in `src/components/glass/`, imported by both the portal selector, the Gateman portal, and this new Teacher portal. Also moved `TabBarIcon` and `RequestModificationModal` to `src/components/shared/` since both portals now use them verbatim — the Teacher settings screen reuses the Gateman `RequestModificationModal` directly instead of duplicating it. Added `src/components/glass/Fab.tsx` (used by both Academics and Comms Hub). Re-ran `pnpm --filter @minaker/mobile typecheck` after this move alone before touching anything Teacher-specific — it passed.

## Store — `src/store/teacher.store.ts`

`schedule`, `myClass` (roster with `campusStatus`, `classAttendance`, `behaviorPoints`, `parentPhone`), `tests` (with per-student `scores`), `communications`, `modificationRequests`. Actions: `markClassAttendance`, `awardBehaviorPoint` (clamped at 0), `logTestScore`, `createTest`, `sendNotification`, `submitModificationRequest`. `parsePeriodTime` turns the mock "8:00 AM"-style schedule strings into real `Date`s so the Dashboard's "active period" and "starting in N min" chip are driven by the actual device clock, not a hardcoded string.

## Screens (`app/(teacher)/`)

- **Dashboard** — glass summary chip computed from `parsePeriodTime` vs `Date.now()`; a 3-button `QuickActionsRow` that pushes to Roster/Academics/Comms; a `FlatList` of `ScheduleCard`s, the current period highlighted with a sapphire border and background tint.
- **Class Roster** — Present/Absent counts in the header; `StudentRosterCard` per student with a `CampusStatusBadge` (🟢/⚪/🔴 pulled from `campusStatus`, mirroring what the Gateman would see), a 3-way Present/Absent/Late toggle (emerald/rose/amber), and small ⭐ +/− behavior-point buttons.
- **Academics** — `FlatList` of `TestListItem`s (graded/total badge); tapping one opens `TestDetailModal`, a full glass modal with one numeric `TextInput` per student and a "Save Marks" button that writes through `logTestScore`; a `Fab` opens `CreateTestModal` (Title/Subject/Max Marks).
- **Comms Hub** — `CommsSegment` (Broadcasts / Complaints, filtering `communications` by `type`); `CommsFeedItem` history feed; a `Fab` opens `NewMessageModal` (type picker mapped to the 3 requested categories → the store's `Broadcast`/`Complaint`, class-vs-student target with a student chip picker, multiline body, "Send Push Notification" which confirms via `Alert.alert`, simulating the toast).
- **Settings** — profile card (name/ID from the real signed-in session, "Assigned Class: 6-B", Verified Phone badge), the shared `RequestModificationModal`, and a rose Logout button routing to `/(auth)/portal-select`.

## Routing

Added `(teacher)` to the root `Stack` (additive). `ProvisionedLoginScreen` and `ProvisionedSetPasswordScreen`'s `postLoginHref` now also sends `UserRole.TEACHER` to `/(teacher)`; root `app/index.tsx` does the same for an already-signed-in teacher. Gateman and every other role's routing is unchanged.

## Checks

- `pnpm --filter @minaker/mobile typecheck` exits 0.
- `expo export --platform android` bundled 1861 modules with no error (up from 1842 before this portal — the expected new-screen delta, no failures).
- `git status --short` confirms the diff is `apps/mobile/**` only (same `package.json`/`pnpm-lock.yaml` entries as the prior V2 pass — no new dependency was added for this portal).
