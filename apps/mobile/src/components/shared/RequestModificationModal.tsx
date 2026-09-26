import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/gateman-theme';
import { GlassModal } from '@/components/glass/GlassModal';

export function RequestModificationModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setText('');
    setSubmitted(false);
    onClose();
  }

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setSubmitted(true);
  }

  return (
    <GlassModal visible={visible} title="Request Details Modification" onClose={handleClose}>
      {submitted ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>Your request has been sent to the school admin.</Text>
          <Pressable style={styles.doneBtn} onPress={handleClose}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.hint}>
            Describe the change you need to your profile or gate access details. The school admin
            will review and update your record.
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="e.g. Update my registered phone number…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <Pressable style={[styles.submitBtn, !text.trim() ? styles.submitBtnDisabled : null]} onPress={handleSubmit} disabled={!text.trim()}>
            <Text style={styles.submitText}>Submit to Admin</Text>
          </Pressable>
        </>
      )}
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
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
  submitBtn: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  confirm: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.md },
  confirmText: { fontSize: 15, color: colors.textPrimary, textAlign: 'center' },
  doneBtn: {
    minHeight: 44,
    minWidth: 140,
    borderRadius: radius.md,
    backgroundColor: statusColors.online,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
