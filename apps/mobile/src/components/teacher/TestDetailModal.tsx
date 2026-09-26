import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { MarkedTest, RosterStudent, useTeacherStore } from '@/store/teacher.store';

/**
 * V3 grading sheet. Respects `targetStudentIds` — a targeted test only
 * lists the selected students, not the whole class.
 */
export function TestDetailModal({
    test,
    roster,
    onClose,
}: {
    test: MarkedTest | null;
    roster: RosterStudent[];
    onClose: () => void;
}) {
    const logTestScore = useTeacherStore((state) => state.logTestScore);
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!test) return;
        const next: Record<string, string> = {};
        test.scores.forEach((entry) => {
            next[entry.studentId] = entry.score === null ? '' : String(entry.score);
        });
        setDrafts(next);
    }, [test]);

    const gradedRoster = useMemo(() => {
        if (!test) return [] as RosterStudent[];
        const ids = test.targetStudentIds.length > 0
            ? test.targetStudentIds
            : test.scores.map((entry) => entry.studentId);
        return ids
            .map((id) => roster.find((student) => student.id === id))
            .filter((student): student is RosterStudent => Boolean(student));
    }, [test, roster]);

    function handleSave() {
        if (!test) return;
        Object.entries(drafts).forEach(([studentId, raw]) => {
            const trimmed = raw.trim();
            if (trimmed === '') {
                logTestScore(test.id, studentId, null);
                return;
            }
            const parsed = Number(trimmed);
            if (!Number.isNaN(parsed)) {
                logTestScore(test.id, studentId, Math.min(parsed, test.maxMarks));
            }
        });
        onClose();
    }

    return (
        <GlassModal visible={test !== null} title={test?.title ?? ''} onClose={onClose}>
            {test ? (
                <>
                    <Text style={styles.subtitle}>
                        {test.subject} · Max marks: {test.maxMarks} · {test.date}
                        {test.targetStudentIds.length > 0 ? ` · Targeted (${test.targetStudentIds.length})` : ''}
                    </Text>

                    <View style={styles.list}>
                        {gradedRoster.map((student) => (
                            <View key={student.id} style={styles.row}>
                                <View style={styles.nameCol}>
                                    <Text style={styles.name} numberOfLines={1}>{student.name}</Text>
                                    <Text style={styles.roll}>Roll {student.rollNumber}</Text>
                                </View>
                                <TextInput
                                    value={drafts[student.id] ?? ''}
                                    onChangeText={(value) => setDrafts((prev) => ({ ...prev, [student.id]: value }))}
                                    keyboardType="number-pad"
                                    placeholder="—"
                                    placeholderTextColor={colors.textMuted}
                                    style={styles.input}
                                />
                            </View>
                        ))}
                    </View>

                    <AnimatedPressable haptic="medium" onPress={handleSave} style={styles.saveBtn}>
                        <Text style={styles.saveText}>Save Marks</Text>
                    </AnimatedPressable>
                </>
            ) : null}
        </GlassModal>
    );
}

const styles = StyleSheet.create({
    subtitle: { fontSize: 13, color: colors.textMuted },
    list: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    nameCol: { flex: 1 },
    name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    roll: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    input: {
        width: 68,
        minHeight: 40,
        borderWidth: 1,
        borderColor: glass.border,
        borderRadius: radius.sm,
        backgroundColor: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        fontSize: 15,
        color: colors.textPrimary,
    },
    saveBtn: {
        minHeight: 46,
        borderRadius: radius.md,
        backgroundColor: statusColors.academics,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
