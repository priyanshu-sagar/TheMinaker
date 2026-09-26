# Mobile authentication module

Date: 2026-09-26

## Scope

Only `apps/mobile`. `apps/api`, `apps/web`, `database/**`, `docker-compose.yml`, and `pnpm-lock.yaml` were not touched — another session has those open.

## What was built

- `apps/mobile/app/(auth)/onboarding.tsx` — auto-rotating 4-slide carousel (emoji-in-circle placeholder illustrations, no new native dependency), "Continue to App" button, skips itself on repeat launches via `src/auth/onboarding-flag.ts`.
- `apps/mobile/app/(auth)/portal-select.tsx` — compact list of the five portals (Parent, Teacher, Gateman, Conductor, School Admin).
- Parent stack: `parent/login.tsx` (email/phone toggle, blocks the mock unverified phone with the exact required message), `parent/signup-step1.tsx`, `signup-step2.tsx`, `signup-step3.tsx` (email OTP), `parent/forgot-password.tsx`.
- Teacher and School Admin stacks share `src/components/auth/SchoolPicker.tsx` (2-char minimum, refine message over 3 matches, pinned school in `AsyncStorage` per role) plus `school-select.tsx`, `login.tsx`, `set-password.tsx`, `forgot-password.tsx` each.
- Gateman and Conductor stacks reuse `src/components/auth/ProvisionedLoginScreen.tsx`, `ProvisionedSetPasswordScreen.tsx` (blocks Android hardware back), and `ProvisionedForgotPasswordScreen.tsx` — no school context.
- `apps/mobile/app/(auth)/signed-in.tsx` — hard stop. Shows role/name from the store and a sign-out link. No dashboard, map, or roster code was added.
- `apps/mobile/app/index.tsx` — now redirects only to `(auth)/onboarding` or `(auth)/signed-in`. The old `(parent)`, `(gatekeeper)`, `(conductor)`, `(school-admin)` route groups are left in the tree, untouched, and unlinked.
- Deleted `apps/mobile/app/(auth)/login.tsx`, the old single-file portal-and-login screen it replaces.

## Mock rules (no network calls)

`src/auth/mock-directory.ts` and `src/auth/mock-auth-api.ts`: fixed unverified demo phone `+91 98000 00000`; provisioned IDs ending in `1` trigger first-login; any 6-digit OTP display is generated and shown on-screen (same "Development OTP" pattern already used on the web dashboard). `src/auth/session.ts` builds a `User` and calls the existing `useAuthStore.setAuth`, so the real login later only needs to swap the mock functions for `apiClient` calls.

## Checks

- `pnpm --filter @minaker/mobile typecheck` exits 0.
- No new dependency was added; `package.json` was not touched.
- `git status --short` confirms no file outside `apps/mobile/app/(auth)/**`, `apps/mobile/app/index.tsx`, and the new `apps/mobile/src/{auth,components/auth,design}/` was changed.
