import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowDown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';

const PHONE_REASONS = ['New primary number', 'Lost/Stolen phone', 'Correcting a typo', 'Other'];
const STOP_REASONS = ['Moved to a new house', 'Road construction/closure', 'Safety concern', 'Other'];
export const MOCK_OTP = '4821';

export function ContactUpdateModal({
  visible,
  currentPhone,
  currentEmail,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  currentPhone: string;
  currentEmail: string;
  onClose: () => void;
  onSubmit: (input: { channel: 'phone' | 'email'; nextValue: string; reason: string }) => void;
}) {
  const [channel, setChannel] = useState<'phone' | 'email'>('phone');
  const [nextValue, setNextValue] = useState('');
  const [reason, setReason] = useState(PHONE_REASONS[0]);
  const [note, setNote] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [openReasons, setOpenReasons] = useState(false);
  const other = reason === 'Other';
  const verified = otp === MOCK_OTP;
  const ready = nextValue.trim().length > 0 && verified && (!other || note.trim().length > 0);
  const current = channel === 'phone' ? currentPhone : currentEmail;

  function close() {
    setNextValue('');
    setNote('');
    setOtp('');
    setOtpSent(false);
    setReason(PHONE_REASONS[0]);
    onClose();
  }

  return (
    <GlassModal visible={visible} title="Update contact" onClose={close}>
      <View style={styles.switch}>
        <AnimatedPressable haptic="selection" onPress={() => setChannel('phone')} style={[styles.pill, channel === 'phone' ? styles.pillOn : null]}>
          <Text style={styles.pillText}>Phone</Text>
        </AnimatedPressable>
        <AnimatedPressable haptic="selection" onPress={() => setChannel('email')} style={[styles.pill, channel === 'email' ? styles.pillOn : null]}>
          <Text style={styles.pillText}>Email</Text>
        </AnimatedPressable>
      </View>
      <Text style={styles.kicker}>Current</Text>
      <GlassCard style={styles.dim}><Text style={styles.body}>{current || 'Not set'}</Text></GlassCard>
      <View style={styles.arrow}><ArrowDown color={portalAccents.parent.from} size={18} /></View>
      <Text style={styles.kicker}>Requested</Text>
      <AppTextInput
        value={nextValue}
        onChangeText={setNextValue}
        placeholder={channel === 'phone' ? '+91 ...' : 'name@email.com'}
        placeholderTextColor={colors.textPlaceholder}
        keyboardType={channel === 'phone' ? 'phone-pad' : 'email-address'}
        autoCapitalize="none"
        style={styles.input}
      />
      <AnimatedPressable haptic="selection" onPress={() => setOpenReasons((value) => !value)} style={styles.dropdown}>
        <Text style={styles.body}>{reason}</Text>
      </AnimatedPressable>
      {openReasons ? (
        <Animated.View entering={FadeInDown.duration(200)}>
          {PHONE_REASONS.map((item) => (
            <AnimatedPressable key={item} haptic="selection" onPress={() => { setReason(item); setOpenReasons(false); }} style={styles.reason}>
              <Text style={styles.body}>{item}</Text>
            </AnimatedPressable>
          ))}
        </Animated.View>
      ) : null}
      {other ? (
        <AppTextInput value={note} onChangeText={setNote} placeholder="Please specify" placeholderTextColor={colors.textPlaceholder} style={styles.input} />
      ) : null}
      <AnimatedPressable
        haptic="medium"
        onPress={() => setOtpSent(true)}
        style={styles.otpBtn}
      >
        <Text style={styles.otpBtnText}>{otpSent ? `Code sent to ${currentEmail}` : 'Send OTP'}</Text>
      </AnimatedPressable>
      {otpSent ? (
        <AppTextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="4-digit code"
          placeholderTextColor={colors.textPlaceholder}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />
      ) : null}
      <AnimatedPressable
        haptic="medium"
        disabled={!ready}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          const full = note.trim() ? `${reason} — ${note.trim()}` : reason;
          onSubmit({ channel, nextValue: nextValue.trim(), reason: full });
          close();
        }}
        style={[styles.submitWrap, !ready ? styles.disabled : null]}
      >
        <LinearGradient colors={[portalAccents.parent.from, portalAccents.parent.to]} style={styles.submit}>
          <Text style={styles.submitText}>Submit request</Text>
        </LinearGradient>
      </AnimatedPressable>
    </GlassModal>
  );
}

export function StopReasonModal({
  visible,
  currentStop,
  requested,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  currentStop: string;
  requested: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState(STOP_REASONS[0]);
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const other = reason === 'Other';
  const ready = !other || note.trim().length > 0;

  return (
    <GlassModal visible={visible} title="Why this stop?" onClose={onClose}>
      <Text style={styles.kicker}>Current stop</Text>
      <GlassCard style={styles.dim}><Text style={styles.body}>{currentStop}</Text></GlassCard>
      <View style={styles.arrow}><ArrowDown color={portalAccents.parent.from} size={18} /></View>
      <Text style={styles.kicker}>Requested stop</Text>
      <GlassCard><Text style={styles.body}>{requested}</Text></GlassCard>
      <AnimatedPressable haptic="selection" onPress={() => setOpen((value) => !value)} style={styles.dropdown}>
        <Text style={styles.body}>{reason}</Text>
      </AnimatedPressable>
      {open ? STOP_REASONS.map((item) => (
        <AnimatedPressable key={item} haptic="selection" onPress={() => { setReason(item); setOpen(false); }} style={styles.reason}>
          <Text style={styles.body}>{item}</Text>
        </AnimatedPressable>
      )) : null}
      {other ? <AppTextInput value={note} onChangeText={setNote} placeholder="Please specify" placeholderTextColor={colors.textPlaceholder} style={styles.input} /> : null}
      <AnimatedPressable
        haptic="medium"
        disabled={!ready}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          onSubmit(note.trim() ? `${reason} — ${note.trim()}` : reason);
        }}
        style={[styles.submitWrap, !ready ? styles.disabled : null]}
      >
        <LinearGradient colors={[portalAccents.parent.from, portalAccents.parent.to]} style={styles.submit}>
          <Text style={styles.submitText}>Submit request</Text>
        </LinearGradient>
      </AnimatedPressable>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', gap: spacing.sm },
  pill: { flex: 1, minHeight: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.infoBg, borderColor: portalAccents.parent.from },
  pillText: { ...typography.bodyBold },
  kicker: { ...typography.overline, marginTop: spacing.sm, marginBottom: spacing.xs },
  dim: { opacity: 0.7 },
  body: { ...typography.body },
  arrow: { alignItems: 'center', marginVertical: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: portalAccents.parent.from,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  dropdown: { minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: spacing.md, marginTop: spacing.sm },
  reason: { paddingVertical: spacing.sm },
  otpBtn: { marginTop: spacing.md, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  otpBtnText: { ...typography.bodyBold, color: portalAccents.parent.from, backgroundColor: 'transparent' },
  submitWrap: { marginTop: spacing.lg, borderRadius: radius.md, overflow: 'hidden' },
  submit: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
});
