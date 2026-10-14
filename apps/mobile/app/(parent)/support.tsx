import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Bus, Phone, School, UserRound } from 'lucide-react-native';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { ConfirmModal, ExceptionDetailsModal } from '@/components/parent/ConfirmModal';
import { ParentChrome } from '@/components/parent/ParentChrome';
import { ParentToast } from '@/components/parent/ParentToast';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { ExceptionKind, useActiveChild, useParentStore } from '@/store/parent.store';

type Prompt = { kind: ExceptionKind; turningOn: boolean } | null;

const COPY: Record<ExceptionKind, { on: string; off: string; toastOn: string; toastOff: string }> = {
  selfDropOff: {
    on: 'Skip the morning bus? The gateman and conductor will expect you to drop them at school.',
    off: 'Resume the morning bus for today?',
    toastOn: 'Morning bus skipped.',
    toastOff: 'Morning bus is back on.',
  },
  earlyPickup: {
    on: 'Skip the afternoon bus? The gateman can let you in for an early pick-up.',
    off: 'Resume the afternoon bus for today?',
    toastOn: 'Afternoon bus skipped.',
    toastOff: 'Afternoon bus is back on.',
  },
  absent: {
    on: 'Keep them off both runs today?',
    off: 'Resume bus service for today?',
    toastOn: 'Marked absent for today.',
    toastOff: 'They are back on the route.',
  },
  reminder: {
    on: 'Turn on the 10-minute arrival note?',
    off: 'If this is off, you may miss the bus at the stop. Turn the reminder off anyway?',
    toastOn: 'Arrival reminder is on.',
    toastOff: 'Arrival reminder is off.',
  },
};

export default function ParentSupportScreen() {
  const child = useActiveChild();
  const transit = useParentStore((state) => state.liveTransit);
  const setAbsentToday = useParentStore((state) => state.setAbsentToday);
  const setSelfDropOff = useParentStore((state) => state.setSelfDropOff);
  const setEarlyPickup = useParentStore((state) => state.setEarlyPickup);
  const setArrivalReminder = useParentStore((state) => state.setArrivalReminder);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [details, setDetails] = useState<ExceptionKind | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function active(kind: ExceptionKind) {
    if (!child) return false;
    if (kind === 'selfDropOff') return child.selfDropOff;
    if (kind === 'earlyPickup') return child.earlyPickup;
    if (kind === 'absent') return child.absentToday;
    return child.arrivalReminder;
  }

  function apply(next: Prompt) {
    if (!child || !next) return;
    const on = next.turningOn;
    if (next.kind === 'selfDropOff') setSelfDropOff(child.id, on);
    if (next.kind === 'earlyPickup') setEarlyPickup(child.id, on);
    if (next.kind === 'absent') setAbsentToday(child.id, on);
    if (next.kind === 'reminder') setArrivalReminder(child.id, on);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setToast(on ? COPY[next.kind].toastOn : COPY[next.kind].toastOff);
    setPrompt(null);
  }

  async function call(phone: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (phone) await Linking.openURL(`tel:${phone}`).catch(() => undefined);
  }

  const cards: Array<{ kind: ExceptionKind; label: string; hint: string }> = [
    { kind: 'selfDropOff', label: 'Dropping off at school myself', hint: 'Morning bus' },
    { kind: 'earlyPickup', label: 'Picking up early today', hint: 'Afternoon bus' },
    { kind: 'absent', label: 'Not taking the bus today', hint: 'Both runs' },
    { kind: 'reminder', label: 'Remind me before the stop', hint: '10 minutes out' },
  ];

  const contacts = [
    { title: 'Conductor', name: transit.conductorName, phone: transit.conductorPhone, icon: Bus },
    { title: 'Gateman', name: transit.gatemanName, phone: transit.gatemanPhone, icon: School },
    { title: 'School Reception', name: 'Front desk', phone: transit.officePhone, icon: UserRound },
  ];

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ParentChrome />
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={styles.section}>Today's exceptions</Text>
          {cards.map((card) => {
            const on = active(card.kind);
            return (
              <GlassCard key={card.kind} style={[styles.card, on ? styles.cardOn : null, shadows.md]}>
                <View style={styles.cardRow}>
                  <View style={styles.cardCopy}>
                    <Text style={styles.name} numberOfLines={1}>{card.label}</Text>
                    <Text style={styles.hint}>{on ? 'On' : card.hint}</Text>
                    {card.kind === 'reminder' ? null : (
                      <AnimatedPressable haptic="light" onPress={() => setDetails(card.kind)}>
                        <Text style={styles.detailsText}>View details</Text>
                      </AnimatedPressable>
                    )}
                  </View>
                  <AnimatedPressable
                    haptic="selection"
                    onPress={() => setPrompt({ kind: card.kind, turningOn: !on })}
                    style={[styles.switch, on ? styles.switchOn : null]}
                  >
                    <View style={[styles.knob, on ? styles.knobOn : null]} />
                  </AnimatedPressable>
                </View>
              </GlassCard>
            );
          })}
          <Text style={styles.section}>Call the route</Text>
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <GlassCard key={contact.title} style={styles.card}>
                <Icon color={portalAccents.parent.from} size={18} />
                <Text style={styles.kicker}>{contact.title}</Text>
                <Text style={styles.name}>{contact.name}</Text>
                <AnimatedPressable haptic="medium" onPress={() => call(contact.phone)} style={styles.call}>
                  <Phone color={palette.white} size={16} />
                  <Text style={styles.callText}>Call</Text>
                </AnimatedPressable>
              </GlassCard>
            );
          })}
        </ScrollView>
        <ParentToast message={toast} onDone={() => setToast(null)} />
      </SafeAreaView>
      <ConfirmModal
        visible={prompt !== null}
        title={prompt?.turningOn ? 'Confirm' : 'Undo'}
        body={prompt ? (prompt.turningOn ? COPY[prompt.kind].on : COPY[prompt.kind].off) : ''}
        confirmLabel={prompt?.turningOn ? 'Yes, update today' : 'Yes, resume'}
        onClose={() => setPrompt(null)}
        onConfirm={() => apply(prompt)}
      />
      <ExceptionDetailsModal visible={details !== null} kind={details} childId={child?.id ?? ''} onClose={() => setDetails(null)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: 140 },
  section: { ...typography.overline, marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { marginBottom: spacing.sm },
  cardOn: { borderWidth: 1.5, borderColor: portalAccents.parent.from },
  name: { ...typography.bodyBold },
  hint: { ...typography.caption, marginTop: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardCopy: { flex: 1, paddingRight: spacing.sm },
  switch: { width: 42, height: 24, borderRadius: 12, backgroundColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: 2 },
  switchOn: { backgroundColor: portalAccents.parent.from },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.white },
  knobOn: { alignSelf: 'flex-end' },
  detailsText: { ...typography.caption, color: portalAccents.parent.from },
  kicker: { ...typography.overline, color: portalAccents.parent.from, marginTop: spacing.xs },
  call: { marginTop: spacing.md, minHeight: 42, borderRadius: radius.md, backgroundColor: portalAccents.parent.from, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  callText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
