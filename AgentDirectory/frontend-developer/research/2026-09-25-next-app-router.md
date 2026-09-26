# Next.js App Router client pages

Date: 2026-09-25

Source: https://nextjs.org/docs/14/app/building-your-application/rendering/client-components

`apps/web` uses Next.js 14.2.18. Login and the admin portals read `localStorage` and call `fetch`, so those pages are Client Components (`'use client'`). A page that calls `useSearchParams` is wrapped in `Suspense`, which Next.js 14 requires during static rendering.

Tailwind is loaded from `apps/web/src/app/globals.css`. The web app had no `tailwind.config.js`, `postcss.config.js`, or `tsconfig.json` on disk, so those files are added under `apps/web` so the existing Tailwind directives compile.
