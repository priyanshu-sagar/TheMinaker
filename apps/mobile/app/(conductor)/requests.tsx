import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useConductorStore } from '@/store/conductor.store';

const BUSES = ['Bus 1', 'Bus 2', 'Bus 3', 'Bus 4', 'Bus 5', 'Bus 6', 'Bus 8', 'Bus 12'];
const STAGES = ['Flagged', 'GatemanVerifying', 'ParentConfirming', 'Verified'] as const;

export default function RequestsScreen() {
  const requests = useConductorStore((state) => state.busChangeRequests);
  const flags = useConductorStore((state) => state.offLocationFlags);
  const pings = useConductorStore((state) => state.pingRecords);
  const submit = useConductorStore((state) => state.submitBusChangeRequest);
  const [open, setOpen] = useState(false);
  const [bus, setBus] = useState('');
  const [reason, setReason] = useState('');
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const pending = useMemo(() => requests.filter((item) => item.status === 'Pending').length, [requests]);

  function send() {
    if (!bus || reason.trim().length < 10) return;
    setAsk({ tone: 'approve', title: 'Send bus change', summary: `Ask the gateman to move this duty from Bus 7 to ${bus}?`, confirmLabel: 'Submit request', onConfirm: () => { submit(bus.toLowerCase().replace(' ', '-'), bus, reason.trim()); setOpen(false); setReason(''); setBus(''); } });
  }

  return (
    <MeshBackground>
      <ScrollView bounces={false} contentContainerStyle={styles.list}>
        <View style={styles.head}><Text style={styles.label}>Bus change requests</Text><Text style={styles.count}>{pending}</Text><AnimatedPressable haptic="selection" onPress={() => setOpen(true)} style={styles.add}><Text style={styles.addText}>New request</Text></AnimatedPressable></View>
        {requests.map((item) => (
          <GlassCard key={item.id} style={[shadows.md, styles.card, item.status === 'Rejected' ? styles.badBorder : item.status === 'Approved' ? styles.goodBorder : null]}>
            <Text style={styles.body}>{item.fromBusNumber} → {item.toBusNumber}</Text>
            <Text style={[styles.meta, styles.italic]}>{item.reason}</Text>
            <Text style={[styles.chip, item.status === 'Approved' ? styles.good : item.status === 'Rejected' ? styles.bad : styles.warn]}>{item.status}</Text>
            <Text style={styles.meta}>{item.status === 'Pending' ? 'Waiting on the gateman' : item.gatemanNote}</Text>
          </GlassCard>
        ))}
        <Text style={styles.label}>Off-location flags</Text>
        {flags.map((item) => {
          const stage = item.status === 'Rejected' ? 1 : STAGES.indexOf(item.status as typeof STAGES[number]);
          return (
            <GlassCard key={item.id} style={[shadows.md, styles.card, item.status === 'Verified' ? styles.goodBorder : item.status === 'Rejected' ? styles.badBorder : null]}>
              <Text style={styles.body}>{item.studentName} · {item.stopName}</Text>
              <Text style={styles.meta}>{item.distanceMeters}m from the stop</Text>
              <View style={styles.pipeline}>
                {STAGES.map((name, index) => <View key={name} style={styles.pipeItem}><View style={[styles.pipeDot, index < stage ? styles.dotDone : index === stage ? styles.dotNow : styles.dotNext]} /><Text style={styles.meta}>{name === 'GatemanVerifying' ? 'Gateman' : name === 'ParentConfirming' ? 'Parent' : name}</Text></View>)}
              </View>
              {item.gatemanNote ? <Text style={styles.note}>{item.gatemanNote}</Text> : null}
            </GlassCard>
          );
        })}
        <Text style={styles.label}>Parent pings</Text>
        {pings.map((item) => (
          <GlassCard key={item.id} style={[shadows.md, styles.card]}>
            <Text style={styles.body}>{item.studentName}</Text>
            <Text style={styles.meta}>{item.stopName}</Text>
            <Text style={styles.quote}>{item.conductorMessage}</Text>
            <Text style={[styles.chip, item.status === 'Replied' ? styles.good : item.status === 'Escalated' ? styles.bad : styles.warn]}>{item.status}</Text>
            {item.parentReply ? <Text style={styles.meta}>{item.parentReply}{item.parentReplyNote ? ` · ${item.parentReplyNote}` : ''}</Text> : <Text style={styles.meta}>{item.status === 'Escalated' ? 'Escalated to the gateman' : 'Waiting for the parent'}</Text>}
          </GlassCard>
        ))}
      </ScrollView>
      <GlassModal visible={open} maxHeight="70%" title="New bus change" onClose={() => setOpen(false)}>
        <View style={styles.pills}>{BUSES.map((item) => <AnimatedPressable key={item} haptic="selection" onPress={() => setBus(item)} style={[styles.pill, bus === item ? styles.pillOn : null]}><Text style={styles.meta}>{item}</Text></AnimatedPressable>)}</View>
        <AppTextInput value={reason} onChangeText={(value) => setReason(value.slice(0, 200))} multiline placeholder="Why should the gateman approve this bus?" placeholderTextColor={colors.textPlaceholder} style={styles.input} />
        <Text style={styles.meta}>{reason.length}/200{reason.length > 0 && reason.length < 10 ? ' · at least 10 characters' : ''}</Text>
        {!bus ? <Text style={styles.error}>Choose a bus</Text> : null}
        <AnimatedPressable haptic="medium" onPress={send} style={styles.submit}><Text style={styles.white}>Submit request</Text></AnimatedPressable>
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 140 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  label: { ...typography.label, flex: 1, marginTop: spacing.md, marginBottom: spacing.sm },
  count: { ...typography.caption, backgroundColor: colors.warningBg, color: colors.warning, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm },
  add: { backgroundColor: colors.warningBg, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  addText: { ...typography.caption, color: colors.warning, fontWeight: '700' },
  card: { padding: spacing.md, marginBottom: spacing.sm },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  italic: { fontStyle: 'italic' },
  chip: { alignSelf: 'flex-start', marginTop: spacing.xs, ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, fontWeight: '700' },
  good: { backgroundColor: colors.successBg, color: colors.success },
  bad: { backgroundColor: colors.errorBg, color: colors.error },
  warn: { backgroundColor: colors.warningBg, color: colors.warning },
  goodBorder: { borderColor: colors.success, borderWidth: 1 },
  badBorder: { borderColor: colors.error, borderWidth: 1 },
  pipeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  pipeItem: { alignItems: 'center', flex: 1 },
  pipeDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  dotDone: { backgroundColor: colors.success },
  dotNow: { backgroundColor: colors.warning },
  dotNext: { backgroundColor: colors.borderStrong },
  note: { ...typography.caption, color: colors.warning, fontStyle: 'italic', marginTop: spacing.xs },
  quote: { ...typography.caption, fontStyle: 'italic', backgroundColor: colors.neutralBg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.xs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillOn: { borderColor: portalAccents.conductor.from, backgroundColor: colors.successBg },
  input: { minHeight: 88, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, color: colors.textPrimary, backgroundColor: palette.white, textAlignVertical: 'top' },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  submit: { minHeight: 46, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
