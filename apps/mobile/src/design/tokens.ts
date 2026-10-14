/**
 * ============================================================
 * THE MINAKER — UNIFIED DESIGN SYSTEM (v4)
 * ============================================================
 *
 * SINGLE SOURCE OF TRUTH for all UI tokens across every portal.
 * Any CLI, LLM, or developer building UI for this app MUST import
 * from this file. Do NOT create new theme files.
 *
 * Design language: Premium 3D Glassmorphism + "Bubbly Floating" SaaS.
 *
 * Core visual pillars:
 *   1. MeshBackground — layered soft gradient on every screen
 *   2. GlassCard — blurred, semi-transparent, floated on shadows
 *   3. AnimatedPressable — spring-press + haptics on every touch target
 *   4. FadeInRow — staggered entrance animation on every list
 *   5. GlassModal — frosted glass bottom sheet for all modals
 * ============================================================
 */

// ─── Colour Palette ──────────────────────────────────────────

export const palette = {
  // Neutrals
  ink100: '#0f172a',   // Deep navy — primary text
  ink80:  '#1e293b',   // Secondary text
  ink60:  '#475569',   // Muted text
  ink40:  '#94a3b8',   // Placeholder / disabled
  ink20:  '#cbd5e1',   // Borders, dividers
  ink10:  '#f1f5f9',   // Very light backgrounds

  white:  '#ffffff',
  offWhite: '#f8fafc',

  // Brand
  brand:  '#4F46E5',   // Indigo — brand primary
  brandLight: '#818CF8',

  // Semantic
  emerald:  '#10B981',
  emeraldLight: '#34D399',
  rose:     '#F43F5E',
  roseLight: '#FB7185',
  amber:    '#F59E0B',
  amberLight: '#FCD34D',
  blue:     '#3B82F6',
  blueLight: '#60A5FA',
  violet:   '#8B5CF6',
  violetLight: '#A78BFA',
  orange:   '#F97316',
  orangeLight: '#FB923C',
  slate:    '#334155',
  slateLight: '#64748B',
} as const;

// ─── Semantic Colour Map ──────────────────────────────────────

export const colors = {
  // Backgrounds
  background: '#eef2ff',        // Mesh start (indigo-50 tint)
  backgroundAlt: '#f5f3ff',     // Mesh end (violet-50 tint)
  surface: 'rgba(255,255,255,0.82)',     // Glass card surface
  surfaceStrong: 'rgba(255,255,255,0.94)', // Modal / input bg

  // Text
  textPrimary:   palette.ink100,
  textSecondary: palette.ink80,
  textMuted:     palette.ink60,
  textPlaceholder: palette.ink40,

  // Borders
  border:       'rgba(255,255,255,0.45)',
  borderStrong: 'rgba(148,163,184,0.3)',
  divider:      'rgba(148,163,184,0.18)',

  // Shadows
  shadow:       palette.ink100,
  shadowLight:  'rgba(15,23,42,0.08)',

  // Primary action
  primary:         palette.brand,
  primaryPressed:  '#3730A3',
  primarySurface:  'rgba(79,70,229,0.1)',

  // Status
  success:      palette.emerald,
  successBg:    'rgba(16,185,129,0.12)',
  warning:      palette.amber,
  warningBg:    'rgba(245,158,11,0.13)',
  error:        palette.rose,
  errorBg:      'rgba(244,63,94,0.11)',
  info:         palette.blue,
  infoBg:       'rgba(59,130,246,0.11)',

  // Attendance states
  boarded:      palette.blue,
  boardedBg:    'rgba(59,130,246,0.12)',
  dropped:      palette.orange,
  droppedBg:    'rgba(249,115,22,0.12)',
  checkedOut:   palette.violet,
  checkedOutBg: 'rgba(139,92,246,0.12)',
  absent:       palette.rose,
  absentBg:     'rgba(244,63,94,0.11)',
  online:       palette.emerald,
  onlineBg:     'rgba(16,185,129,0.12)',
  offline:      palette.rose,
  offlineBg:    'rgba(244,63,94,0.11)',

  // Compatibility aliases
  neutral:      palette.slateLight,
  neutralBg:    'rgba(148,163,184,0.15)',
  danger:       palette.rose,
  dangerBg:     'rgba(244,63,94,0.11)',
  dangerBorder: 'rgba(244,63,94,0.3)',
  infoBorder:   'rgba(59,130,246,0.3)',
  warningBorder:'rgba(245,158,11,0.3)',
} as const;

// ─── Portal Accent Colours ────────────────────────────────────
// Each portal has a gradient pair + icon.

export const portalAccents = {
  parent:    { from: palette.blue,   to: palette.blueLight,   icon: '👨‍👩‍👧', label: 'Parent Portal' },
  teacher:   { from: palette.violet, to: palette.violetLight, icon: '📚', label: 'Teacher Portal' },
  gateman:   { from: palette.orange, to: palette.orangeLight, icon: '🛡️', label: 'Gateman Portal' },
  conductor: { from: palette.emerald,to: palette.emeraldLight,icon: '🚌', label: 'Conductor Portal' },
  schoolAdmin:{ from: palette.slate,  to: palette.slateLight,  icon: '🏫', label: 'School Admin' },
} as const;

// ─── Glass Tokens ─────────────────────────────────────────────

export const glass = {
  cardBg:       'rgba(255,255,255,0.75)',
  cardBgStrong: 'rgba(255,255,255,0.88)',
  border:       'rgba(255,255,255,0.45)',
  overlayBg:    'rgba(15,23,42,0.45)',
  shadow:       palette.ink100,

  // Blur intensities
  blurCard:     40,
  blurModal:    55,
  blurOverlay:  28,

  // Bubble / Orb colours for decorative background elements
  orb1: 'rgba(79,70,229,0.18)',    // Indigo orb
  orb2: 'rgba(139,92,246,0.14)',   // Violet orb
  orb3: 'rgba(59,130,246,0.12)',   // Blue orb
  orb4: 'rgba(16,185,129,0.10)',   // Emerald orb
} as const;

// ─── Mesh / Background Layers ─────────────────────────────────
// Used by MeshBackground component.

export const meshLayers = [
  { colors: ['#eef2ff', '#f5f3ff'] as const, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  { colors: ['#fff7ed00', '#ede9fe60'] as const, start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
] as const;

// ─── Spacing ──────────────────────────────────────────────────

export const spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────

export const radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
} as const;

// ─── Typography ───────────────────────────────────────────────

/**
 * backgroundColor stays transparent. On Android, an elevated parent paints
 * a solid white plate behind any Text that does not opt out.
 */
const clearText = { backgroundColor: 'transparent' as const };

export const typography = {
  // Display
  hero:     { ...clearText, fontSize: 32, fontWeight: '800' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  title:    { ...clearText, fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary, letterSpacing: -0.3 },
  heading:  { ...clearText, fontSize: 18, fontWeight: '700' as const, color: colors.textPrimary },

  // Body
  body:     { ...clearText, fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 22 },
  bodyBold: { ...clearText, fontSize: 15, fontWeight: '600' as const, color: colors.textPrimary },

  // Utility
  label:    { ...clearText, fontSize: 14, fontWeight: '600' as const, color: colors.textPrimary },
  caption:  { ...clearText, fontSize: 12, fontWeight: '400' as const, color: colors.textMuted, lineHeight: 17 },
  overline: { ...clearText, fontSize: 11, fontWeight: '700' as const, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' as const },

  // Subtitle
  subtitle: { ...clearText, fontSize: 15, fontWeight: '400' as const, color: colors.textMuted, lineHeight: 22 },
} as const;

// ─── Shadow Levels ────────────────────────────────────────────

/**
 * elevation is 0 on purpose. Android draws an opaque white backing on any
 * view (and its Text children) that has elevation and a transparent fill.
 * boxShadow is the shadow that does not do that.
 */
export const shadows = {
  sm: {
    shadowColor: glass.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    boxShadow: '0px 3px 8px rgba(15, 23, 42, 0.08)',
  },
  md: {
    shadowColor: glass.shadow,
    shadowOpacity: 0.11,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 0,
    boxShadow: '0px 6px 14px rgba(15, 23, 42, 0.12)',
  },
  lg: {
    shadowColor: glass.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 0,
    boxShadow: '0px 10px 22px rgba(15, 23, 42, 0.16)',
  },
  modal: {
    shadowColor: glass.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 },
    elevation: 0,
    boxShadow: '0px -8px 28px rgba(15, 23, 42, 0.18)',
  },
} as const;

// ─── Animation Presets ────────────────────────────────────────
// Use with react-native-reanimated withSpring()

export const springs = {
  snappy: { damping: 18, stiffness: 280, mass: 0.7 },   // Button press
  bounce: { damping: 12, stiffness: 200, mass: 0.8 },   // Card expand
  smooth: { damping: 22, stiffness: 180, mass: 1.0 },   // Tab transitions
} as const;

// ─── Stagger Delay ────────────────────────────────────────────
// FadeInRow: delay = min(index, 8) * STAGGER_MS

export const STAGGER_MS = 45;
export const FADE_DURATION_MS = 320;

// ─── Component Rules (for CLIs / LLMs) ───────────────────────
/**
 * RULES EVERY AGENT MUST FOLLOW:
 *
 * 1. EVERY screen must use <MeshBackground> as the root view.
 * 2. EVERY card/panel must use <GlassCard> (not plain <View> with bg colour).
 * 3. EVERY tap target (button, list row, card) must use <AnimatedPressable>.
 * 4. EVERY flat list row must be wrapped in <FadeInRow index={i}>.
 * 5. EVERY modal must use <GlassModal>.
 * 6. Use expo-blur <BlurView> for glass surfaces. intensity={glass.blurCard}.
 * 7. Tab bars: use blurred frosted glass tab bar background, NOT flat white.
 * 8. Import colours ONLY from this file (@/design/tokens). No hardcoded hex.
 * 9. Status badges: use StatusPill component from @/components/shared/StatusPill.
 * 10. Decorative orbs: add 2-3 absolutely-positioned orb circles behind cards
 *     using glass.orb1–4 colours with borderRadius: radius.full.
 */
