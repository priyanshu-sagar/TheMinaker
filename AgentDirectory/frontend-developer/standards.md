# Frontend standard

- Web is the Next.js admin dashboard. Mobile is one Expo app.
- Portals: `(parent)`, `(gatekeeper)`, `(conductor)`, `(school-admin)`. Teachers use the school-admin portal.
- Attendance UI is a roster. No QR scanner.
- Live bus position comes from the tracking socket, not a tight poll.
- Roles, attendance, and trip status come from `@minaker/shared-types`.
- Do not invent API routes. Ask the backend role on the bus first.
- A visible change records the route, the role, and the empty and error states you checked.
- Confirm Next.js or Expo APIs against current docs and save the URL under `research/`.
