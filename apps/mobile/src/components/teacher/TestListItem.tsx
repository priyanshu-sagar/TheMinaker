import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { MarkedTest } from '@/store/teacher.store';

export function TestListItem({ test, onPress }: { test: MarkedTest; onPress: () => void }) {
  const graded = test.scores.filter((entry) => entry.score !== null).length;
  const total = test.scores.length;
  const isFullyGraded = total > 0 && graded === total;

  return (
    <GlassCard padded={false}>
      <Pressable style={styles.row} onPress={onPress}>
        <View style={styles.info}>
          <Text style={styles.title}>{test.title}</Text>
          <Text style={styles.meta}>{test.subject} · Max {test.maxMarks} · {test.date}</Text>
        </View>
        <View style={[styles.badge, isFullyGraded ? styles.badgeDone : styles.badgePending]}>
          <Text style={[styles.badgeText, isFullyGraded ? styles.badgeTextDone : styles.badgeTextPending]}>
            {graded}/{total} graded
          </Text>
        </View>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, gap: spacing.md },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeDone: { backgroundColor: statusColors.presentBg },
  badgePending: { backgroundColor: statusColors.academicsBg },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextDone: { color: statusColors.present },
  badgeTextPending: { color: statusColors.academics },
});
