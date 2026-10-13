import { useEffect } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { colors, glass, spacing, radius, typography, shadows, palette } from '@/design/tokens';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { markOnboardingSeen } from '@/auth/onboarding-flag';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TOP_H = SCREEN_H * 0.70;
const BOT_H = SCREEN_H * 0.30;
const WAVE_H = 60;

// SVG curved wave path — smooth cubic bezier from left to right
const WAVE_PATH = `M0,0 C${SCREEN_W * 0.25},${WAVE_H} ${SCREEN_W * 0.75},${-WAVE_H} ${SCREEN_W},0 L${SCREEN_W},${WAVE_H} L0,${WAVE_H} Z`;

export default function OnboardingScreen() {
  // Entry animations
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.8);
  const btnOpacity = useSharedValue(0);
  const arrowX = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations only
    logoScale.value = withDelay(200, withSpring(1, { damping: 14, stiffness: 180 }));
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    btnScale.value = withDelay(900, withSpring(1, { damping: 12, stiffness: 160 }));
    btnOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    // Repeating arrow bounce
    arrowX.value = withDelay(1200,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnOpacity.value,
  }));

  const arrowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
  }));

  async function handleBegin() {
    await markOnboardingSeen();
    router.replace('/(auth)/portal-showcase' as any);
  }

  return (
    <View style={styles.root}>
      {/* ── TOP 70% ── */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.top}
      >
        {/* Decorative SVG orbs */}
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_W} height={TOP_H}>
          <Defs>
            <RadialGradient id="orb1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="orb2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={SCREEN_W * 0.85} cy={TOP_H * 0.15} rx={160} ry={160} fill="url(#orb1)" />
          <Ellipse cx={SCREEN_W * 0.1} cy={TOP_H * 0.6} rx={180} ry={180} fill="url(#orb2)" />
          <Circle cx={SCREEN_W * 0.5} cy={TOP_H * 0.82} r={60} fill="rgba(99,102,241,0.12)" />
        </Svg>

        <SafeAreaView style={styles.topContent} edges={['top']}>
          {/* Logo */}
          <Animated.View style={[styles.logoWrap, logoAnimStyle]}>
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={['#4F46E5', '#818CF8']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Bus icon using SVG */}
                <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 16C4 16.88 4.39 17.67 5 18.22V20C5 20.55 5.45 21 6 21H7C7.55 21 8 20.55 8 20V19H16V20C16 20.55 16.45 21 17 21H18C18.55 21 19 20.55 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 2 16 2 12 2C8 2 4 2 4 6V16ZM7.5 17C6.67 17 6 16.33 6 15.5C6 14.67 6.67 14 7.5 14C8.33 14 9 14.67 9 15.5C9 16.33 8.33 17 7.5 17ZM16.5 17C15.67 17 15 16.33 15 15.5C15 14.67 15.67 14 16.5 14C17.33 14 18 14.67 18 15.5C18 16.33 17.33 17 16.5 17ZM6 10V6H18V10H6Z"
                    fill="white"
                  />
                </Svg>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* App name */}
          <Animated.View style={logoAnimStyle}>
            <Text style={styles.appName}>TheMinaker</Text>
            <Text style={styles.appSub}>School ERP & Transit Platform</Text>
          </Animated.View>

          {/* Abstract illustration */}
          <Animated.View style={[styles.illustrationWrap, taglineAnimStyle]}>
            <Svg width={SCREEN_W * 0.75} height={160} viewBox="0 0 320 160">
              {/* Road */}
              <Path d="M0,130 Q80,110 160,125 Q240,140 320,120" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
              {/* Bus body */}
              <Path d="M80,90 L210,90 L210,125 L80,125 Z" fill="rgba(255,255,255,0.15)" />
              <Path d="M80,90 L210,90 L210,108 L80,108 Z" fill="rgba(255,255,255,0.08)" />
              {/* Windows */}
              <Path d="M95,96 L115,96 L115,106 L95,106 Z" fill="rgba(99,102,241,0.6)" />
              <Path d="M122,96 L142,96 L142,106 L122,106 Z" fill="rgba(99,102,241,0.6)" />
              <Path d="M149,96 L169,96 L169,106 L149,106 Z" fill="rgba(99,102,241,0.6)" />
              <Path d="M176,96 L196,96 L196,106 L176,106 Z" fill="rgba(99,102,241,0.6)" />
              {/* Wheels */}
              <Circle cx="102" cy="128" r="10" fill="rgba(255,255,255,0.2)" />
              <Circle cx="102" cy="128" r="5" fill="rgba(255,255,255,0.1)" />
              <Circle cx="188" cy="128" r="10" fill="rgba(255,255,255,0.2)" />
              <Circle cx="188" cy="128" r="5" fill="rgba(255,255,255,0.1)" />
              {/* School building */}
              <Path d="M240,60 L290,60 L290,125 L240,125 Z" fill="rgba(255,255,255,0.08)" />
              <Path d="M248,55 L282,55 L265,40 Z" fill="rgba(255,255,255,0.12)" />
              <Path d="M255,80 L275,80 L275,100 L255,100 Z" fill="rgba(99,102,241,0.4)" />
              {/* Stars / signal dots */}
              <Circle cx="30" cy="40" r="3" fill="rgba(255,255,255,0.4)" />
              <Circle cx="55" cy="25" r="2" fill="rgba(255,255,255,0.3)" />
              <Circle cx="300" cy="30" r="3" fill="rgba(255,255,255,0.4)" />
              <Circle cx="320" cy="55" r="2" fill="rgba(255,255,255,0.25)" />
            </Svg>
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={taglineAnimStyle}>
            <Text style={styles.tagline}>Next-Generation Campus{`\n`}&amp; Transit Security</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── SVG CURVED WAVE DIVIDER ── */}
      <View style={styles.waveContainer}>
        <Svg
          width={SCREEN_W}
          height={WAVE_H}
          style={{ position: 'absolute', top: -WAVE_H + 2, left: 0 }}
          viewBox={`0 0 ${SCREEN_W} ${WAVE_H}`}
        >
          <Path
            d={`M0,${WAVE_H} C${SCREEN_W * 0.3},0 ${SCREEN_W * 0.7},${WAVE_H * 1.5} ${SCREEN_W},${WAVE_H * 0.2} L${SCREEN_W},${WAVE_H} Z`}
            fill="white"
          />
        </Svg>
      </View>

      {/* ── BOTTOM 30% ── */}
      <View style={styles.bottom}>
        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.bottomContent}>
          <Text style={styles.letsBeginTitle}>Let's Begin</Text>
          <Text style={styles.letsBeginSub}>
            Connecting schools, parents, and staff{`\n`}in one seamless platform.
          </Text>

          <Animated.View style={btnAnimStyle}>
            <AnimatedPressable onPress={handleBegin} style={styles.ctaBtn} haptic="medium">
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <Animated.View style={arrowAnimStyle}>
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Animated.View>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  top: { height: TOP_H },
  topContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  logoWrap: { marginTop: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logoGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  illustrationWrap: { marginTop: spacing.xl },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.lg,
    letterSpacing: 0.1,
  },
  waveContainer: {
    height: WAVE_H,
    backgroundColor: 'white',
    zIndex: 2,
  },
  bottom: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: spacing.xl,
  },
  bottomContent: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  letsBeginTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.ink100,
    letterSpacing: -0.4,
  },
  letsBeginSub: {
    fontSize: 15,
    color: palette.ink60,
    lineHeight: 22,
  },
  ctaBtn: { borderRadius: radius.full, overflow: 'hidden', ...shadows.lg },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    borderRadius: radius.full,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },
});
