import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { CommsMessage, RosterStudent } from '@/store/teacher.store';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CommsFeedItem({ message, targetStudent }: { message: CommsMessage; targetStudent?: RosterStudent }) {
  const isComplaint = message.type === 'Complaint';
  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{message.title}</Text>
        <View style={[styles.badge, isComplaint ? styles.badgeComplaint : styles.badgeBroadcast]}>
          <Text style={[styles.badgeText, isComplaint ? styles.badgeTextComplaint : styles.badgeTextBroadcast]}>
            {message.type}
          </Text>
        </View>
      </View>
      <Text style={styles.body}>{message.body}</Text>
      <View style={styles.footerRow}>
        {targetStudent ? <Text style={styles.target}>To: {targetStudent.name}</Text> : <Text style={styles.target}>To: Entire class</Text>}
        <Text style={styles.date}>{formatDate(message.date)}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeBroadcast: { backgroundColor: statusColors.infoBg },
  badgeComplaint: { backgroundColor: statusColors.absentBg },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextBroadcast: { color: statusColors.info },
  badgeTextComplaint: { color: statusColors.absent },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 19 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  target: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  date: { fontSize: 11, color: colors.textMuted },
});
