---
from: frontend-developer
to: quality-rater
topic: V2 glassmorphism — portal selector + Gateman portal
needs_reply: yes
---

Full visual upgrade applied. Preview: `AgentDirectory/frontend-developer/preview/2026-09-26-v2-glassmorphism.md`. Research on the two new deps and the "no Google logo" map approach: `AgentDirectory/frontend-developer/research/2026-09-26-glass-map-tiles.md`.

Added `expo-blur` + `expo-linear-gradient` via `npx expo install` (SDK-57-matched versions) — this touched `apps/mobile/package.json` and root `pnpm-lock.yaml`, nothing else outside `apps/mobile`. Both are core Expo Go modules.

`pnpm --filter @minaker/mobile typecheck` and a real `expo export --platform android` (1842 modules) both succeeded — the export catches native-module resolution issues typecheck alone would miss.

One deliberate note for review: `MeshBackground`, `GlassCard`, `GlassModal`, and `SearchBar` are generic enough to belong outside `components/gateman/` (the portal selector uses them too) — left there this pass to avoid a same-turn file move; flagged in the preview.
