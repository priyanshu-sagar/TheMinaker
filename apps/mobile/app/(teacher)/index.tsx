import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { ScheduleCard } from '@/components/teacher/ScheduleCard';
import { QuickActionsRow } from '@/components/teacher/QuickActionsRow';
import { parsePeriodTime, useTeacherStore } from '@/store/teacher.store';
import { useAuthStore } from '@/store/auth.store';

function useCurrentPeriodInfo() {
  const schedule = useTeacherStore((state) => state.schedule);
  return useMemo(() => {
    const now = new Date();
    let activeId: string | null = null;
    let nextLabel: string | null = null;

    for (const period of schedule) {
      const start = parsePeriodTime(period.time, now);
      const end = parsePeriodTime(period.endTime, now);
      if (now >= start && now <= end) {
        activeId = period.id;
      }
      if (!nextLabel && now < start) {
        const minutesAway = Math.round((start.getTime() - now.getTime()) / 60000);
        nextLabel = `Period ${period.period} (${period.subject}) starting in ${minutesAway} min`;
      }
    }

    return { activeId, summary: activeId ? 'Class in session now' : nextLabel ?? 'No more periods today' };
  }, [schedule]);
}

export default function TeacherDashboardScreen() {
  const schedule = useTeacherStore((state) => state.schedule);
  const user = useAuthStore((state) => state.user);
  const { activeId, summary } = useCurrentPeriodInfo();

  function onQuickAction(key: 'attendance' | 'test' | 'broadcast') {
    if (key === 'attendance') router.push('/(teacher)/roster');
    if (key === 'test') router.push('/(teacher)/academics');
    if (key === 'broadcast') router.push('/(teacher)/comms');
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={schedule}
          keyExtractor={(period) => period.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.greeting}>Good Morning, {user?.fullName?.split(' ')[0] ?? 'Teacher'}</Text>
              <GlassCard style={styles.summaryCard} padded={false}>
                <View style={styles.summaryInner}>
                  <Text style={styles.summaryText}>{summary}</Text>
                </View>
              </GlassCard>

              <View style={styles.quickActionsWrap}>
                <QuickActionsRow onAction={onQuickAction} />
              </View>

              <Text style={styles.sectionTitle}>Today's Timetable</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => <ScheduleCard period={item} active={item.id === activeId} />}
        />
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  header: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  summaryCard: {},
  summaryInner: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  summaryText: { fontSize: 13, fontWeight: '700', color: statusColors.info },
  quickActionsWrap: { marginTop: spacing.xs },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
});
