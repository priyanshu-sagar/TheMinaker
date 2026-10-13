import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth.store';
import { useTelemetry } from '@/hooks/use-telemetry';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import {
  colors,
  glass,
  palette,
  portalAccents,
  radius,
  shadows,
  spacing,
  typography,
} from '@/design/tokens';

/**
 * Conductor Trip Dashboard
 *
 * - Shows current trip status (pending / active / completed)
 * - Start Trip / End Trip buttons with glassmorphic spring animations
 * - GPS tracking starts automatically in background when trip is active
 * - Battery % and GPS accuracy indicators
 */
export default function ConductorTripScreen() {
  const { user } = useAuthStore();

  // Minimal placeholder state for now — in reality, this comes from GET /fleet/trips/my-active
  const [isActive, setIsActive] = useState(false);
  // Fake bus ID for local testing/demo
  const demoBusId = '00000000-0000-0000-0000-000000000000';

  useTelemetry(demoBusId, isActive);

  return (
    <MeshBackground>
      {/* Decorative orbs — always behind content */}
      <View
        style={styles.orbTopRight}
        pointerEvents="none"
      />
      <View
        style={styles.orbMidLeft}
        pointerEvents="none"
      />
      <View
        style={styles.orbBottomRight}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting section: GlassCard with LinearGradient emerald band */}
          <GlassCard style={[styles.greetingCard, shadows.md]} padded={false}>
            <LinearGradient
              colors={[portalAccents.conductor.from, portalAccents.conductor.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.greetingGradient}
            >
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>CONDUCTOR PORTAL</Text>
              </View>
              <Text style={styles.greetingTitle}>
                Good morning, {user?.fullName?.split(' ')[0] ?? 'Conductor'} 👋
              </Text>
              <Text style={styles.busInfo}>Bus: — · Route: —</Text>
            </LinearGradient>
          </GlassCard>

          {/* Trip status card: Large, centered, main CTA card */}
          <GlassCard style={[styles.tripCard, shadows.lg]}>
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeIdle,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isActive ? styles.statusDotActive : styles.statusDotIdle,
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isActive ? styles.statusTextActive : styles.statusTextIdle,
                ]}
              >
                {isActive ? 'Trip Active' : 'No Active Trip'}
              </Text>
            </View>

            <Text style={[typography.title, styles.tripHeading]}>
              {isActive ? 'Broadcasting Route' : 'Ready to Depart'}
            </Text>

            <Text style={[typography.caption, styles.tripHint]}>
              {isActive
                ? 'GPS is broadcasting in the background'
                : 'Press Start Trip when you begin your route'}
            </Text>

            {/* Start / End Trip button */}
            <AnimatedPressable
              onPress={() => setIsActive(!isActive)}
              style={[styles.btnWrapper, shadows.md]}
            >
              <LinearGradient
                colors={
                  isActive
                    ? [palette.rose, palette.roseLight]
                    : [palette.emerald, palette.emeraldLight]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtn}
              >
                <Text style={styles.startBtnText}>
                  {isActive ? '🛑  End Trip' : '🚌  Start Trip'}
                </Text>
              </LinearGradient>
            </AnimatedPressable>
          </GlassCard>

          {/* Stat row: 3 GlassCard mini-tiles */}
          <View style={styles.statsRow}>
            <AnimatedPressable style={styles.statWrap}>
              <GlassCard style={[styles.statCard, shadows.sm]}>
                <Text style={styles.statEmoji}>👥</Text>
                <Text style={[typography.heading, styles.statValue]}>0</Text>
                <Text style={[typography.caption, styles.statLabel]}>Students</Text>
              </GlassCard>
            </AnimatedPressable>

            <AnimatedPressable style={styles.statWrap}>
              <GlassCard style={[styles.statCard, shadows.sm]}>
                <Text style={styles.statEmoji}>📍</Text>
                <Text style={[typography.heading, styles.statValue]}>—</Text>
                <Text style={[typography.caption, styles.statLabel]}>GPS</Text>
              </GlassCard>
            </AnimatedPressable>

            <AnimatedPressable style={styles.statWrap}>
              <GlassCard style={[styles.statCard, shadows.sm]}>
                <Text style={styles.statEmoji}>🔋</Text>
                <Text style={[typography.heading, styles.statValue]}>—%</Text>
                <Text style={[typography.caption, styles.statLabel]}>Battery</Text>
              </GlassCard>
            </AnimatedPressable>
          </View>

          {/* Bottom hint text */}
          <Text style={[typography.caption, styles.hint]}>
            📡 GPS tracking will publish your location automatically once the trip starts.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.md,
  },
  orbTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: glass.orb4,
  },
  orbMidLeft: {
    position: 'absolute',
    top: 260,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: radius.full,
    backgroundColor: glass.orb1,
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: 90,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: radius.full,
    backgroundColor: glass.orb2,
  },
  greetingCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  greetingGradient: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  roleBadgeText: {
    ...typography.overline,
    color: palette.white,
    letterSpacing: 1,
  },
  greetingTitle: {
    ...typography.title,
    color: palette.white,
  },
  busInfo: {
    ...typography.caption,
    color: palette.white,
    opacity: 0.9,
    marginTop: spacing.xxs,
  },
  tripCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  statusBadgeActive: {
    backgroundColor: colors.successBg,
  },
  statusBadgeIdle: {
    backgroundColor: colors.warningBg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotIdle: {
    backgroundColor: colors.warning,
  },
  statusBadgeText: {
    ...typography.overline,
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextIdle: {
    color: colors.warning,
  },
  tripHeading: {
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  tripHint: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textMuted,
  },
  btnWrapper: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  startBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    ...typography.label,
    fontSize: 17,
    color: palette.white,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statWrap: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.xxs,
  },
  statValue: {
    color: colors.textPrimary,
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
