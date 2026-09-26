# Gateman portal

Date: 2026-09-26

## Scope

Only `apps/mobile`. No API routes, schema, or server logic — every domain array lives in `src/store/gateman.store.ts` (Zustand), and actions only filter/update those arrays. `apps/api`, `apps/web`, `database/**`, and every dependency/lockfile were not touched.

## Dependencies — deliberately not added

The prompt asked for `@react-navigation/bottom-tabs`, `@react-navigation/material-top-tabs`, and `lucide-react-native`. None are installed (`Test-Path` on `apps/mobile/node_modules` confirmed), and `apps/mobile/package.json` is a file the other session repeatedly touches. Adding packages now means an edit + install exactly where a collision is most likely, so:

- **Bottom tabs** use `Tabs` from `expo-router`, already used by the existing `(parent)` layout — it wraps `@react-navigation/bottom-tabs` internally without a new dependency.
- **Material top tabs** are a custom `TopTabBar` (`src/components/gateman/TopTabBar.tsx`) with per-tab badge counts. It switches content by state instead of a swipeable pager, since `react-native-pager-view` isn't installed.
- **Icons** are emoji glyphs via `TabBarIcon`, matching the emoji-icon convention already used in `(parent)/_layout.tsx`.

`react-native-maps` **is** installed (confirmed via `Test-Path`, and already used by the old parent tracking screen), so Live Fleet uses a real `MapView` with colored markers.

## Screens

- `(gateman)/index.tsx` — Live Fleet: online/offline `MetricChip`s, a `MapView` over the Delhi-NCR/Agra/Mathura corridor, a `FlatList` of routes below.
- `(gateman)/inbox.tsx` — Action Inbox: `TopTabBar` (Profiles / Edits / Geofence, each badge-counted) switching between `ProfileApprovalsList`, `EditRequestsList` (uses `DiffRows` for old-vs-new), and `GeofenceAlertsList` (amber `ActionCard`, Verify/Deny).
- `(gateman)/attendance.tsx` — Master Attendance: `BusSelectorPills` + `StudentRosterRow` with Boarded/Dropped/Checked Out toggles.
- `(gateman)/settings.tsx` — profile header (name/ID from the existing `useAuthStore`, mock "Verified Phone" badge), a `SectionList` of conductors and school admins wired to `Linking.openURL('tel:...')`, and Logout.

Semantic colors are exact: online/approve `#10B981`, offline/reject `#EF4444`, geofence amber `#F59E0B` (`src/design/gateman-theme.ts`).

## Routing

A new `(gateman)` route group was added to `app/_layout.tsx`'s `Stack` (additive). `ProvisionedLoginScreen` and `ProvisionedSetPasswordScreen` now send `UserRole.GATEKEEPER` to `/(gateman)` on success; every other provisioned role still lands on `/(auth)/signed-in`, since only this portal is built. Root `app/index.tsx` does the same check for an already-signed-in gateman. The old `(gatekeeper)` stub folder was not touched, edited, or deleted.

## Checks

- `pnpm --filter @minaker/mobile typecheck` exits 0.
- `git status --short` shows no file outside `apps/mobile` and this pass's own `AgentDirectory` bookkeeping.
