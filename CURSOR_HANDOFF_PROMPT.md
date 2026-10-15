# Frontend handoff — continue from here

Read this file before editing. Work only in `apps/mobile`. Do not change `apps/api`, `apps/web`, or `database/`. Do not add backend calls. Parent, gateman, and teacher screens use Zustand mock data.

The multi-CLI agent folder (`AgentDirectory`) was removed on purpose. Do not recreate it. Do not add wake tickets, a supervisor, or Cursor hooks for agents.

Repo: `C:\Users\ps639\Desktop\TheMinaker`
Mobile app: `apps/mobile`
Run from `apps/mobile`: `npx expo start -c`
Or from the repo root: `start.bat` (Docker, API, web, and Expo). Frontend work only needs the Expo window.

Stack: Expo SDK 57, Expo Router, TypeScript, Reanimated, `expo-blur`, `expo-haptics`, `expo-linear-gradient`, `react-native-svg`, `react-native-maps`, Zustand. Design tokens: `apps/mobile/src/design/tokens.ts`. Import colors, glass, spacing, radius, typography, shadows, palette, and portalAccents from there.

## Do not rebuild these

These screens are done. Change them only if the user asks.

- Splash: `apps/mobile/app/(auth)/onboarding.tsx`. Dark hero, bus and school illustration, stars, tagline under the bus, cubic white wave into the white lower panel, Get Started.
- Portal picker: `apps/mobile/app/(auth)/portal-showcase.tsx`. Four glass tiles (Parent, Gateman, Conductor, Admin) and a carousel. `portal-select.tsx` is the old picker. Leave it unused.
- Parent login and sign-up under `apps/mobile/app/(auth)/parent/`. A signed-in parent goes to `/(parent)`.
- Parent portal, four tabs in `apps/mobile/app/(parent)/`:
  - `index.tsx` Live: one child's bus and stop on the map, ETA card, taking-the-bus switch (confirm before marking absent or resuming), small call-conductor button, proximity banner when the bus is within 600 m.
  - `attendance.tsx` History: October calendar, day timeline, arrival-alert switch (off requires a warning).
  - `support.tsx` Actions tab (the label is Actions, the file is still `support.tsx`): four exception rows with switches and confirm dialogs. View details is on the first three only, not on "Remind me before the stop". The details sheet is a month calendar with previous/next and a timeline for the tapped day.
  - `profile.tsx`: child card with a small stop map (tap opens the pin sheet), gate passes, transport fee, boarding-point change, contact update. No medical card. No bus-change request. No edit-child request.
- Shared parent UI: `src/components/parent/` and `src/store/parent.store.ts`.
- Child switcher is a horizontal avatar row with a dashed Add button. A new child is `status: 'Pending'` and Live stays locked behind "Awaiting School Admin Verification".
- Contact update mock OTP is `4821`.
- Glass sheets use a solid off-white panel (`GlassModal`) so text behind them does not show through.

## Routing today

`apps/mobile/app/index.tsx`

- Signed out: onboarding.
- Parent: `/(parent)`.
- Gateman (`GATEKEEPER`): `/(gateman)`.
- Teacher, conductor, and school admin: `/(auth)/signed-in` hold screen.

Teacher screen files exist under `apps/mobile/app/(teacher)/` and a copy under `apps/mobile/held/teacher-portal/`. They are not the next task. Do not route teachers into that portal unless the user asks. The user will add the teacher portal after the rest of the app.

## Next frontend work

Build the remaining phone portals in the same glass style, still on mock Zustand data, then wire each one from `app/index.tsx` instead of the signed-in hold.

1. Conductor. `app/(conductor)/` has a trip screen and a manifest. They are not the finished glass portal.
2. School admin. `app/(school-admin)/_layout.tsx` lists Dashboard, Attendance, and Students, but only `index.tsx` exists. Attendance and Students tabs will crash until those files exist. Add roster, staff, fleet, and settings only when the user asks. No grades.
3. Gateman is already a glass portal (fleet, inbox, attendance, settings). Leave it unless the user asks for a change.

## Rules that already bit us

- Do not call `setState` inside `TextInput` `onFocus`. That makes Android jump focus to the next field. Use `AppTextInput` from `src/components/glass/AppTextInput.tsx`.
- On Android, do not put `TextInput` inside `BlurView`. `GlassCard` already skips blur on Android.
- Do not set Android `elevation` on a transparent view. It paints white boxes behind text. Shadows use `boxShadow` with `elevation: 0`.
- Do not put a Reanimated layout animation (`entering={FadeInDown}`) and an animated `opacity` style on the same view. Wrap one inside the other.
- Parent toasts must be a solid `View` with the text inside, not a transparent `Text` that doubles the message.
- Parent tab content needs bottom padding (about 140) so it does not show through the frosted tab bar.
- `react-native-worklets` must stay at `0.10.1` to match Expo Go. Do not upgrade it.
- No student QR codes. Attendance is a roster.

## Check your work

From `apps/mobile`: `npx tsc --noEmit`. Reload Expo with `npx expo start -c` after native or cache-sensitive edits. Do not commit or push unless the user asks.
