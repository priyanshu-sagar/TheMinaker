import { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { Phone, Trash2 } from 'lucide-react-native';
import { glass, colors, radius, spacing, palette, shadows, typography } from '@/design/tokens';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { SearchBar } from '@/components/glass/SearchBar';
import { RosterStudent, SchedulePeriod, TeacherClass, useTeacherStore } from '@/store/teacher.store';

export function ManageClassesModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const classes = useTeacherStore((state) => state.classes);
  const addClass = useTeacherStore((state) => state.addClass);
  const removeClass = useTeacherStore((state) => state.removeClass);
  const [name, setName] = useState('');
  const [homeroom, setHomeroom] = useState(false);

  function handleAdd() {
    if (!name.trim()) return;
    addClass(name, homeroom);
    setName('');
    setHomeroom(false);
  }

  return (
    <GlassModal visible={visible} title="Manage My Classes" onClose={onClose}>
      <Text style={styles.hint}>Add a class you teach. Mark it as homeroom only if you are that class's class teacher.</Text>
      {classes.map((cls) => (
        <ClassRow key={cls.id} cls={cls} canRemove={classes.length > 1} onRemove={() => removeClass(cls.id)} />
      ))}
      <Text style={styles.label}>New class</Text>
      <AppTextInput value={name} onChangeText={setName} placeholder="e.g. Class 9-A Science" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AnimatedPressable haptic="selection" onPress={() => setHomeroom((value) => !value)} style={[styles.toggle, homeroom ? styles.toggleOn : null]}>
        <Text style={[styles.toggleText, homeroom ? styles.toggleTextOn : null]}>{homeroom ? 'Homeroom class' : 'Subject class only'}</Text>
      </AnimatedPressable>
      <AnimatedPressable haptic="medium" onPress={handleAdd} disabled={!name.trim()} style={[styles.primary, shadows.sm, !name.trim() ? styles.disabled : null]}>
        <Text style={styles.primaryText}>Add Class</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

function ClassRow({ cls, canRemove, onRemove }: { cls: TeacherClass; canRemove: boolean; onRemove: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{cls.name}</Text>
        <Text style={styles.rowMeta}>{cls.isClassTeacher ? 'Homeroom' : 'Subject'}</Text>
      </View>
      {canRemove ? (
        <AnimatedPressable haptic="medium" onPress={onRemove} style={styles.iconBtn}>
          <Trash2 color={colors.error} size={16} strokeWidth={2.2} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

export function EditTimetableModal({ visible, classId, onClose }: { visible: boolean; classId: string; onClose: () => void }) {
  const schedule = useTeacherStore((state) => state.schedule);
  const addSchedulePeriod = useTeacherStore((state) => state.addSchedulePeriod);
  const removeSchedulePeriod = useTeacherStore((state) => state.removeSchedulePeriod);
  const periods = schedule.filter((period) => period.classId === classId);
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');

  function handleAdd() {
    if (!subject.trim() || !time.trim() || !endTime.trim() || !room.trim()) return;
    const nextPeriod = periods.reduce((max, period) => Math.max(max, period.period), 0) + 1;
    addSchedulePeriod({ classId, period: nextPeriod, subject: subject.trim(), time: time.trim(), endTime: endTime.trim(), room: room.trim() });
    setSubject('');
    setTime('');
    setEndTime('');
    setRoom('');
  }

  const canAdd = subject.trim() && time.trim() && endTime.trim() && room.trim();

  return (
    <GlassModal visible={visible} title="Edit Timetable" onClose={onClose}>
      {periods.length === 0 ? <Text style={styles.hint}>No periods for this class yet.</Text> : null}
      {periods.map((period) => (
        <PeriodRow key={period.id} period={period} onRemove={() => removeSchedulePeriod(period.id)} />
      ))}
      <Text style={styles.label}>Add period</Text>
      <AppTextInput value={subject} onChangeText={setSubject} placeholder="Subject" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AppTextInput value={time} onChangeText={setTime} placeholder="Start, e.g. 2:05 PM" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AppTextInput value={endTime} onChangeText={setEndTime} placeholder="End, e.g. 2:50 PM" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AppTextInput value={room} onChangeText={setRoom} placeholder="Room" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AnimatedPressable haptic="medium" onPress={handleAdd} disabled={!canAdd} style={[styles.primary, shadows.sm, !canAdd ? styles.disabled : null]}>
        <Text style={styles.primaryText}>Add Period</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

function PeriodRow({ period, onRemove }: { period: SchedulePeriod; onRemove: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>P{period.period} · {period.subject}</Text>
        <Text style={styles.rowMeta}>{period.time} – {period.endTime} · {period.room}</Text>
      </View>
      <AnimatedPressable haptic="medium" onPress={onRemove} style={styles.iconBtn}>
        <Trash2 color={colors.error} size={16} strokeWidth={2.2} />
      </AnimatedPressable>
    </View>
  );
}

export function RosterManagementModal({ visible, classId, onClose }: { visible: boolean; classId: string; onClose: () => void }) {
  const students = useTeacherStore((state) => state.students);
  const addStudent = useTeacherStore((state) => state.addStudent);
  const removeStudent = useTeacherStore((state) => state.removeStudent);
  const roster = students.filter((student) => student.classId === classId);
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  function handleAdd() {
    if (!name.trim() || !roll.trim()) return;
    addStudent(classId, {
      name,
      rollNumber: roll,
      parentName: parentName || 'Parent',
      parentPhone: parentPhone || '+910000000000',
      parentEmail: parentEmail || 'parent@example.in',
    });
    setName('');
    setRoll('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
  }

  return (
    <GlassModal visible={visible} title="Student & Roster" onClose={onClose}>
      {roster.map((student) => (
        <View key={student.id} style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>{student.name}</Text>
            <Text style={styles.rowMeta}>Roll {student.rollNumber}</Text>
          </View>
          <AnimatedPressable haptic="medium" onPress={() => removeStudent(student.id)} style={styles.iconBtn}>
            <Trash2 color={colors.error} size={16} strokeWidth={2.2} />
          </AnimatedPressable>
        </View>
      ))}
      <Text style={styles.label}>Add student</Text>
      <AppTextInput value={name} onChangeText={setName} placeholder="Student name" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AppTextInput value={roll} onChangeText={setRoll} placeholder="Roll number" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AppTextInput value={parentName} onChangeText={setParentName} placeholder="Parent name" placeholderTextColor={colors.textMuted} style={styles.input} />
      <AppTextInput value={parentPhone} onChangeText={setParentPhone} placeholder="Parent phone" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" style={styles.input} />
      <AppTextInput value={parentEmail} onChangeText={setParentEmail} placeholder="Parent email" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <AnimatedPressable haptic="medium" onPress={handleAdd} disabled={!name.trim() || !roll.trim()} style={[styles.primary, shadows.sm, !name.trim() || !roll.trim() ? styles.disabled : null]}>
        <Text style={styles.primaryText}>Add Student</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

export function ParentDirectoryModal({
  visible,
  roster,
  onClose,
}: {
  visible: boolean;
  roster: RosterStudent[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return roster;
    return roster.filter((student) =>
      student.name.toLowerCase().includes(needle) ||
      student.parentName.toLowerCase().includes(needle) ||
      student.parentPhone.includes(needle),
    );
  }, [query, roster]);

  return (
    <GlassModal visible={visible} title="Parent Directory" onClose={() => { setQuery(''); onClose(); }}>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search student or parent" />
      {filtered.length === 0 ? <Text style={styles.hint}>No matches.</Text> : null}
      {filtered.map((student) => (
        <View key={student.id} style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>{student.parentName}</Text>
            <Text style={styles.rowMeta}>{student.name} · {student.parentPhone}</Text>
          </View>
          <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${student.parentPhone}`).catch(() => undefined)} style={styles.iconBtn}>
            <Phone color={colors.success} size={16} strokeWidth={2.2} />
          </AnimatedPressable>
        </View>
      ))}
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
  label: { ...typography.overline, color: colors.textMuted, marginTop: spacing.sm },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowInfo: { flex: 1 },
  rowTitle: { ...typography.bodyBold, color: colors.textPrimary },
  rowMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  iconBtn: { width: 34, height: 34, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  toggle: { minHeight: 42, borderRadius: radius.md, borderWidth: 1.5, borderColor: glass.border, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.successBg, borderColor: colors.success },
  toggleText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  toggleTextOn: { color: colors.success },
  primary: { minHeight: 46, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  primaryText: { color: palette.white, fontSize: 15, fontWeight: '700' },
});
