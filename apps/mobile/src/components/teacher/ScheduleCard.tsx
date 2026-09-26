import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { SchedulePeriod } from '@/store/teacher.store';

export function ScheduleCard({ period, active }: { period: SchedulePeriod; active: boolean }) {
  return (
    <GlassCard padded={false} style={active ? styles.activeShadow : undefined}>
      <View style={[styles.body, active ? styles.activeBody : null]}>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>P{period.period}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.subject}>{period.subject}</Text>
          <Text style={styles.meta}>{period.time} – {period.endTime} · {period.room}</Text>
        </View>
        {active ? (
          <View style={styles.nowTag}>
            <Text style={styles.nowText}>Now</Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  activeShadow: { shadowColor: statusColors.info, shadowOpacity: 0.3, shadowRadius: 12 },
  body: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  activeBody: { borderRadius: 14, borderWidth: 1.5, borderColor: statusColors.info, backgroundColor: statusColors.infoBg },
  periodBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(148,163,184,0.15)', alignItems: 'center', justifyContent: 'center' },
  periodText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  info: { flex: 1 },
  subject: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  nowTag: { backgroundColor: statusColors.info, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  nowText: { fontSize: 11, fontWeight: '700', color: '#fff' },
});
