import { Pressable, StyleSheet, Text, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/gateman-theme';
import { AttendanceStatus } from '@/store/gateman.store';

const STAGES: Array<{ stage: AttendanceStatus; fg: string; bg: string }> = [
  { stage: 'Boarded', fg: statusColors.boarded, bg: statusColors.boardedBg },
  { stage: 'Dropped', fg: statusColors.dropped, bg: statusColors.droppedBg },
  { stage: 'Checked Out', fg: statusColors.checkedOut, bg: statusColors.checkedOutBg },
];

function formatTime(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function StudentRosterRow({
  studentName,
  attendanceStatus,
  statusUpdatedAt,
  onChange,
}: {
  studentName: string;
  attendanceStatus: AttendanceStatus;
  statusUpdatedAt?: string;
  onChange: (status: AttendanceStatus) => void;
}) {
  const activeStage = STAGES.find((item) => item.stage === attendanceStatus);

  return (
    <View style={styles.row}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{studentName}</Text>
        {attendanceStatus === 'Absent' ? <Text style={styles.absentTag}>Absent</Text> : null}
      </View>
      <View style={styles.toggles}>
        {STAGES.map(({ stage, fg, bg }) => {
          const active = attendanceStatus === stage;
          return (
            <Pressable
              key={stage}
              style={[styles.toggle, active ? { backgroundColor: fg, borderColor: fg } : { borderColor: bg }]}
              onPress={() => onChange(stage)}
            >
              <Text style={[styles.toggleText, active ? styles.toggleTextActive : { color: fg }]}>{stage}</Text>
            </Pressable>
          );
        })}
      </View>
      {activeStage && statusUpdatedAt ? (
        <Text style={[styles.timestamp, { color: activeStage.fg }]}>
          {activeStage.stage} at {formatTime(statusUpdatedAt)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  absentTag: { fontSize: 11, fontWeight: '700', color: statusColors.offline, backgroundColor: statusColors.offlineBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  toggles: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { fontSize: 12, fontWeight: '700' },
  toggleTextActive: { color: '#fff' },
  timestamp: { fontSize: 12, fontWeight: '600' },
});
