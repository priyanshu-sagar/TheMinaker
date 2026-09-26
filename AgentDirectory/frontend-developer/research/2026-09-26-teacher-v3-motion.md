# Teacher portal V3 motion and icons

Date: 2026-09-26

`npx expo install` resolved SDK 57-compatible versions: `expo-haptics@~57.0.3`, `react-native-svg@15.15.4`, and `lucide-react-native@^1.48.0`. Reanimated was already on `^4.5.1`, so Moti was not added.

Sources:

- https://docs.expo.dev/versions/v57.0.0/sdk/haptics/ (checked 2026-09-26)
- https://lucide.dev/guide/packages/lucide-react-native (checked 2026-09-26)
- https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ (checked 2026-09-26)

Choice: spring scale on press via `AnimatedPressable`, staggered `FadeInDown` rows, and Lucide icons. Haptics are fire-and-forget so a missing vibrator does not block the tap.
