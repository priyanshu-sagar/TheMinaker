import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { CampusStatusBadge } from './CampusStatusBadge';
import { ClassAttendance, RosterStudent } from '@/store/teacher.store';

const ATTENDANCE_STAGES: Array<{ stage: ClassAttendance; fg: string; bg: string }> = [
  { stage: 'Present', fg: statusColors.present, bg: statusColors.presentBg },
  { stage: 'Absent', fg: statusColors.absent, bg: statusColors.absentBg },
  { stage: 'Late', fg: statusColors.late, bg: statusColors.lateBg },
];

export function StudentRosterCard({
  student,
  onMarkAttendance,
  onAdjustPoints,
}: {
  student: RosterStudent;
  onMarkAttendance: (status: ClassAttendance) => void;
  onAdjustPoints: (amount: number) => void;
}) {
  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <View style={styles.nameCol}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.roll}>Roll {student.rollNumber}</Text>
        </View>
        <View style={styles.pointsRow}>
          <Pressable style={styles.pointBtn} onPress={() => onAdjustPoints(-1)}>
            <Text style={styles.pointBtnText}>−</Text>
          </Pressable>
          <Text style={styles.points}>⭐ {student.behaviorPoints}</Text>
          <Pressable style={styles.pointBtn} onPress={() => onAdjustPoints(1)}>
            <Text style={styles.pointBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <CampusStatusBadge status={student.campusStatus} at={student.campusStatusAt} />

      <View style={styles.toggles}>
        {ATTENDANCE_STAGES.map(({ stage, fg, bg }) => {
          const active = student.classAttendance === stage;
          return (
            <Pressable
              key={stage}
              style={[styles.toggle, active ? { backgroundColor: fg, borderColor: fg } : { borderColor: bg }]}
              onPress={() => onMarkAttendance(stage)}
            >
              <Text style={[styles.toggleText, active ? styles.toggleTextActive : { color: fg }]}>{stage}</Text>
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  nameCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  roll: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pointBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(148,163,184,0.18)', alignItems: 'center', justifyContent: 'center' },
  pointBtnText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, lineHeight: 16 },
  points: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, minWidth: 34, textAlign: 'center' },
  toggles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  toggle: { flex: 1, minHeight: 38, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontSize: 12, fontWeight: '700' },
  toggleTextActive: { color: '#fff' },
});
