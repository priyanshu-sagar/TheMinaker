import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Info } from 'lucide-react-native';
import { colors, radius, spacing, palette, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { CampusStatusBadge } from './CampusStatusBadge';
import { ClassAttendance, RosterStudent } from '@/store/teacher.store';

const ATTENDANCE_STAGES: Array<{ stage: ClassAttendance; fg: string; bg: string }> = [
    { stage: 'Present', fg: colors.success, bg: colors.successBg },
    { stage: 'Absent', fg: colors.error, bg: colors.errorBg },
];

/**
 * V3 roster row: campus status, Present/Absent toggle only ("Late" removed
 * per spec — attendance is a roster, not a punctuality tracker), and a
 * tap-to-open Details affordance.
 */
export function StudentRosterCard({
    student,
    onMarkAttendance,
    onOpenDetails,
}: {
    student: RosterStudent;
    onMarkAttendance: (status: ClassAttendance) => void;
    onOpenDetails: () => void;
}) {
    return (
        <GlassCard style={shadows.sm}>
            <View style={styles.headerRow}>
                <View style={styles.nameCol}>
                    <Text style={styles.name}>{student.name}</Text>
                    <Text style={styles.roll}>Roll {student.rollNumber}</Text>
                </View>
                <AnimatedPressable haptic="selection" onPress={onOpenDetails} style={styles.detailsBtn}>
                    <Info color={colors.info} size={14} strokeWidth={2.4} />
                    <Text style={styles.detailsText}>Details</Text>
                    <ChevronRight color={colors.info} size={14} strokeWidth={2.4} />
                </AnimatedPressable>
            </View>

            <CampusStatusBadge status={student.campusStatus} at={student.campusStatusAt} />

            <View style={styles.toggles}>
                {ATTENDANCE_STAGES.map(({ stage, fg, bg }) => {
                    const active = student.classAttendance === stage;
                    return (
                        <AnimatedPressable
                            key={stage}
                            haptic="selection"
                            onPress={() => onMarkAttendance(stage)}
                            style={[styles.toggle, active ? { backgroundColor: fg, borderColor: fg } : { borderColor: bg }]}
                        >
                            <Text style={[styles.toggleText, active ? styles.toggleTextActive : { color: fg }]}>{stage}</Text>
                        </AnimatedPressable>
                    );
                })}
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.sm },
    nameCol: { flex: 1 },
    name: { ...typography.bodyBold, color: colors.textPrimary },
    roll: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.infoBg, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6 },
    detailsText: { fontSize: 12, fontWeight: '700', color: colors.info },
    toggles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    toggle: { flex: 1, minHeight: 38, borderRadius: radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    toggleText: { fontSize: 12, fontWeight: '700' },
    toggleTextActive: { color: palette.white },
});
