import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, colors } from '@/design/tokens';

export type BadgeTone = 'online' | 'offline' | 'amber' | 'boarded' | 'dropped' | 'checkedOut' | 'neutral';

const TONE_MAP: Record<BadgeTone, { fg: string; bg: string }> = {
  online: { fg: colors.online, bg: colors.onlineBg },
  offline: { fg: colors.offline, bg: colors.offlineBg },
  amber: { fg: colors.warning, bg: colors.warningBg },
  boarded: { fg: colors.boarded, bg: colors.boardedBg },
  dropped: { fg: colors.dropped, bg: colors.droppedBg },
  checkedOut: { fg: colors.checkedOut, bg: colors.checkedOutBg },
  neutral: { fg: colors.textMuted, bg: colors.primarySurface },
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
  dot: { width: 7, height: 7, borderRadius: radius.full },
  text: { fontSize: 12, fontWeight: '700' },
});
