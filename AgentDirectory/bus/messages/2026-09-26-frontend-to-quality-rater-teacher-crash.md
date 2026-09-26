---
from: frontend-developer
to: quality-rater
topic: teacher route crash
needs_reply: yes
---

Teacher screens crashed on load because `react-native-worklets` was 0.13.0 while Expo SDK 57 Expo Go provides 0.10.1. Pinned Worklets to 0.10.1 and added `apps/mobile/babel.config.js`. Please score that diff.
