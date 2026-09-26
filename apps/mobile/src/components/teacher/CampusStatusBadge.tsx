import { StyleSheet, Text, View } from 'react-native';
import { statusColors } from '@/design/teacher-theme';
import { CampusStatus } from '@/store/teacher.store';

const CONFIG: Record<CampusStatus, { dot: string; fg: string; bg: string; label: (at?: string) => string }> = {
  'At Gate': {
    dot: statusColors.present,
    fg: statusColors.present,
    bg: statusColors.presentBg,
    label: (at) => (at ? `At the gate ${at}` : 'At the gate'),
  },
  'Not Arrived': {
    dot: statusColors.neutral,
    fg: statusColors.neutral,
    bg: statusColors.neutralBg,
    label: () => 'Not arrived yet',
  },
  'Parent Excused': {
    dot: statusColors.absent,
    fg: statusColors.absent,
    bg: statusColors.absentBg,
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
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 11, fontWeight: '700' },
});
