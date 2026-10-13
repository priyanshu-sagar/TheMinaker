import { StyleSheet, Text, View } from 'react-native';
import { glass, colors, radius, spacing, palette, shadows, typography } from '@/design/tokens';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { AttendanceStatus } from '@/store/gateman.store';

const STAGES: Array<{ stage: AttendanceStatus; fg: string; bg: string }> = [
  { stage: 'Boarded', fg: colors.boarded, bg: colors.boardedBg },
  { stage: 'Dropped', fg: colors.dropped, bg: colors.droppedBg },
  { stage: 'Checked Out', fg: colors.checkedOut, bg: colors.checkedOutBg },
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
    <View style={[styles.row, shadows.sm]}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{studentName}</Text>
        {attendanceStatus === 'Absent' ? <Text style={styles.absentTag}>Absent</Text> : null}
      </View>
      <View style={styles.toggles}>
        {STAGES.map(({ stage, fg, bg }) => {
          const active = attendanceStatus === stage;
          return (
            <AnimatedPressable
              key={stage}
              style={[styles.toggle, active ? { backgroundColor: fg, borderColor: fg } : { borderColor: bg }]}
              onPress={() => onChange(stage)}
            >
              <Text style={[styles.toggleText, active ? styles.toggleTextActive : { color: fg }]}>{stage}</Text>
            </AnimatedPressable>
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
    backgroundColor: glass.cardBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  absentTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.offline,
    backgroundColor: colors.offlineBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
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
  toggleTextActive: { color: palette.white },
  timestamp: { fontSize: 12, fontWeight: '600' },
});
