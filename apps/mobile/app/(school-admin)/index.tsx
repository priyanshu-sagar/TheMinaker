import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/api/client';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
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

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  unmarked: number;
}

export default function SchoolAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AttendanceSummary>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    unmarked: 0,
  });

  useEffect(() => {
    // apiClient.get<T> returns T directly (unwrapped by the interceptor)
    apiClient
      .get<AttendanceSummary>('/attendance/summary', { attendanceType: 'school_entry' })
      .then((data) => {
        setStats(data);
      })
      .catch(console.error);
  }, []);

  const attendancePercent =
    stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const statItems = [
    { emoji: '👥', label: 'Total Students', value: stats.total.toString() },
    { emoji: '✅', label: 'Present Today', value: stats.present.toString() },
    { emoji: '❌', label: 'Absent Today', value: stats.absent.toString() },
    { emoji: '📊', label: 'Attendance %', value: `${attendancePercent}%` },
  ];

  return (
    <MeshBackground>
      {/* Decorative orbs — always behind content */}
      <View style={styles.orbTopRight} pointerEvents="none" />
      <View style={styles.orbMidLeft} pointerEvents="none" />
      <View style={styles.orbBottomRight} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting header: GlassCard with date and welcome text — NO solid blue background */}
          <GlassCard style={[styles.headerCard, shadows.md]}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>SCHOOL ADMINISTRATION</Text>
            </View>
            <Text style={[typography.title, styles.greeting]}>
              Welcome, {user?.fullName ?? 'Admin'} 👋
            </Text>
            <Text style={[typography.caption, styles.date]}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </GlassCard>

          {/* Stats grid: 4 GlassCard tiles in 2x2 grid */}
          <View style={styles.grid}>
            {statItems.map((item, index) => (
              <View key={item.label} style={styles.gridCol}>
                <FadeInRow index={index}>
                  <AnimatedPressable style={styles.pressableCard}>
                    <GlassCard style={[styles.statCard, shadows.md]}>
                      <View style={styles.iconCircle}>
                        <Text style={styles.statEmoji}>{item.emoji}</Text>
                      </View>
                      <Text style={[typography.hero, styles.statValue]}>{item.value}</Text>
                      <Text style={[typography.caption, styles.statLabel]}>{item.label}</Text>
                    </GlassCard>
                  </AnimatedPressable>
                </FadeInRow>
              </View>
            ))}
          </View>
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
    gap: spacing.lg,
  },
  orbTopRight: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: radius.full,
    backgroundColor: glass.orb1,
  },
  orbMidLeft: {
    position: 'absolute',
    top: 260,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: radius.full,
    backgroundColor: glass.orb2,
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: 90,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: glass.orb3,
  },
  headerCard: {
    borderRadius: radius.lg,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(51, 65, 85, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.overline,
    color: portalAccents.schoolAdmin.from,
    letterSpacing: 1,
  },
  greeting: {
    color: colors.textPrimary,
  },
  date: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  gridCol: {
    width: '50%',
    padding: spacing.xs,
  },
  pressableCard: {
    borderRadius: radius.lg,
  },
  statCard: {
    borderRadius: radius.lg,
    minHeight: 145,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 65, 85, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    color: colors.textPrimary,
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});
