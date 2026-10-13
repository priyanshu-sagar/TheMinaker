import { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, glass, spacing, radius, typography, palette } from '@/design/tokens';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { MeshBackground } from '@/components/glass/MeshBackground';

const { width: SCREEN_W } = Dimensions.get('window');

interface Portal {
  key: string;
  label: string;
  shortLabel: string;
  icon: string; // SVG path string
  from: string;
  to: string;
  href: string;
  tagline: string;
  description: string;
  features: string[];
  loginInfo: string;
  resetInfo: string;
  faqs: { q: string; a: string }[];
}

const PORTALS: Portal[] = [
  {
    key: 'parent',
    label: 'Parent Portal',
    shortLabel: 'Parent',
    icon: 'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z',
    from: palette.blue,
    to: palette.blueLight,
    href: '/(auth)/parent/login',
    tagline: 'Track & Protect Your Child',
    description: "Stay connected with your child's school journey in real-time. Monitor live bus location, receive instant attendance alerts, and manage your child's profile — all from one app.",
    features: ['Live GPS bus tracking', 'Instant boarding/arrival alerts', 'Daily attendance history', 'Secure parent-school messaging'],
    loginInfo: "Parents register using their mobile number. After signup, the School Admin approves your account and links your child's profile.",
    resetInfo: 'Tap "Forgot Password" on the login screen. You\'ll receive an OTP on your registered mobile number to reset your access.',
    faqs: [
      { q: 'How do I add my child?', a: 'After logging in, the School Admin links your account to your child. Contact the school office to request this.' },
      { q: 'Why can\'t I see the bus?', a: 'The bus location is only visible when the conductor has started an active trip. Check during school hours.' },
      { q: 'How do I contact the School Admin?', a: 'Use the in-app messaging feature or contact your school office directly to get your account approved.' },
    ],
  },
  {
    key: 'gateman',
    label: 'Gateman Portal',
    shortLabel: 'Gateman',
    icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
    from: palette.orange,
    to: palette.orangeLight,
    href: '/(auth)/gateman/login',
    tagline: 'Secure Every Campus Entry',
    description: 'Monitor the entire school fleet from a single dashboard. Authorize campus entry and exit, view live bus positions, manage student roster attendance, and handle parent profile requests.',
    features: ['Live fleet map with GPS', 'Campus entry/exit authorization', 'Master attendance override', 'Profile & edit request approvals'],
    loginInfo: 'Gateman accounts are provisioned by the School Admin. You will receive your login ID and set a password on first login.',
    resetInfo: 'Contact your School Admin to reset your password. Tap "Forgot Password" and enter your registered ID to receive reset instructions.',
    faqs: [
      { q: 'How do I get my login ID?', a: 'Your School Admin creates your account. They will share your login credentials directly.' },
      { q: 'What if a parent requests changes?', a: 'Profile and edit requests appear in your Inbox. Review and approve or reject from there.' },
      { q: 'Can I override attendance?', a: 'Yes. Go to the Attendance tab, select the route, and manually update any student\'s status.' },
    ],
  },
  {
    key: 'conductor',
    label: 'Conductor Portal',
    shortLabel: 'Conductor',
    icon: 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-4-4-4-8-4s-8 0-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM6 10V6h12v4H6z',
    from: palette.emerald,
    to: palette.emeraldLight,
    href: '/(auth)/conductor/login',
    tagline: 'Drive Smart, Track Live',
    description: 'Start your trip, broadcast your live GPS location, and manage your student manifest in real-time. Mark boarding, alighting, and attendance — all offline-capable with background sync.',
    features: ['One-tap trip start/end', 'Automatic GPS broadcasting', 'Live student manifest', 'Offline attendance sync'],
    loginInfo: 'Conductor accounts are created by the School Admin. You will receive your login ID and a temporary password to set up access.',
    resetInfo: 'Tap "Forgot Password" on the login screen. Enter your registered ID to receive reset instructions from the system.',
    faqs: [
      { q: 'Does GPS work in the background?', a: 'Yes. Once a trip is started, GPS updates run in the background even if you switch apps.' },
      { q: 'What if I lose internet mid-route?', a: 'Attendance marks are saved locally and synced automatically when connection is restored.' },
      { q: 'How do I get my login?', a: 'Contact your School Admin to provision your conductor account.' },
    ],
  },
  {
    key: 'school-admin',
    label: 'School Admin',
    shortLabel: 'Admin',
    icon: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z',
    from: palette.slate,
    to: palette.slateLight,
    href: '/(auth)/school-admin/school-select',
    tagline: 'Complete School Oversight',
    description: 'The command center for your institution. Manage students, staff, fleet, and attendance from an enterprise-grade dashboard. Provision accounts, review reports, and configure the entire platform.',
    features: ['Enterprise attendance dashboard', 'Student & staff management', 'Fleet & route configuration', 'Account provisioning for all roles'],
    loginInfo: 'School Admin accounts are created by the Super Admin (TheMinaker team). Contact support to set up your institution.',
    resetInfo: 'Use the "Forgot Password" flow with your registered email or contact the TheMinaker support team for account recovery.',
    faqs: [
      { q: 'How do I add a new teacher or conductor?', a: 'Go to the Staff section in your dashboard and use the "Add Staff" option to provision new accounts.' },
      { q: 'How do I link students to parents?', a: 'In the Students section, select a student and assign their parent\'s account from the Parent Portal users.' },
      { q: 'How do I contact TheMinaker support?', a: 'Email support@theminaker.com or use the in-app Help section.' },
    ],
  },
];

export default function PortalShowcaseScreen() {
  const [activePortalIndex, setActivePortalIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalPortal, setModalPortal] = useState<Portal | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  function snapTo(index: number) {
    setActivePortalIndex(index);
    setCarouselIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
  }

  function handleContinue() {
    const portal = PORTALS[activePortalIndex];
    if (portal) router.push(portal.href as never);
  }

  const active = PORTALS[activePortalIndex]!;

  return (
    <MeshBackground>
      {/* Decorative orbs — always behind content */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── Header ── */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Portal</Text>
          <Text style={styles.headerSub}>Swipe to explore what each role can do.</Text>
        </Animated.View>

        {/* ── TOP: Navigation Tiles ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.tilesGrid}>
          {PORTALS.map((portal, i) => {
            const isActive = i === activePortalIndex;
            return (
              <AnimatedPressable
                key={portal.key}
                onPress={() => snapTo(i)}
                haptic="selection"
                style={[styles.tile, isActive && styles.tileActive]}
              >
                <LinearGradient
                  colors={isActive ? [portal.from, portal.to] : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                  style={styles.tileGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* BlurView behind for glass effect when inactive */}
                  {!isActive && (
                    <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                  )}
                  <View style={[
                    styles.tileIconCircle,
                    { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : portal.from + '18' }
                  ]}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d={portal.icon} fill={isActive ? 'white' : portal.from} />
                    </Svg>
                  </View>
                  <Text style={[styles.tileLabel, isActive && styles.tileLabelActive]} numberOfLines={1}>
                    {portal.shortLabel}
                  </Text>
                  {isActive && (
                    <View style={styles.tileActiveDot} />
                  )}
                </LinearGradient>
                {/* Border for inactive */}
                {!isActive && (
                  <View style={[StyleSheet.absoluteFill, styles.tileBorder, { borderColor: portal.from + '30' }]} pointerEvents="none" />
                )}
              </AnimatedPressable>
            );
          })}
        </Animated.View>

        {/* ── MIDDLE: Carousel ── */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            if (index !== carouselIndex) setCarouselIndex(index);
          }}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {PORTALS.map((portal) => (
            <View key={portal.key} style={styles.slide}>
              {/* Slide icon */}
              <LinearGradient
                colors={[portal.from, portal.to]}
                style={styles.slideIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                  <Path d={portal.icon} fill="white" />
                </Svg>
              </LinearGradient>

              {/* Slide text */}
              <Text style={styles.slideTagline}>{portal.tagline}</Text>
              <Text style={styles.slideDesc}>{portal.description}</Text>

              {/* Feature chips */}
              <View style={styles.features}>
                {portal.features.map((f) => (
                  <View key={f} style={[styles.featureChip, { borderColor: portal.from + '40' }]}>
                    <View style={[styles.featureDot, { backgroundColor: portal.from }]} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Learn More button */}
              <AnimatedPressable
                onPress={() => setModalPortal(portal)}
                style={[styles.learnMoreBtn, { borderColor: portal.from }]}
                haptic="light"
              >
                <Text style={[styles.learnMoreText, { color: portal.from }]}>Learn More →</Text>
              </AnimatedPressable>
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {PORTALS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === carouselIndex && [styles.dotActive, { backgroundColor: PORTALS[carouselIndex]!.from }],
              ]}
            />
          ))}
        </View>

        {/* ── BOTTOM: Dynamic CTA ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.bottomCta}>
          <AnimatedPressable onPress={handleContinue} haptic="medium">
            <LinearGradient
              colors={[active.from, active.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Continue as {active.shortLabel}</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      </SafeAreaView>

      {/* ── Learn More Bottom Sheet Modal ── */}
      {modalPortal && (
        <Modal
          visible={!!modalPortal}
          transparent
          animationType="slide"
          onRequestClose={() => setModalPortal(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalPortal(null)} />
            <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={styles.sheet}>
              <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.sheetContent}>
                {/* Handle */}
                <View style={styles.sheetHandle} />

                {/* Sheet header */}
                <View style={styles.sheetHeader}>
                  <LinearGradient
                    colors={[modalPortal.from, modalPortal.to]}
                    style={styles.sheetIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path d={modalPortal.icon} fill="white" />
                    </Svg>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle}>{modalPortal.label}</Text>
                    <Text style={styles.sheetTagline}>{modalPortal.tagline}</Text>
                  </View>
                  <AnimatedPressable onPress={() => setModalPortal(null)} style={styles.closeBtn}>
                    <Text style={styles.closeX}>✕</Text>
                  </AnimatedPressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
                  {/* Login info */}
                  <Text style={styles.sectionTitle}>How to Login</Text>
                  <Text style={styles.sectionBody}>{modalPortal.loginInfo}</Text>

                  {/* Reset info */}
                  <Text style={styles.sectionTitle}>Password Reset</Text>
                  <Text style={styles.sectionBody}>{modalPortal.resetInfo}</Text>

                  {/* FAQs */}
                  <Text style={styles.sectionTitle}>FAQs</Text>
                  {modalPortal.faqs.map((faq, i) => (
                    <View key={i} style={styles.faqItem}>
                      <Text style={styles.faqQ}>{faq.q}</Text>
                      <Text style={styles.faqA}>{faq.a}</Text>
                    </View>
                  ))}

                  <View style={{ height: 32 }} />
                </ScrollView>

                {/* Sheet CTA */}
                <AnimatedPressable
                  onPress={() => {
                    setModalPortal(null);
                    router.push(modalPortal.href as never);
                  }}
                  haptic="medium"
                >
                  <LinearGradient
                    colors={[modalPortal.from, modalPortal.to]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sheetCta}
                  >
                    <Text style={styles.ctaText}>Go to {modalPortal.shortLabel} Login →</Text>
                  </LinearGradient>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.title, letterSpacing: -0.3 },
  headerSub: { ...typography.subtitle, marginTop: 2 },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tile: {
    width: '48.5%',
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    ...typography.label,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
  },
  tileLabelActive: {
    color: 'white',
  },
  tileActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  tileBorder: {
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tileActive: {
    shadowOpacity: 0.2,
    elevation: 6,
  },
  carousel: { flex: 1 },
  carouselContent: {},
  slide: {
    width: SCREEN_W,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  slideIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  slideTagline: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  slideDesc: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  features: { width: '100%', gap: spacing.sm, marginBottom: spacing.lg },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { ...typography.bodyBold, color: colors.textSecondary, flex: 1 },
  learnMoreBtn: {
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  learnMoreText: { fontWeight: '600', fontSize: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotActive: { width: 20, height: 6, borderRadius: 3 },
  bottomCta: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    paddingVertical: 16,
    gap: spacing.sm,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: 'white' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
  },
  sheetContent: { padding: spacing.lg },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { ...typography.heading },
  sheetTagline: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { fontSize: 14, color: colors.textSecondary, fontWeight: '700' },
  sheetScroll: { maxHeight: 360 },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  sectionBody: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  faqItem: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  faqQ: { ...typography.bodyBold, color: colors.textPrimary },
  faqA: { ...typography.body, color: colors.textMuted, lineHeight: 20, fontSize: 13 },
  sheetCta: {
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
