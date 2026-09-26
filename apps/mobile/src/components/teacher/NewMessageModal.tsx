import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassModal } from '@/components/glass/GlassModal';
import { CommsType, RosterStudent } from '@/store/teacher.store';

const MESSAGE_TYPES = [
  { key: 'general', label: 'General Announcement', commsType: 'Broadcast' as CommsType },
  { key: 'homework', label: 'Homework Alert', commsType: 'Broadcast' as CommsType },
  { key: 'disciplinary', label: 'Disciplinary Complaint', commsType: 'Complaint' as CommsType },
] as const;

type MessageTypeKey = (typeof MESSAGE_TYPES)[number]['key'];
type Target = 'class' | 'student';

export function NewMessageModal({
  visible,
  onClose,
  roster,
  onSend,
}: {
  visible: boolean;
  onClose: () => void;
  roster: RosterStudent[];
  onSend: (payload: { type: CommsType; title: string; body: string; targetStudentId?: string }) => void;
}) {
  const [typeKey, setTypeKey] = useState<MessageTypeKey>('general');
  const [target, setTarget] = useState<Target>('class');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [body, setBody] = useState('');

  function reset() {
    setTypeKey('general');
    setTarget('class');
    setStudentId(null);
    setBody('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSend() {
    if (!body.trim()) return;
    const selectedType = MESSAGE_TYPES.find((item) => item.key === typeKey)!;
    const targetStudentId = target === 'student' ? studentId ?? undefined : undefined;
    if (target === 'student' && !targetStudentId) return;

    onSend({
      type: selectedType.commsType,
      title: selectedType.label,
      body: body.trim(),
      targetStudentId,
    });

    const targetLabel = targetStudentId
      ? roster.find((student) => student.id === targetStudentId)?.name ?? 'student'
      : 'the entire class';
    Alert.alert('Notification sent', `"${selectedType.label}" was pushed to ${targetLabel}.`);
    handleClose();
  }

  const canSend = body.trim().length > 0 && (target === 'class' || studentId !== null);

  return (
    <GlassModal visible={visible} title="New Message" onClose={handleClose}>
      <Text style={styles.label}>Select Type</Text>
      <View style={styles.optionList}>
        {MESSAGE_TYPES.map((option) => (
          <Pressable
            key={option.key}
            style={[styles.option, typeKey === option.key ? styles.optionActive : null]}
            onPress={() => setTypeKey(option.key)}
          >
            <Text style={[styles.optionText, typeKey === option.key ? styles.optionTextActive : null]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Target</Text>
      <View style={styles.optionRow}>
        <Pressable style={[styles.pill, target === 'class' ? styles.pillActive : null]} onPress={() => { setTarget('class'); setStudentId(null); }}>
          <Text style={[styles.pillText, target === 'class' ? styles.pillTextActive : null]}>Entire Class</Text>
        </Pressable>
        <Pressable style={[styles.pill, target === 'student' ? styles.pillActive : null]} onPress={() => setTarget('student')}>
          <Text style={[styles.pillText, target === 'student' ? styles.pillTextActive : null]}>Specific Student</Text>
        </Pressable>
      </View>

      {target === 'student' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentRow}>
          {roster.map((student) => (
            <Pressable
              key={student.id}
              style={[styles.studentChip, studentId === student.id ? styles.studentChipActive : null]}
              onPress={() => setStudentId(student.id)}
            >
              <Text style={[styles.studentChipText, studentId === student.id ? styles.studentChipTextActive : null]}>
                {student.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.label}>Message Body</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Type your message…"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Pressable style={[styles.sendBtn, !canSend ? styles.sendBtnDisabled : null]} onPress={handleSend} disabled={!canSend}>
        <Text style={styles.sendText}>Send Push Notification</Text>
      </Pressable>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.xs },
  optionList: { gap: spacing.sm },
  option: { minHeight: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: glass.border, justifyContent: 'center', paddingHorizontal: spacing.md },
  optionActive: { backgroundColor: statusColors.infoBg, borderColor: statusColors.info },
  optionText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  optionTextActive: { color: statusColors.info, fontWeight: '700' },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  pill: { flex: 1, minHeight: 42, borderRadius: radius.md, borderWidth: 1.5, borderColor: glass.border, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  studentRow: { gap: spacing.sm, paddingVertical: 2 },
  studentChip: { borderRadius: 16, borderWidth: 1.5, borderColor: glass.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  studentChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  studentChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  studentChipTextActive: { color: '#fff' },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  sendBtn: { minHeight: 46, borderRadius: radius.md, backgroundColor: statusColors.info, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
