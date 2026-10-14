# Cursor CLI Handoff Prompt — TheMinaker Frontend

> **Copy everything below this line and paste it as your first message to Cursor CLI.**

---

## 🧠 Model Selection

**Use: Grok 4.7 (500K context, Medium effort)**

Why:
- 500K context window = can hold the ENTIRE codebase in memory at once. This project has ~80 files in `apps/mobile/`. You need the large window.
- "Medium effort" is sufficient for frontend UI work — saves tokens without sacrificing quality.
- Grok 4.6 is faster but has a smaller effective window. Avoid it for this project.

**Always set effort to MAX when asked to do a full portal rebuild. Use Medium for targeted fixes.**

---

## 🏗️ Project Overview

**TheMinaker** is a multi-tenant school bus & attendance SaaS for India. You are working ONLY on the React Native mobile app (`apps/mobile/`). Do NOT touch the backend (`apps/api/`), web app (`apps/web/`), or database schema.

**Monorepo root:** `C:\Users\ps639\Desktop\TheMinaker`
**Mobile app:** `C:\Users\ps639\Desktop\TheMinaker\apps\mobile\`

### Tech Stack (mobile only)
| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 57, Expo Router v3 |
| Language | TypeScript (strict) |
| Animations | react-native-reanimated (spring physics) |
| Haptics | expo-haptics |
| Blur/Glass | expo-blur (BlurView) |
| Gradients | expo-linear-gradient (LinearGradient) |
| SVG | react-native-svg |
| Maps | react-native-maps |
| State | Zustand (per-portal stores, mock data only) |
| Design tokens | `apps/mobile/src/design/tokens.ts` |

---

## 📁 Critical File Map

```
apps/mobile/
├── app/
│   ├── index.tsx                      ← Root redirect (checks auth state)
│   ├── (auth)/
│   │   ├── onboarding.tsx             ← Splash screen (dark hero + SVG wave)
│   │   ├── portal-showcase.tsx        ← 2x2 portal tile grid + carousel
│   │   ├── portal-select.tsx          ← OLD (kept but unused)
│   │   ├── parent/login.tsx           ← Parent login
│   │   ├── gateman/login.tsx          ← Gateman login
│   │   ├── conductor/login.tsx        ← Conductor login
│   │   └── school-admin/school-select.tsx
│   ├── (parent)/
│   │   ├── index.tsx                  ← Live tracking MapView ✅
│   │   ├── attendance.tsx             ← PLACEHOLDER — needs real content
│   │   └── notifications.tsx          ← PLACEHOLDER — needs real content
│   ├── (teacher)/                     ← ALL TABS COMPLETE ✅
│   ├── (gateman)/                     ← ALL TABS COMPLETE ✅
│   │   ├── index.tsx                  ← Command Center (metric cards, map, 3x2 fleet grid)
│   │   ├── inbox.tsx                  ← Glass pill segmented control (Profiles/Edits/Geofence)
│   │   ├── attendance.tsx             ← 3D pill toggles per student
│   │   └── settings.tsx               ← iOS-style glass sections
│   ├── (conductor)/                   ← ALL TABS COMPLETE ✅
│   └── (school-admin)/
│       └── index.tsx                  ← Dashboard only — NEEDS MORE SCREENS
│
├── src/
│   ├── design/
│   │   └── tokens.ts                  ← ★ SINGLE SOURCE OF TRUTH. Import ONLY from here.
│   ├── components/
│   │   ├── glass/
│   │   │   ├── MeshBackground.tsx     ← Root wrapper for every screen
│   │   │   ├── GlassCard.tsx          ← Every card/panel
│   │   │   ├── GlassModal.tsx         ← Every modal/bottom sheet
│   │   │   ├── AnimatedPressable.tsx  ← Every tappable element
│   │   │   ├── FadeInList.tsx         ← FadeInRow for list items
│   │   │   └── SearchBar.tsx
│   │   ├── shared/
│   │   │   └── StatusPill.tsx         ← Reusable status badges
│   │   ├── auth/                      ← All auth screen building blocks
│   │   ├── gateman/                   ← Gateman-specific components
│   │   └── teacher/                   ← Teacher-specific components
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── gateman.store.ts           ← Mock data: fleet, roster, approvals, alerts, directory
│   │   └── teacher.store.ts
│   └── hooks/
│       ├── use-live-tracking.ts
│       └── use-telemetry.ts
```

---

## 🎨 Design System — THE LAW

**ALL styling imports from `@/design/tokens`. NEVER hardcode hex values.**

```typescript
import {
  colors, glass, spacing, radius, typography, shadows,
  palette, portalAccents, springs, STAGGER_MS
} from '@/design/tokens';
```

### Portal Accent Colors
```
parent      → palette.blue    (#3B82F6) → palette.blueLight
teacher     → palette.violet  (#8B5CF6) → palette.violetLight
gateman     → palette.orange  (#F97316) → palette.orangeLight
conductor   → palette.emerald (#10B981) → palette.emeraldLight
schoolAdmin → palette.slate   (#334155) → palette.slateLight
```

### The 10 Mandatory Rules — Every Screen Must Follow
1. Root = `<MeshBackground>` (never plain `<View>` or `<SafeAreaView>` as root)
2. Cards = `<GlassCard style={shadows.md}>` (never flat white View)
3. Taps = `<AnimatedPressable haptic="medium">` (never plain `<Pressable>`)
4. List rows = `<FadeInRow index={i}>` for first 12 items only
5. Modals = `<GlassModal>` or BlurView bottom sheet pattern
6. Tab bars = BlurView frosted background (NOT flat white)
7. Colors = tokens only (never `'#fff'`, never `'white'`, never hardcoded hex)
8. Orbs = 2-3 absolutely-positioned circles with `glass.orb1/orb2/orb3` on every full screen
9. Status badges = `<StatusPill variant="success|error|warning|...">` component
10. Shadows = spread `...shadows.sm / .md / .lg` on GlassCard

### Standard Screen Template
```tsx
export default function MyScreen() {
  return (
    <MeshBackground>
      {/* Decorative orbs */}
      <View style={{ position:'absolute', top:-60, right:-40, width:200, height:200,
        borderRadius:999, backgroundColor:glass.orb1 }} pointerEvents="none" />
      <View style={{ position:'absolute', bottom:80, left:-80, width:260, height:260,
        borderRadius:999, backgroundColor:glass.orb2 }} pointerEvents="none" />

      <SafeAreaView style={{ flex:1 }} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: glass.border }}>
          <Text style={typography.title}>Screen Title</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Subtitle</Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <GlassCard style={shadows.md}>
            {/* card content */}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}
```

### Gradient Button Template
```tsx
<AnimatedPressable onPress={fn} haptic="medium">
  <LinearGradient
    colors={[colors.primary, '#6366F1']}
    style={{ borderRadius: radius.full, paddingVertical: 16,
      paddingHorizontal: spacing.xxl, alignItems: 'center' }}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
  >
    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Label</Text>
  </LinearGradient>
</AnimatedPressable>
```

### Frosted Glass Tab Bar Template (in `_layout.tsx`)
```tsx
tabBarBackground: () => (
  <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
),
tabBarStyle: {
  backgroundColor: 'transparent',
  borderTopColor: glass.border,
  borderTopWidth: 1,
},
tabBarActiveTintColor: portalAccents.parent.from,
tabBarInactiveTintColor: colors.textMuted,
```

### FlatList Best Practice (avoids jitter & VirtualizedList warnings)
```tsx
// NEVER nest FlatList inside ScrollView — convert inner FlatList to .map() instead
// For standalone FlatList screens:
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  getItemLayout={(_d, i) => ({ length: 80, offset: 80 * i, index: i })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={12}
  renderItem={({ item, index }) =>
    index < 12
      ? <FadeInRow index={index}><Row item={item} /></FadeInRow>
      : <Row item={item} />
  }
/>
```

---

## 📐 Current State of Each Portal

### ✅ COMPLETE (do NOT rebuild unless user asks)
- **Auth/Onboarding**: Splash screen → Portal showcase → Login screens (all portals)
- **Teacher Portal**: Dashboard, Roster, Academics, Comms, Settings — all glassmorphism applied
- **Gateman Portal**: Command Center (metric cards, 38%-height map, 3×2 fleet grid sorted by departure time), Action Inbox (glass pill segmented control), Attendance (3D pill toggles), Settings (iOS-style sections)
- **Conductor Portal**: Trip dashboard, Student manifest with React.memo + getItemLayout

### 🟡 NEEDS WORK (priority order)
1. **School Admin Portal** — only has `index.tsx` (stats dashboard). Missing:
   - Student Roster screen (search, filter, CRUD actions)
   - Staff Management screen
   - Fleet & Routes configuration screen
   - Reports/Analytics screen
   - Settings screen

2. **Parent Portal** — `attendance.tsx` and `notifications.tsx` are empty placeholders. Need:
   - Attendance: scrollable dated list, month filter, StatusPill per day, summary % card
   - Notifications: alert cards (boarded/arrived/absent), read/unread state, grouped by date

---

## 🤖 MANDATORY: Multi-Agent Workflow

**This is the most important rule for how you work.**

When a task involves building multiple screens or doing multiple large changes, you MUST split the work across parallel agents (subagents). Do NOT do everything sequentially in one pass.

### How to structure agents:

**Rule: One agent = one file (or one tightly related group of files)**

Example — if asked to build 4 School Admin screens:
- Agent 1: `(school-admin)/roster.tsx`
- Agent 2: `(school-admin)/fleet.tsx`
- Agent 3: `(school-admin)/reports.tsx`
- Agent 4: `(school-admin)/settings.tsx`

Run all 4 in parallel. Each agent:
1. Reads the relevant files (tokens.ts, store, existing screens for reference)
2. Builds the screen following the 10 mandatory rules
3. Runs `npx tsc --noEmit` to verify TypeScript
4. Does `git add <file>; git commit -m "feat(ui): ..."`
5. Reports back with a summary

### Git rules:
- Commit after every agent finishes their file
- Never `git push` unless user explicitly says "push to GitHub"
- Commit format: `feat(ui): <portal> <screen> — <brief description>`

---

## ⛔ Absolute Don'ts

| Don't | Why |
|---|---|
| `backgroundColor: 'white'` on Text | Breaks glass transparency |
| Hardcode hex colors | Use tokens |
| `<Pressable>` | Use `<AnimatedPressable>` |
| Flat white `<View>` for cards | Use `<GlassCard>` |
| `FlatList` inside `ScrollView` | VirtualizedList crash |
| `TypeORM synchronize: true` | Backend constraint, unrelated but never touch |
| `git push` without user permission | User controls when to push |
| Touch backend/API/database files | Frontend only |
| Add npm packages without checking | May already exist |

---

## 📦 Already Installed Packages (don't re-add)
- `react-native-svg` v15.15.4
- `expo-blur`, `expo-linear-gradient`, `expo-haptics`
- `react-native-reanimated`, `react-native-maps`
- `react-native-safe-area-context`
- `zustand`

---

## 🚀 How to Start Your First Task

When the user gives you a task, always:

1. **Identify** how many screens/files need to change
2. **Plan** which agents handle which files
3. **Launch agents in parallel** (not sequentially)
4. **Each agent** reads its target files, builds, typechecks, commits
5. **Report back** with a summary table of what each agent did

Do NOT ask clarifying questions about the design system — it is fully defined in `tokens.ts` and this document. Start building immediately.

---

## 📝 Quick Reference: Standard Imports for Any New Screen

```tsx
// Design system
import { colors, glass, spacing, radius, typography, shadows, palette, portalAccents } from '@/design/tokens';

// Glass components
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';

// Shared
import { StatusPill } from '@/components/shared/StatusPill';

// Expo
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle } from 'react-native-svg';

// Reanimated
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle,
  withSpring, withTiming
} from 'react-native-reanimated';

// Navigation
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
```
