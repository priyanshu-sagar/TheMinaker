import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/auth/Buttons';
import { ProgressDots } from '@/components/auth/ProgressDots';
import { colors, spacing, typography } from '@/design/theme';
import { hasSeenOnboarding, markOnboardingSeen } from '@/auth/onboarding-flag';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '🚌',
    title: 'Live Transit Tracking',
    body: 'See your school bus move on the map in real time, from the first stop to the last.',
  },
  {
    icon: '🔔',
    title: 'Instant Campus Alerts',
    body: 'Get notified the moment a child arrives, departs, or is marked absent.',
  },
  {
    icon: '✅',
    title: 'Simple Attendance',
    body: 'Gate and bus attendance are marked from a roster — quick, accurate, and paperless.',
  },
  {
    icon: '🏫',
    title: 'One App, Every Role',
    body: 'Parents, teachers, gatemen, conductors, and school admins each get their own portal.',
  },
];

const AUTO_ADVANCE_MS = 4000;

export default function OnboardingScreen() {
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then((seen) => {
      if (seen) {
        router.replace('/(auth)/portal-select');
      } else {
        setReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    startTimer();
    return stopTimer;
  }, [ready]);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
  }

  function onMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(next);
    startTimer();
  }

  async function onContinue() {
    await markOnboardingSeen();
    router.replace('/(auth)/portal-select');
  }

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={stopTimer}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <View style={styles.illustration}>
              <Text style={styles.illustrationIcon}>{slide.icon}</Text>
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideBody}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ProgressDots count={SLIDES.length} activeIndex={index} />
        <PrimaryButton label="Continue to App" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  illustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e4edf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  illustrationIcon: { fontSize: 56 },
  slideTitle: { ...typography.title, textAlign: 'center' },
  slideBody: { ...typography.subtitle, textAlign: 'center', marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
});
