# Fix — Action Inbox infinite render loop

Date: 2026-09-26

## Bug

Opening the Action Inbox tab (the second bottom tab) crashed with:

```
ERROR  The result of getSnapshot should be cached to avoid an infinite loop
ERROR  Maximum update depth exceeded.
```

Cause: `apps/mobile/app/(gateman)/inbox.tsx` selected from `useGatemanStore` with

```ts
const counts = useGatemanStore((state) => ({
  profiles: state.profileApprovals.length,
  edits: state.editRequests.length,
  alerts: state.geofenceAlerts.length,
}));
```

Zustand v5's `useStore` is built on `useSyncExternalStore`, which compares the selector's return value with `Object.is`. A selector that returns a new object literal produces a different reference every render, so React sees "state changed" on every render and re-renders forever.

## Fix

Select each count as its own primitive (`profileApprovals.length`, etc.), which compares by value and is stable when unchanged, then combine them with `useMemo` for the object `TopTabBar` expects. Checked every other `useGatemanStore` call in the codebase — all of them return either a raw array/primitive already stored in state or a plain number expression, none return a fresh object or array, so this was the only occurrence.

## Check

`pnpm --filter @minaker/mobile typecheck` exits 0. No other file was touched.
