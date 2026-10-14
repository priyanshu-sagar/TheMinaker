import { useEffect, useState } from 'react';
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
import { FleetBusOption } from '@/store/parent.store';

const REASONS = {
  phone: ['New primary number', 'Lost/Stolen phone', 'Correcting a typo', 'Other'],
  stop: ['Moved to a new house', 'Road construction/closure', 'Safety concern', 'Other'],
  bus: ['Moved to a different route zone', 'Schedule/timing conflict', 'Other'],
  details: ['Incorrect spelling', 'Class correction', 'Other'],
} as const;

export type RequestFormKind = keyof typeof REASONS;

export function RequestModal({
  visible,
  title,
  kind,
  currentValue,
  buses,
  lockedDetail,
  detailLabel,
  detailPlaceholder,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  title: string;
  kind: RequestFormKind;
  currentValue: string;
  buses?: FleetBusOption[];
  lockedDetail?: string;
  detailLabel: string;
  detailPlaceholder: string;
  onClose: () => void;
  onSubmit: (detail: string, reason: string) => void;
}) {
  const reasons = REASONS[kind];
  const [reason, setReason] = useState<string>(reasons[0]);
  const [openReasons, setOpenReasons] = useState(false);
  const [detail, setDetail] = useState('');
  const [note, setNote] = useState('');
  const [busId, setBusId] = useState<string | null>(null);
  const other = reason === 'Other';
  useEffect(() => {
    if (!visible) return;
    setReason(REASONS[kind][0]);
    setDetail('');
    setNote('');
    setBusId(null);
    setOpenReasons(false);
  }, [visible, kind]);
  const nextValue = kind === 'bus'
    ? buses?.find((bus) => bus.id === busId)?.routeName ?? ''
    : lockedDetail ?? detail;
  const ready = nextValue.trim().length > 0 && (!other || note.trim().length > 0);

  function close() {
    setReason(reasons[0]);
    setOpenReasons(false);
    setDetail('');
    setNote('');
    setBusId(null);
    onClose();
  }

  return (
    <GlassModal visible={visible} title={title} onClose={close}>
      <Text style={styles.kicker}>Current</Text>
      <GlassCard style={styles.current}>
        <Text style={styles.currentText}>{currentValue || 'Not set'}</Text>
      </GlassCard>
      <View style={styles.arrow}>
        <ArrowDown color={portalAccents.parent.from} size={18} />
      </View>
      <Text style={styles.kicker}>Requested</Text>
      {kind === 'bus' ? (
        <View>
          {(buses ?? []).map((bus) => {
            const on = bus.id === busId;
            return (
              <AnimatedPressable
                key={bus.id}
                haptic="selection"
                onPress={() => setBusId(bus.id)}
                style={[styles.bus, on ? styles.busOn : null]}
              >
                <Text style={styles.busRoute}>{bus.routeName}</Text>
                <Text style={styles.busMeta}>{bus.id} · Departs {bus.departs}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      ) : (
        <AppTextInput
          value={lockedDetail ?? detail}
          onChangeText={setDetail}
          editable={!lockedDetail}
          placeholder={detailPlaceholder}
          placeholderTextColor={colors.textPlaceholder}
          style={styles.input}
        />
      )}

      <Text style={styles.kicker}>Reason</Text>
      <AnimatedPressable haptic="selection" onPress={() => setOpenReasons((value) => !value)} style={styles.dropdown}>
        <Text style={styles.dropdownText}>{reason}</Text>
      </AnimatedPressable>
      {openReasons ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          {reasons.map((item) => (
            <AnimatedPressable
              key={item}
              haptic="selection"
              onPress={() => {
                setReason(item);
                setOpenReasons(false);
              }}
              style={styles.reasonRow}
            >
              <Text style={styles.reasonText}>{item}</Text>
            </AnimatedPressable>
          ))}
        </Animated.View>
      ) : null}

      <Text style={styles.kicker}>{other ? 'Please specify' : 'Extra detail'}</Text>
      <AppTextInput
        value={note}
        onChangeText={setNote}
        placeholder={other ? 'Describe the change' : 'Optional note'}
        placeholderTextColor={colors.textPlaceholder}
        multiline
        style={[styles.input, styles.note]}
      />

      <AnimatedPressable
        haptic="medium"
        disabled={!ready}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          const full = note.trim() ? `${reason} — ${note.trim()}` : reason;
          onSubmit(nextValue.trim(), full);
          close();
        }}
        style={[styles.submitWrap, !ready ? styles.disabled : null]}
      >
        <LinearGradient colors={[portalAccents.parent.from, portalAccents.parent.to]} style={styles.submit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </LinearGradient>
      </AnimatedPressable>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  kicker: { ...typography.overline, marginTop: spacing.sm, marginBottom: spacing.xs },
  current: { opacity: 0.72 },
  currentText: { ...typography.bodyBold },
  arrow: { alignItems: 'center', marginVertical: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: portalAccents.parent.from,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  note: { minHeight: 80, paddingTop: spacing.md, textAlignVertical: 'top', borderColor: colors.borderStrong },
  bus: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  busOn: { borderColor: portalAccents.parent.from, backgroundColor: colors.infoBg },
  busRoute: { ...typography.bodyBold },
  busMeta: { ...typography.caption, marginTop: 2 },
  dropdown: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dropdownText: { ...typography.bodyBold },
  reasonRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  reasonText: { ...typography.body },
  submitWrap: { marginTop: spacing.lg, borderRadius: radius.md, overflow: 'hidden' },
  submit: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
});
