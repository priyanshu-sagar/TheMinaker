import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassModal } from '@/components/glass/GlassModal';

export function CreateTestModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; subject: string; maxMarks: number }) => void;
}) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [maxMarks, setMaxMarks] = useState('');

  function handleClose() {
    setTitle('');
    setSubject('');
    setMaxMarks('');
    onClose();
  }

  function handleCreate() {
    const marks = Number(maxMarks);
    if (!title.trim() || !subject.trim() || !maxMarks.trim() || Number.isNaN(marks) || marks <= 0) return;
    onCreate({ title: title.trim(), subject: subject.trim(), maxMarks: marks });
    handleClose();
  }

  const valid = title.trim() && subject.trim() && maxMarks.trim() && !Number.isNaN(Number(maxMarks));

  return (
    <GlassModal visible={visible} title="Create New Test" onClose={handleClose}>
      <Field label="Test Title" value={title} onChangeText={setTitle} placeholder="e.g. Unit Test 3" />
      <Field label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" />
      <Field label="Max Marks" value={maxMarks} onChangeText={setMaxMarks} placeholder="e.g. 25" keyboardType="number-pad" />
      <Pressable style={[styles.createBtn, !valid ? styles.disabled : null]} onPress={handleCreate} disabled={!valid}>
        <Text style={styles.createText}>Create Test</Text>
      </Pressable>
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
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
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
  createBtn: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: statusColors.academics,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  createText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
