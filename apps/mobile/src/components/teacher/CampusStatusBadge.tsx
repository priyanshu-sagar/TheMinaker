import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/design/tokens';
import { CampusStatus } from '@/store/teacher.store';

const CONFIG: Record<CampusStatus, { dot: string; fg: string; bg: string; label: (at?: string) => string }> = {
  'At Gate': {
    dot: colors.success,
    fg: colors.success,
    bg: colors.successBg,
    label: (at) => (at ? `At the gate ${at}` : 'At the gate'),
  },
  'Not Arrived': {
    dot: colors.textMuted,
    fg: colors.textMuted,
    bg: colors.primarySurface,
    label: () => 'Not arrived yet',
  },
  'Parent Excused': {
    dot: colors.error,
    fg: colors.error,
    bg: colors.errorBg,
    label: () => 'Parent marked absent',
  },
};

export function CampusStatusBadge({ status, at }: { status: CampusStatus; at?: string }) {
  const config = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.fg }]}>{config.label(at)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  text: { fontSize: 11, fontWeight: '700' },
});
