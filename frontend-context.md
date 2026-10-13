# TheMinaker — Frontend Context Document
**Generated:** 2026-10-14 | **For:** Gemini Prompt Generation

---

## 1. What Is This App?

**TheMinaker** is a multi-tenant, hardware-free school bus and attendance SaaS for India. The mobile app (React Native / Expo SDK 57) serves **5 distinct user roles**, each with their own portal, navigation structure, and feature set. All portals share a unified "Premium 3D Glassmorphism" design language.

---

## 2. Tech Stack (Mobile)

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 57 (Expo Router v3 file-based routing) |
| Language | TypeScript (strict) |
| Navigation | expo-router (Stack + Tab navigators) |
| UI Animations | react-native-reanimated (spring physics, FadeInDown, useSharedValue) |
| Haptics | expo-haptics |
| Blur/Glass | expo-blur (BlurView) |
| Gradients | expo-linear-gradient (LinearGradient) |
| SVG | react-native-svg (Svg, Path, Circle, etc.) |
| Maps | react-native-maps |
| State Management | Zustand (per-portal stores) |
| Design Tokens | apps/mobile/src/design/tokens.ts (SINGLE SOURCE OF TRUTH) |

---

## 3. Project Folder Structure

```
apps/mobile/
├── app/                          ← Expo Router file-based routes
│   ├── _layout.tsx               ← Root layout (font loading, auth check)
│   ├── index.tsx                 ← Root redirect → /(auth)/onboarding
│   ├── (auth)/                   ← Pre-login screens (public)
│   │   ├── _layout.tsx           ← Auth Stack navigator
│   │   ├── onboarding.tsx        ← SCREEN 1: Splash / Intro (NEW)
│   │   ├── portal-showcase.tsx   ← SCREEN 2: Portal carousel selector (NEW)
│   │   ├── portal-select.tsx     ← OLD portal list (kept, unused now)
│   │   ├── signed-in.tsx         ← Post-login confirmation
│   │   ├── parent/               ← Parent auth screens
│   │   │   ├── login.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── signup-step1.tsx
│   │   │   ├── signup-step2.tsx
│   │   │   └── signup-step3.tsx
│   │   ├── teacher/              ← Teacher auth screens
│   │   │   ├── login.tsx
│   │   │   ├── school-select.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── set-password.tsx
│   │   ├── gateman/              ← Gateman auth screens
│   │   │   ├── login.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── set-password.tsx
│   │   ├── conductor/            ← Conductor auth screens
│   │   │   ├── login.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── set-password.tsx
│   │   └── school-admin/         ← School Admin auth screens
│   │       ├── login.tsx
│   │       ├── school-select.tsx
│   │       ├── forgot-password.tsx
│   │       └── set-password.tsx
│   ├── (parent)/                 ← Parent portal (tab-based)
│   │   ├── _layout.tsx           ← Tab nav (frosted glass tab bar)
│   │   ├── index.tsx             ← Live Tracking (MapView + glass overlay)
│   │   ├── attendance.tsx        ← Attendance history (placeholder)
│   │   └── notifications.tsx     ← Alerts (placeholder)
│   ├── (teacher)/                ← Teacher portal (tab-based)
│   │   ├── _layout.tsx
│   │   ├── index.tsx             ← Teacher Dashboard
│   │   ├── roster.tsx            ← Class Roster + attendance marking
│   │   ├── academics.tsx         ← Tests, marks, materials
│   │   ├── comms.tsx             ← Messaging / announcements
│   │   └── settings.tsx          ← Profile + preferences
│   ├── (gateman)/                ← Gateman portal (tab-based) ✅ MOST COMPLETE
│   │   ├── _layout.tsx
│   │   ├── index.tsx             ← Live Fleet Map + bus cards
│   │   ├── attendance.tsx        ← Master attendance by route
│   │   ├── inbox.tsx             ← Approval requests inbox
│   │   └── settings.tsx          ← Profile + directory
│   ├── (conductor)/              ← Conductor portal (tab-based)
│   │   ├── _layout.tsx
│   │   ├── index.tsx             ← Trip dashboard (start/end trip)
│   │   └── manifest.tsx          ← Student manifest + attendance marking
│   ├── (school-admin)/           ← School Admin portal (tab-based)
│   │   ├── _layout.tsx
│   │   └── index.tsx             ← Stats dashboard (needs more screens)
│   └── (gatekeeper)/             ← Gatekeeper portal (legacy stub)
│       ├── _layout.tsx
│       └── index.tsx
│
├── src/
│   ├── design/
│   │   ├── tokens.ts             ← ★ MASTER DESIGN SYSTEM (import only from here)
│   │   ├── theme.ts              ← Re-exports from tokens (backwards compat)
│   │   ├── glass-theme.ts        ← Re-exports from tokens (backwards compat)
│   │   ├── gateman-theme.ts      ← Re-exports from tokens (backwards compat)
│   │   └── teacher-theme.ts      ← Re-exports from tokens (backwards compat)
│   │
│   ├── components/
│   │   ├── glass/                ← ★ CORE SHARED GLASS PRIMITIVES
│   │   │   ├── MeshBackground.tsx     ← Root wrapper: layered gradients + 3 floating orbs
│   │   │   ├── GlassCard.tsx          ← BlurView card with border + shadow
│   │   │   ├── GlassModal.tsx         ← Frosted bottom sheet modal
│   │   │   ├── AnimatedPressable.tsx  ← Spring press + haptics (use on ALL taps)
│   │   │   ├── FadeInList.tsx         ← FadeInRow for staggered list entrance
│   │   │   ├── SearchBar.tsx          ← Glassmorphic search input
│   │   │   └── Fab.tsx                ← Floating action button
│   │   ├── shared/
│   │   │   ├── StatusPill.tsx         ← Reusable status badge (success/error/warning/etc.)
│   │   │   ├── TabBarIcon.tsx
│   │   │   └── RequestModificationModal.tsx
│   │   ├── auth/                 ← Auth screen building blocks
│   │   │   ├── Screen.tsx             ← AuthScreen wrapper (MeshBackground + orbs)
│   │   │   ├── FormField.tsx          ← Glassmorphic input with focus glow
│   │   │   ├── Buttons.tsx            ← PrimaryButton (gradient), SecondaryButton, LinkButton
│   │   │   ├── Banner.tsx             ← BlurView error/info/warning banner
│   │   │   ├── BackRow.tsx            ← Animated back button
│   │   │   ├── ProgressDots.tsx       ← Step pills (active = gradient)
│   │   │   ├── StepHeader.tsx         ← Step number badge
│   │   │   ├── OptionRow.tsx          ← Selectable option row (glass)
│   │   │   ├── SegmentedToggle.tsx    ← BlurView tab toggle
│   │   │   ├── SchoolPicker.tsx       ← School selection list (glass)
│   │   │   ├── Banner.tsx
│   │   │   ├── ProvisionedLoginScreen.tsx     ← Shared login for Teacher/Gateman/Conductor/Admin
│   │   │   ├── ProvisionedForgotPasswordScreen.tsx
│   │   │   └── ProvisionedSetPasswordScreen.tsx
│   │   ├── gateman/              ← Gateman-specific components (all polished)
│   │   │   ├── ActionCard.tsx, BusDetailsModal.tsx, BusRouteListItem.tsx
│   │   │   ├── BusSelectorPills.tsx, DiffRow.tsx, EditRequestsList.tsx
│   │   │   ├── FullScreenMapModal.tsx, GeofenceAlertsList.tsx, MetricChip.tsx
│   │   │   ├── MiniMapSnippet.tsx, ProfileApprovalsList.tsx, ProfileDetailModal.tsx
│   │   │   ├── StatusBadge.tsx, StudentRosterRow.tsx, TopTabBar.tsx
│   │   └── teacher/              ← Teacher-specific components (all polished)
│   │       ├── CampusStatusBadge.tsx, ClassSelector.tsx, CommsFeedItem.tsx
│   │       ├── CommsSegment.tsx, CreateTestModal.tsx, ManagementModals.tsx
│   │       ├── MaterialsList.tsx, NewMessageModal.tsx, QuickActionsRow.tsx
│   │       ├── ScheduleCard.tsx, StudentDetailsModal.tsx, StudentRosterCard.tsx
│   │       ├── TestDetailModal.tsx, TestListItem.tsx, UpcomingTasksCard.tsx
│   │       └── UploadMaterialModal.tsx
│   │
│   ├── store/
│   │   ├── auth.store.ts         ← Zustand: user session, role, tenantId
│   │   ├── gateman.store.ts      ← Zustand: fleet, students, approvals (mock data)
│   │   ├── teacher.store.ts      ← Zustand: class, roster, comms (mock data)
│   │   └── attendance.store.ts   ← Zustand: attendance state
│   │
│   ├── hooks/
│   │   ├── use-live-tracking.ts  ← WebSocket hook for live bus GPS
│   │   ├── use-telemetry.ts      ← GPS broadcasting hook (conductor)
│   │   └── use-student-roster.ts ← Student list hook
│   │
│   └── api/
│       └── client.ts             ← Axios API client (baseURL from env)
```

---

## 4. Design System — tokens.ts (THE LAW)

**File:** `apps/mobile/src/design/tokens.ts`
**Rule:** ALL styling MUST import from here. Never hardcode hex values.

### Key Exports:

```typescript
// Colours
palette         // Raw colour values (ink100, brand, emerald, rose, etc.)
colors          // Semantic map (textPrimary, surface, primary, success, error, etc.)
portalAccents   // Per-portal gradient pairs { parent, teacher, gateman, conductor, schoolAdmin }
glass           // Glass tokens (cardBg, border, shadow, orb1-4, blurCard, blurModal)
meshLayers      // Gradient layer config for MeshBackground

// Layout
spacing         // { xxs:2, xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:48 }
radius          // { xs:6, sm:10, md:14, lg:20, xl:28, full:999 }
shadows         // { sm, md, lg, modal } — shadow objects ready to spread

// Typography
typography      // { hero, title, heading, body, bodyBold, label, caption, overline, subtitle }

// Animation
springs         // { snappy, bounce, smooth } — withSpring config objects
STAGGER_MS      // 45 — delay per list item
FADE_DURATION_MS // 320
```

### Portal Accent Colors:
```
parent      → #3B82F6 (blue)   → #60A5FA
teacher     → #8B5CF6 (violet) → #A78BFA
gateman     → #F97316 (orange) → #FB923C
conductor   → #10B981 (emerald)→ #34D399
schoolAdmin → #334155 (slate)  → #64748B
```

---

## 5. The 10 Mandatory UI Rules (Every Agent Must Follow)

1. **Every screen root** = `<MeshBackground>` from `@/components/glass/MeshBackground`
2. **Every card/panel** = `<GlassCard>` from `@/components/glass/GlassCard`
3. **Every tap target** = `<AnimatedPressable>` from `@/components/glass/AnimatedPressable`
4. **Every FlatList row** = `<FadeInRow index={i}>` from `@/components/glass/FadeInList`
5. **Every modal** = `<GlassModal>` from `@/components/glass/GlassModal`
6. **Tab bars** = BlurView frosted glass background, NOT flat white
7. **Import ALL colours** from `@/design/tokens` — NEVER hardcode hex
8. **Decorative orbs**: 2-3 absolutely positioned circles with `glass.orb1–4` colours behind content
9. **Status badges** = `<StatusPill>` from `@/components/shared/StatusPill`
10. **Shadows** = spread `shadows.sm / .md / .lg` from tokens on cards

---

## 6. Portal Completion Status

### ✅ Gateman Portal — FULLY COMPLETE
- **4 tabs:** Live Fleet, Attendance, Inbox, Settings
- Rich components: Bus selector pills, map snippet, geofence alerts, profile approvals, edit requests diff, student roster, full-screen map modal
- All glassmorphism applied, all tokens used, all taps use AnimatedPressable

### ✅ Teacher Portal — FULLY COMPLETE
- **5 tabs:** Dashboard, Roster, Academics, Comms, Settings
- Rich components: Class selector, schedule cards, materials list, test list/detail, comms feed, new message modal, student details modal, quick actions
- All glassmorphism applied

### ✅ Auth / Onboarding — FULLY COMPLETE
**New 2-screen pre-login flow:**
- **Screen 1 (onboarding.tsx):** Dark navy hero gradient (70%), SVG cubic bezier wave divider, SVG bus + campus illustration, staggered entrance animations, bouncing arrow CTA → routes to portal-showcase
- **Screen 2 (portal-showcase.tsx):** 4 portal nav tiles (gradient active state), swipeable carousel (one slide per portal), each slide has tagline + description + feature chips + "Learn More" button, Learn More opens BlurView bottom sheet modal with login info + password reset + FAQs, dynamic "Continue as [Role]" CTA button
- **Shared auth components:** AuthScreen (MeshBackground), FormField (glassmorphic focus glow), PrimaryButton (gradient), ProgressDots (gradient pills), SegmentedToggle (BlurView), SchoolPicker, Banner (BlurView), BackRow, ProvisionedLoginScreen

### ✅ Conductor Portal — COMPLETE
- **2 tabs:** Trip Dashboard, Manifest
- Trip Dashboard: MeshBackground + orbs, emerald gradient greeting card, large trip status GlassCard, gradient Start/End trip button (emerald→rose), 3 mini stat tiles
- Manifest: Student list with React.memo, getItemLayout (80px fixed), removeClippedSubviews, FadeInRow (first 12 only), Present/Absent/Late badge toggle

### ✅ School Admin Portal — BASIC (needs more screens)
- **1 screen:** Dashboard only
- Stats grid: 4 GlassCard tiles (2x2), FadeInRow, AnimatedPressable, emoji + big number + label

### 🟡 Parent Portal — PARTIAL
- **3 tabs:** Live Tracking, Attendance, Notifications
- Live Tracking: MapView (60% height) + floating GlassCard overlay at bottom (status, ETA, metric chips), animated bus markers
- Attendance: placeholder screen (content to be built)
- Notifications: placeholder screen (content to be built)

---

## 7. What Still Needs Building (Frontend TODO)

### HIGH PRIORITY:
1. **School Admin Portal** — needs more screens:
   - Student Roster management screen
   - Staff management screen
   - Fleet & Routes configuration screen
   - Reports screen
   - Settings screen

2. **Parent Portal — Attendance History** — currently placeholder, needs:
   - Scrollable list of dated attendance records
   - Filter by month
   - StatusPill per day (Present/Absent/Late)
   - Summary card at top (monthly %)

3. **Parent Portal — Notifications** — currently placeholder, needs:
   - List of alert cards (bus departed, arrived, child marked absent etc.)
   - Read/unread state
   - Grouped by date

### MEDIUM PRIORITY:
4. **Conductor Portal** — possible additions:
   - Trip history screen
   - Route map view

5. **School Admin Portal** — analytics/reports screen

---

## 8. Navigation Flow

```
App start
  → index.tsx → /(auth)/onboarding

/(auth)/onboarding          (Splash: dark hero + SVG wave + "Get Started")
  → /(auth)/portal-showcase

/(auth)/portal-showcase     (4 tiles + carousel + Learn More modal)
  → Tapping "Continue as Parent"    → /(auth)/parent/login
  → Tapping "Continue as Gateman"   → /(auth)/gateman/login
  → Tapping "Continue as Conductor" → /(auth)/conductor/login
  → Tapping "Continue as Admin"     → /(auth)/school-admin/school-select

After login → respective portal:
  Parent    → /(parent)/index
  Teacher   → /(teacher)/index
  Gateman   → /(gateman)/index
  Conductor → /(conductor)/index
  Admin     → /(school-admin)/index
```

---

## 9. Key Component Patterns (Copy These)

### Glass Card with Orbs Screen Pattern:
```tsx
<MeshBackground>
  {/* Decorative orbs */}
  <View style={{ position:'absolute', top:-60, right:-40, width:200, height:200, borderRadius:999, backgroundColor:glass.orb1 }} pointerEvents="none" />
  <View style={{ position:'absolute', bottom:100, left:-80, width:280, height:280, borderRadius:999, backgroundColor:glass.orb2 }} pointerEvents="none" />
  
  <SafeAreaView style={{flex:1}} edges={['top']}>
    <GlassCard style={shadows.md}>
      {/* content */}
    </GlassCard>
  </SafeAreaView>
</MeshBackground>
```

### Gradient Button Pattern:
```tsx
<AnimatedPressable onPress={fn} haptic="medium">
  <LinearGradient colors={[colors.primary, '#6366F1']} style={{borderRadius:radius.full, paddingVertical:16, alignItems:'center'}} start={{x:0,y:0}} end={{x:1,y:0}}>
    <Text style={{color:'white', fontWeight:'700', fontSize:16}}>Label</Text>
  </LinearGradient>
</AnimatedPressable>
```

### Frosted Glass Tab Bar Pattern (in _layout.tsx):
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

### FlatList Best Practice (Conductor pattern):
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  getItemLayout={(_data, index) => ({ length: 80, offset: 80 * index, index })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={12}
  renderItem={({ item, index }) =>
    index < 12 ? (
      <FadeInRow index={index}><ItemComponent item={item} /></FadeInRow>
    ) : (
      <ItemComponent item={item} />
    )
  }
/>
```

---

## 10. Absolute Rules for Any New Screen

- ❌ Never use `backgroundColor: 'white'` on a `<Text>` element
- ❌ Never hardcode hex colours (e.g., `#3B82F6`) — use `colors.primary` from tokens
- ❌ Never use plain `<Pressable>` — always use `<AnimatedPressable>`
- ❌ Never use flat `<View style={{backgroundColor:'white'}}>` for cards — use `<GlassCard>`
- ❌ Never add new npm packages without checking if the functionality exists already
- ✅ Always spread `shadows.sm / .md / .lg` on GlassCard
- ✅ Always use `typography.*` objects from tokens for text styles
- ✅ Always add at least 2 decorative orbs on new full screens
- ✅ Always wrap new modal in `<GlassModal>` or use BlurView + Modal pattern
- ✅ Always use `SafeAreaView` with `edges={['top']}` or `['top','bottom']`

---

## 11. Imports Cheatsheet

```typescript
// Design system
import { colors, glass, spacing, radius, typography, shadows, palette, portalAccents, springs, STAGGER_MS } from '@/design/tokens';

// Glass components
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { SearchBar } from '@/components/glass/SearchBar';

// Shared
import { StatusPill } from '@/components/shared/StatusPill';

// Expo
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

// Reanimated
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
```
