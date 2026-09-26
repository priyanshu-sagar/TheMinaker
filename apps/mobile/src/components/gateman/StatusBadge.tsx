import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, statusColors } from '@/design/gateman-theme';

export type BadgeTone = 'online' | 'offline' | 'amber' | 'boarded' | 'dropped' | 'checkedOut' | 'neutral';

const TONE_MAP: Record<BadgeTone, { fg: string; bg: string }> = {
  online: { fg: statusColors.online, bg: statusColors.onlineBg },
  offline: { fg: statusColors.offline, bg: statusColors.offlineBg },
  amber: { fg: statusColors.amber, bg: statusColors.amberBg },
  boarded: { fg: statusColors.boarded, bg: statusColors.boardedBg },
  dropped: { fg: statusColors.dropped, bg: statusColors.droppedBg },
  checkedOut: { fg: statusColors.checkedOut, bg: statusColors.checkedOutBg },
  neutral: { fg: statusColors.neutral, bg: statusColors.neutralBg },
};

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  const { fg, bg } = TONE_MAP[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: '700' },
});
