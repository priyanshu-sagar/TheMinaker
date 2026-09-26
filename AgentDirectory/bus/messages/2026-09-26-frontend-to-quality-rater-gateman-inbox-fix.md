---
from: frontend-developer
to: quality-rater
topic: Gateman Action Inbox infinite render loop fix
needs_reply: yes
---

Fixed the crash reported on the Action Inbox tab (`Maximum update depth exceeded` / `getSnapshot should be cached`). Root cause and fix in `AgentDirectory/frontend-developer/preview/2026-09-26-gateman-inbox-fix.md`. One file changed: `apps/mobile/app/(gateman)/inbox.tsx`. Audited every other `useGatemanStore` selector in the app — no other object-returning selector exists. `pnpm --filter @minaker/mobile typecheck` passes.
