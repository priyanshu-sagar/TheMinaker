import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, glass, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';

export type ConfirmTone = 'approve' | 'reject' | 'override' | 'info';
export type ConfirmRequest = {
  tone: ConfirmTone;
  title: string;
  summary: string;
  confirmLabel: string;
  reasons?: string[];
  onConfirm: (reason?: string) => void;
};

const TONE = {
  approve: { mark: '✓', bg: colors.successBg, fg: colors.success, button: colors.success },
  reject: { mark: '!', bg: colors.errorBg, fg: colors.error, button: colors.error },
  override: { mark: '!', bg: colors.warningBg, fg: colors.warning, button: portalAccents.conductor.from },
  info: { mark: 'i', bg: colors.infoBg, fg: colors.info, button: colors.info },
} as const;

export function GlassConfirmModal({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
  const [reason, setReason] = useState<string | null>(null);
  const tone = request ? TONE[request.tone] : TONE.info;
  const needsReason = (request?.reasons?.length ?? 0) > 0;
  return (
    <Modal visible={request !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {request ? (
          <View style={styles.card}>
            <View style={[styles.badge, { backgroundColor: tone.bg }]}><Text style={[styles.badgeText, { color: tone.fg }]}>{tone.mark}</Text></View>
            <Text style={styles.title}>{request.title}</Text>
            <Text style={styles.summary}>{request.summary}</Text>
            {request.reasons ? (
              <View style={styles.reasons}>
                {request.reasons.map((item) => (
                  <AnimatedPressable key={item} haptic="selection" onPress={() => setReason(item)} style={[styles.reason, reason === item ? styles.reasonOn : null]}>
                    <Text style={styles.reasonText}>{item}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            ) : null}
            <AnimatedPressable haptic="selection" onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></AnimatedPressable>
            <AnimatedPressable haptic="medium" disabled={needsReason && !reason} onPress={() => { if (needsReason && !reason) return; request.onConfirm(reason ?? undefined); setReason(null); onClose(); }} style={[styles.confirm, { backgroundColor: tone.button }, needsReason && !reason ? styles.disabled : null]}>
              <Text style={styles.confirmText}>{request.confirmLabel}</Text>
            </AnimatedPressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: glass.overlayBg, justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: palette.offWhite, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg },
  badge: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  badgeText: { ...typography.heading, backgroundColor: 'transparent' },
  title: { ...typography.heading },
  summary: { ...typography.body, marginTop: spacing.xs, marginBottom: spacing.md },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  reason: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  reasonOn: { borderColor: colors.error, backgroundColor: colors.errorBg },
  reasonText: { ...typography.caption, color: colors.textPrimary },
  cancel: { minHeight: 48, borderRadius: radius.full, backgroundColor: colors.neutralBg, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.bodyBold },
  confirm: { minHeight: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  confirmText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
});
