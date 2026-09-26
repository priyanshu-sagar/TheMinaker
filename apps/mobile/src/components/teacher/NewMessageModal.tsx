import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { DirectReportRoute, RosterStudent } from '@/store/teacher.store';

export function AnnouncementModal({
  visible,
  className,
  onClose,
  onSend,
}: {
  visible: boolean;
  className: string;
  onClose: () => void;
  onSend: (payload: { title: string; body: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function handleClose() {
    setTitle('');
    setBody('');
    onClose();
  }

  function handleSend() {
    if (!title.trim() || !body.trim()) return;
    onSend({ title: title.trim(), body: body.trim() });
    Alert.alert('Announcement sent', `Pushed to every parent in ${className}.`);
    handleClose();
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0;

  return (
    <GlassModal visible={visible} title="Class Announcement" onClose={handleClose}>
      <Text style={styles.hint}>Goes to the whole of {className}. Subject teachers cannot post class announcements.</Text>
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Homework for Monday" />
      <Field label="Message" value={body} onChangeText={setBody} placeholder="Write the announcement…" multiline />
      <AnimatedPressable haptic="medium" onPress={handleSend} disabled={!canSend} style={[styles.sendBtn, !canSend ? styles.disabled : null]}>
        <Text style={styles.sendText}>Send to Class</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

export function DirectReportModal({
  visible,
  roster,
  presetStudentId,
  onClose,
  onSend,
}: {
  visible: boolean;
  roster: RosterStudent[];
  presetStudentId?: string | null;
  onClose: () => void;
  onSend: (payload: { title: string; body: string; targetStudentId: string; route: DirectReportRoute }) => void;
}) {
  const [studentId, setStudentId] = useState<string | null>(presetStudentId ?? null);
  const [route, setRoute] = useState<DirectReportRoute>('Parent');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (visible) setStudentId(presetStudentId ?? null);
  }, [visible, presetStudentId]);

  function handleClose() {
    setStudentId(presetStudentId ?? null);
    setRoute('Parent');
    setTitle('');
    setBody('');
    onClose();
  }

  function handleSend() {
    if (!studentId || !title.trim() || !body.trim()) return;
    const student = roster.find((item) => item.id === studentId);
    onSend({ title: title.trim(), body: body.trim(), targetStudentId: studentId, route });
    const destination = route === 'SchoolAdmin' ? 'the school admin' : `${student?.parentName ?? 'the parent'}`;
    Alert.alert('Report sent', `Delivered to ${destination}.`);
    handleClose();
  }

  const canSend = Boolean(studentId) && title.trim().length > 0 && body.trim().length > 0;

  return (
    <GlassModal visible={visible} title="Direct Report" onClose={handleClose}>
      <Text style={styles.label}>About which student?</Text>
      <View style={styles.chipWrap}>
        {roster.map((student) => {
          const active = student.id === studentId;
          return (
            <AnimatedPressable
              key={student.id}
              haptic="selection"
              onPress={() => setStudentId(student.id)}
              style={[styles.chip, active ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{student.name}</Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <Text style={styles.label}>Send to</Text>
      <View style={styles.routeRow}>
        <AnimatedPressable haptic="selection" onPress={() => setRoute('Parent')} style={[styles.routeBtn, route === 'Parent' ? styles.routeBtnActive : null]}>
          <Text style={[styles.routeText, route === 'Parent' ? styles.routeTextActive : null]}>Message Parent</Text>
        </AnimatedPressable>
        <AnimatedPressable haptic="selection" onPress={() => setRoute('SchoolAdmin')} style={[styles.routeBtn, route === 'SchoolAdmin' ? styles.routeBtnActive : null]}>
          <Text style={[styles.routeText, route === 'SchoolAdmin' ? styles.routeTextActive : null]}>Report to School Admin</Text>
        </AnimatedPressable>
      </View>

      <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Missed homework" />
      <Field label="Message" value={body} onChangeText={setBody} placeholder="What should they know?" multiline />
      <AnimatedPressable haptic="medium" onPress={handleSend} disabled={!canSend} style={[styles.sendBtn, !canSend ? styles.disabled : null]}>
        <Text style={styles.sendText}>{route === 'Parent' ? 'Message Parent' : 'Report to Admin'}</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multiline : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
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
  multiline: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: 16, borderWidth: 1.5, borderColor: glass.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  routeRow: { gap: spacing.sm },
  routeBtn: { minHeight: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: glass.border, alignItems: 'center', justifyContent: 'center' },
  routeBtnActive: { backgroundColor: statusColors.info, borderColor: statusColors.info },
  routeText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  routeTextActive: { color: '#fff' },
  sendBtn: { minHeight: 46, borderRadius: radius.md, backgroundColor: statusColors.info, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
