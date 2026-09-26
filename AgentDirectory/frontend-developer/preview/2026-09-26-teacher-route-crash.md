# Teacher route crash

Date: 2026-09-26

Every `/(teacher)` screen imports Reanimated. Reanimated 4.5.1 calls `runOnUISync` while the module loads. The app had `react-native-worklets` 0.13.0, but Expo SDK 57's Expo Go binary is Worklets 0.10.1 (`expo/bundledNativeModules.json`). That native method was missing, so the screen module threw `undefined is not a function` and Expo Router reported a missing default export.

Fix: pin `react-native-worklets` to 0.10.1, add `apps/mobile/babel.config.js` with `babel-preset-expo`, and call the named `createAnimatedComponent` export. Reload Metro with a cleared cache.
