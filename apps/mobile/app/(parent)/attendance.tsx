import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { FadeInRow } from '@/components/glass/FadeInList';
import { StatusPill } from '@/components/shared/StatusPill';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { colors, portalAccents, shadows, spacing, typography } from '@/design/tokens';
import { useParentStore } from '@/store/parent.store';

export default function ParentAttendanceScreen() {
  const activeChildId = useParentStore((state) => state.activeChildId);
  const history = useParentStore((state) => state.attendanceHistory);
  const logs = useMemo(
    () => history.filter((row) => row.childId === activeChildId),
    [history, activeChildId],
  );
  const present = logs.filter((row) => row.status === 'Present').length;
  const percent = logs.length === 0 ? 0 : Math.round((present / logs.length) * 100);

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChildSwitcher />
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <GlassCard style={[styles.summary, shadows.md]}>
              <Text style={styles.kicker}>October 2026</Text>
              <Text style={styles.percent}>{percent}%</Text>
              <Text style={styles.caption}>Days marked present on the bus</Text>
            </GlassCard>
          }
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <GlassCard style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.date}>{item.date}</Text>
                  <StatusPill variant={item.status === 'Present' ? 'success' : 'absent'} label={item.status} />
                </View>
                <Text style={styles.time}>Boarded {item.boardedTime ?? '—'}</Text>
                <Text style={styles.time}>Dropped {item.droppedTime ?? '—'}</Text>
              </GlassCard>
            </FadeInRow>
          )}
        />
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: 110 },
  summary: { marginBottom: spacing.md, alignItems: 'flex-start' },
  kicker: { ...typography.overline, color: portalAccents.parent.from },
  percent: { ...typography.hero, marginTop: spacing.xs },
  caption: { ...typography.caption },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.bodyBold },
  time: { ...typography.caption, marginTop: 4 },
});
