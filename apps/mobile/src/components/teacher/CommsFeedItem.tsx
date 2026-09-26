import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { CommsMessage, RosterStudent } from '@/store/teacher.store';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CommsFeedItem({ message, targetStudent }: { message: CommsMessage; targetStudent?: RosterStudent }) {
  const isReport = message.channel === 'DirectReport';
  const badgeLabel = isReport
    ? message.route === 'SchoolAdmin'
      ? 'To School Admin'
      : 'To Parent'
    : 'Announcement';

  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>{message.title}</Text>
        <View style={[styles.badge, isReport ? styles.badgeReport : styles.badgeAnnouncement]}>
          <Text style={[styles.badgeText, isReport ? styles.badgeTextReport : styles.badgeTextAnnouncement]}>
            {badgeLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.body}>{message.body}</Text>
      <View style={styles.footerRow}>
        {isReport && targetStudent ? (
          <Text style={styles.target}>About {targetStudent.name}</Text>
        ) : (
          <Text style={styles.target}>Whole class</Text>
        )}
        <Text style={styles.date}>{formatDate(message.date)}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 120 },
  badgeAnnouncement: { backgroundColor: statusColors.infoBg },
  badgeReport: { backgroundColor: statusColors.lateBg },
  badgeText: { fontSize: 10, fontWeight: '800' },
  badgeTextAnnouncement: { color: statusColors.info },
  badgeTextReport: { color: statusColors.late },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 19 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  target: { fontSize: 11, fontWeight: '600', color: colors.textMuted, flex: 1 },
  date: { fontSize: 11, color: colors.textMuted },
});
