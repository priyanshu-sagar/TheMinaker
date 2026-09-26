# Glassmorphism deps and generic map tiles

Date: 2026-09-26

- `expo-blur` and `expo-linear-gradient` are official Expo SDK modules, both bundled in Expo Go for SDK 57 — installed via `npx expo install expo-blur expo-linear-gradient`, which resolved `expo-blur@~57.0.3` and `expo-linear-gradient@~57.0.2` to match the installed `expo@~57.0.25`. No custom dev client needed.
- `react-native-maps` `UrlTile` overlaying OpenStreetMap raster tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) is the standard community workaround for a Google-logo-free "generic" basemap with `react-native-maps`, since the library only ships native Apple/Google providers and has no built-in neutral tile source. Source: react-native-maps README, "Tile overlays" section (`UrlTile` component), and OpenStreetMap's tile usage policy page (`https://operations.osmfoundation.org/policies/tiles/`) — used here only for a demo/dev build, consistent with that policy's guidance for light, non-production traffic.
