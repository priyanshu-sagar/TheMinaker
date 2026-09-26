import { StyleSheet, Text, View } from 'react-native';
import { statusColors } from '@/design/teacher-theme';
import { CampusStatus } from '@/store/teacher.store';

const CONFIG: Record<CampusStatus, { dot: string; fg: string; bg: string; label: (at?: string) => string }> = {
  'At Gate': {
    dot: '🟢',
    fg: statusColors.present,
    bg: statusColors.presentBg,
    label: (at) => (at ? `Scanned at Gate ${at}` : 'Scanned at Gate'),
  },
  'Not Arrived': {
    dot: '⚪',
    fg: statusColors.neutral,
    bg: statusColors.neutralBg,
    label: () => 'Not arrived yet',
  },
  'Parent Excused': {
    dot: '🔴',
    fg: statusColors.absent,
    bg: statusColors.absentBg,
    label: () => 'Parent marked absent',
  },
};

export function CampusStatusBadge({ status, at }: { status: CampusStatus; at?: string }) {
  const config = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.fg }]}>{config.dot} {config.label(at)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});
