import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, Users } from 'lucide-react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { RosterStudent } from '@/store/teacher.store';

/**
 * V3 test creator with **targeted test creation**. The teacher can either
 * keep the default "Entire class" scope or open the multi-select student
 * picker to grade only a subset (e.g. a retest for the students who missed
 * the last unit test).
 */
export function CreateTestModal({
    visible,
    onClose,
    onCreate,
    classId,
    classStudents,
}: {
    visible: boolean;
    onClose: () => void;
    onCreate: (input: { classId: string; title: string; subject: string; maxMarks: number; targetStudentIds: string[] }) => void;
    classId: string;
    classStudents: RosterStudent[];
}) {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [maxMarks, setMaxMarks] = useState('');
    const [targeted, setTargeted] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    function reset() {
        setTitle('');
        setSubject('');
        setMaxMarks('');
        setTargeted(false);
        setSelectedIds([]);
    }

    function handleClose() {
        reset();
        onClose();
    }

    function toggleStudent(id: string) {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
    }

    function handleCreate() {
        const marks = Number(maxMarks);
        if (!title.trim() || !subject.trim() || !maxMarks.trim() || Number.isNaN(marks) || marks <= 0) return;
        if (targeted && selectedIds.length === 0) return;
        onCreate({
            classId,
            title: title.trim(),
            subject: subject.trim(),
            maxMarks: marks,
            targetStudentIds: targeted ? selectedIds : [],
        });
        handleClose();
    }

    const valid = useMemo(() => {
        if (!title.trim() || !subject.trim() || !maxMarks.trim()) return false;
        if (Number.isNaN(Number(maxMarks))) return false;
        if (targeted && selectedIds.length === 0) return false;
        return true;
    }, [title, subject, maxMarks, targeted, selectedIds]);

    return (
        <GlassModal visible={visible} title="Create New Test" onClose={handleClose}>
            <Field label="Test Title" value={title} onChangeText={setTitle} placeholder="e.g. Unit Test 3" />
            <Field label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" />
            <Field label="Max Marks" value={maxMarks} onChangeText={setMaxMarks} placeholder="e.g. 25" keyboardType="number-pad" />

            <Text style={styles.label}>Test Scope</Text>
            <View style={styles.scopeRow}>
                <AnimatedPressable
                    haptic="selection"
                    onPress={() => { setTargeted(false); setSelectedIds([]); }}
                    style={[styles.scopeBtn, !targeted ? styles.scopeBtnActive : null]}
                >
                    <Users color={!targeted ? '#fff' : colors.textSecondary} size={16} strokeWidth={2.4} />
                    <Text style={[styles.scopeText, !targeted ? styles.scopeTextActive : null]}>Entire Class</Text>
                </AnimatedPressable>
                <AnimatedPressable
                    haptic="selection"
                    onPress={() => setTargeted(true)}
                    style={[styles.scopeBtn, targeted ? styles.scopeBtnActive : null]}
                >
                    <Check color={targeted ? '#fff' : colors.textSecondary} size={16} strokeWidth={2.4} />
                    <Text style={[styles.scopeText, targeted ? styles.scopeTextActive : null]}>
                        Selected Students ({selectedIds.length})
                    </Text>
                </AnimatedPressable>
            </View>

            {targeted ? (
                <View style={styles.pickerCard}>
                    <Text style={styles.pickerHint}>Choose which students this test is for. Only they will appear in the grading sheet.</Text>
                    <View style={styles.pickerList}>
                        {classStudents.map((student) => {
                            const active = selectedIds.includes(student.id);
                            return (
                                <AnimatedPressable
                                    key={student.id}
                                    haptic="selection"
                                    onPress={() => toggleStudent(student.id)}
                                    style={[styles.pickerRow, active ? styles.pickerRowActive : null]}
                                >
                                    <View style={[styles.checkbox, active ? styles.checkboxActive : null]}>
                                        {active ? <Check color="#fff" size={12} strokeWidth={3} /> : null}
                                    </View>
                                    <Text style={styles.pickerName}>{student.name}</Text>
                                    <Text style={styles.pickerRoll}>Roll {student.rollNumber}</Text>
                                </AnimatedPressable>
                            );
                        })}
                    </View>
                </View>
            ) : null}

            <AnimatedPressable
                haptic="medium"
                onPress={handleCreate}
                disabled={!valid}
                style={[styles.createBtn, !valid ? styles.disabled : null]}
            >
                <Text style={styles.createText}>Create Test</Text>
            </AnimatedPressable>
        </GlassModal>
    );
}

function Field({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
}: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'number-pad';
}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType}
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
    input: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: glass.border,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
    },
    scopeRow: { flexDirection: 'row', gap: spacing.sm },
    scopeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: glass.border },
    scopeBtnActive: { backgroundColor: statusColors.academics, borderColor: statusColors.academics },
    scopeText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    scopeTextActive: { color: '#fff' },
    pickerCard: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: radius.md, borderWidth: 1, borderColor: glass.border, padding: spacing.md, gap: spacing.sm },
    pickerHint: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
    pickerList: { gap: 6 },
    pickerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8 },
    pickerRowActive: { backgroundColor: statusColors.academicsBg },
    checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: statusColors.academics, borderColor: statusColors.academics },
    pickerName: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    pickerRoll: { fontSize: 11, color: colors.textMuted },
    createBtn: {
        minHeight: 46,
        borderRadius: radius.md,
        backgroundColor: statusColors.academics,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xs,
    },
    disabled: { opacity: 0.5 },
    createText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
