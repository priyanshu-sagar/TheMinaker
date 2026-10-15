# TheMinaker frontend status

Shared status for all three tools working in this project: Cursor, Antigravity, and Gemini. Read this before editing the mobile app. Update this file when a portal is finished or a rule changes, so the others stay in sync.

They share one folder, `C:\Users\ps639\Desktop\TheMinaker`, and they work on different tasks at the same time. Before you edit, run `git status --short` and leave files another session already changed. Do not revert, reformat, or rewrite those paths.

## Scope

Frontend work is `apps/mobile` only. Do not change `apps/api`, `apps/web`, or `database/`. Do not add API calls from the phone UI. Screens use Zustand mock data until the user asks to connect the API.

`AgentDirectory`, wake tickets, and the agent supervisor were removed. Do not recreate them.

## How to run

From `apps/mobile`: `npx expo start -c`
From the repo root, `start.bat` also starts Docker, the API, and the web dashboard. Phone UI work only needs Expo.
Phone app: Expo Go. `react-native-worklets` stays at `0.10.1`. Do not upgrade it.

Stack: Expo SDK 57, Expo Router, TypeScript, Reanimated, `expo-blur`, `expo-haptics`, `expo-linear-gradient`, `react-native-svg`, `react-native-maps`, Zustand.
Tokens: `apps/mobile/src/design/tokens.ts` (`colors`, `glass`, `spacing`, `radius`, `typography`, `shadows`, `palette`, `portalAccents`).

## Done — do not rebuild unless the user asks

- Splash: `apps/mobile/app/(auth)/onboarding.tsx`. Dark hero, bus on the wavy road, school silhouette, stars, tagline under the bus, cubic white wave into the lower white panel, Get Started.
- Portal picker: `apps/mobile/app/(auth)/portal-showcase.tsx`. Four tiles (Parent, Gateman, Conductor, Admin) and a carousel. `portal-select.tsx` is the old unused picker.
- Parent auth: `apps/mobile/app/(auth)/parent/`. Signed-in parent opens `/(parent)`.
- Parent portal, mock store `src/store/parent.store.ts`, components in `src/components/parent/`:
  - Live `app/(parent)/index.tsx`: selected child's bus and stop, ETA, taking-the-bus switch (confirm before absent or resume), small call-conductor control, proximity banner inside 600 m.
  - History `app/(parent)/attendance.tsx`: month calendar, day timeline including exception logs, arrival-alert switch (turning off asks first).
  - Actions `app/(parent)/support.tsx` (tab label Actions, file name `support.tsx`): four exception rows with switches and confirm dialogs. View details is on the first three only, not on "Remind me before the stop". Details sheet has previous/next month and a timeline for the tapped day.
  - Profile `app/(parent)/profile.tsx`: child card, small stop map (tap opens the pin sheet), gate passes, transport fee, boarding-point change, contact update. No medical card, no bus-change request, no edit-child request.
- Child row: horizontal avatars plus a dashed Add. A new child is `Pending` and Live stays behind "Awaiting School Admin Verification".
- Contact update mock code: `4821`.
- `GlassModal` uses a solid off-white sheet so text behind it does not show through.

## Routing now

`apps/mobile/app/index.tsx`

- Signed out: onboarding.
- Parent: `/(parent)`.
- Gateman (`GATEKEEPER`): `/(gateman)`.
- Teacher, conductor, school admin: `/(auth)/signed-in`.

Teacher files exist at `apps/mobile/app/(teacher)/` and a spare copy at `apps/mobile/held/teacher-portal/`. Do not route teachers there unless the user asks. Teacher comes after the other portals.

## Not finished

Still mock UI, same glass system, then point `app/index.tsx` at the portal instead of the hold screen.

- Conductor: `app/(conductor)/` trip and manifest are early screens, not the finished portal.
- School admin: `app/(school-admin)/_layout.tsx` expects Attendance and Students tabs, but only `index.tsx` exists. Those missing files will fail if the tabs are opened. No grades.
- Gateman portal (fleet, inbox, attendance, settings) already exists. Leave it unless the user asks for a change.

## Shared UI rules

- Text fields use `src/components/glass/AppTextInput.tsx`. Do not call `setState` inside `onFocus`. That makes Android jump to the next field.
- On Android, do not put a text field inside `BlurView`. `GlassCard` already skips blur there.
- Do not set Android `elevation` on a transparent view. It paints white behind text. Use `boxShadow` and `elevation: 0`.
- Do not put `entering={FadeInDown}` and an animated `opacity` on the same view.
- Toasts are a solid `View` with the text inside.
- Parent lists need about 140 of bottom padding so they clear the frosted tab bar.
- Attendance is a roster. No student QR codes.
- Do not commit or push unless the user asks.
- From `apps/mobile`, `npx tsc --noEmit` before you stop.
