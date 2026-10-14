import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, portalAccents, radius, spacing, typography } from '@/design/tokens';

export function RequestModal({
  visible,
  title,
  detailLabel,
  detailPlaceholder,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  title: string;
  detailLabel: string;
  detailPlaceholder: string;
  onClose: () => void;
  onSubmit: (detail: string, reason: string) => void;
}) {
  const [detail, setDetail] = useState('');
  const [reason, setReason] = useState('');

  function close() {
    setDetail('');
    setReason('');
    onClose();
  }

  const ready = detail.trim().length > 0 && reason.trim().length > 0;

  return (
    <GlassModal visible={visible} title={title} onClose={close}>
      <Text style={styles.label}>{detailLabel}</Text>
      <AppTextInput
        value={detail}
        onChangeText={setDetail}
        placeholder={detailPlaceholder}
        placeholderTextColor={colors.textPlaceholder}
        style={styles.input}
      />
      <Text style={styles.label}>Reason</Text>
      <AppTextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Why is this change needed?"
        placeholderTextColor={colors.textPlaceholder}
        multiline
        style={[styles.input, styles.reason]}
      />
      <AnimatedPressable
        haptic="medium"
        disabled={!ready}
        onPress={() => {
          onSubmit(detail.trim(), reason.trim());
          close();
        }}
        style={[styles.submit, !ready ? styles.disabled : null]}
      >
        <Text style={styles.submitText}>Submit Request</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.overline, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  reason: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  submit: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.45 },
  submitText: { ...typography.bodyBold, color: colors.surfaceStrong, backgroundColor: 'transparent' },
});
