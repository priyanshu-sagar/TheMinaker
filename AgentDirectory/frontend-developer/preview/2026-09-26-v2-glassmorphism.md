# V2 — Premium Glassmorphism (Portal Selector + Gateman Portal)

Date: 2026-09-26

## Scope

Only `apps/mobile`, plus two new Expo SDK dependencies (below). Frontend-only — no API route, schema, or server logic. All new data (bus stats, timestamps, coordinates, modification requests) lives in `src/store/gateman.store.ts`.

## Dependencies

Added `expo-blur` and `expo-linear-gradient` at SDK-57-matching versions via `npx expo install`, which also updated `pnpm-lock.yaml`. Both are core Expo Go modules — same low-risk category as `expo-splash-screen`/`expo-secure-store`, already used elsewhere in this app. See `research/2026-09-26-glass-map-tiles.md`.

`@react-navigation/material-top-tabs` and `lucide-react-native` from the earlier prompt are still not installed and still not used — no change there.

## Design system

- `src/design/glass-theme.ts` — glass surface tokens (`rgba(255,255,255,0.75)` fill, `rgba(255,255,255,0.4)` border), two-layer static mesh gradient, five portal accent colors, and the full V2 action palette (emerald/amber/rose plus sapphire "Boarded", sunset "Dropped", amethyst "Checked Out").
- `src/components/gateman/MeshBackground.tsx`, `GlassCard.tsx`, `GlassModal.tsx`, `SearchBar.tsx` — shared glass primitives (`expo-blur` `BlurView` + soft shadow). Note: these four are generic enough to be used outside the Gateman portal (the portal selector uses them too) and would be cleaner in a neutral `components/glass/` folder — left in `components/gateman/` for this pass to avoid an import-path-touching move under time pressure; flagging for a later cleanup.

## Portal Selection screen

Rebuilt `app/(auth)/portal-select.tsx`: mesh background, five `GlassCard` tiles, each with its accent-colored icon chip and the exact description text from the spec. Routes are unchanged.

## Gateman portal

- **Live Fleet** — glass `MetricChip`s; map switched to `UrlTile` (OpenStreetMap) over `provider={undefined}` to drop the Google logo; an expand button opens `FullScreenMapModal`; a blurred `SearchBar` filters the route list; tapping a bus row opens `BusDetailsModal` (Total/Boarded-In/Dropped-Out/Absent, derived from `roster` via `getBusStats`).
- **Action Inbox** — `TopTabBar` and `ActionCard` restyled to glass. Profiles: tapping a card opens `ProfileDetailModal` (full mock student/parent detail); added the third "Resubmit Query" button (`resubmitProfile`). Edits: each card now has a `MiniMapSnippet` (500 m circle) centered on the proposed new address (`newCoordinates`). Geofence: each card's `MiniMapSnippet` shows the actual stop (green, 500 m circle) plus the conductor's pinged location (red pin).
- **Master Attendance** — added a `SearchBar` filtering by student name; `StudentRosterRow` toggles recolored (Boarded = sapphire blue, Dropped = sunset orange, Checked Out = amethyst purple) with a glass outline when inactive, and a "{Stage} at {time}" line under the active stage, sourced from a new `statusUpdatedAt` field the store sets on every `updateAttendanceStatus` call.
- **Settings** — profile card and directory rows restyled to glass; generic settings replaced with a "Request Details Modification" button opening `RequestModificationModal` (free-text + "Submit to Admin", stored in `modificationRequests`).

## Checks

- `pnpm --filter @minaker/mobile typecheck` exits 0.
- `npx expo export --platform android` (via `pnpm --filter @minaker/mobile exec`) bundled all 1842 modules with no error — confirms the two new native modules and the map tile overlay resolve correctly, not just that types check.
- `git status --short` confirms the diff is `apps/mobile/**` plus `pnpm-lock.yaml`; no `apps/api`, `apps/web`, or `database` file touched.
