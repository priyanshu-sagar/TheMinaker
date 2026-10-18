import { useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { OffLocationFlag, PingRecord, useConductorStore } from '@/store/conductor.store';

const STAGES = ['Flagged', 'Gate', 'Parent', 'Verified'] as const;
const FILTERS = ['All', 'Awaiting', 'Replied', 'Escalated'] as const;

function stageIndex(status: OffLocationFlag['status']) {
  if (status === 'Flagged' || status === 'Rejected') return 0;
  if (status === 'GatemanVerifying') return 1;
  if (status === 'ParentConfirming') return 2;
  return 3;
}

function flagLabel(status: OffLocationFlag['status']) {
  if (status === 'GatemanVerifying') return 'With gate';
  if (status === 'ParentConfirming') return 'Asking parent';
  if (status === 'Verified') return 'Verified';
  if (status === 'Rejected') return 'Rejected';
  return 'Flagged';
}

export default function OperationsScreen() {
  const flags = useConductorStore((state) => state.offLocationFlags);
  const pings = useConductorStore((state) => state.pingRecords);
  const students = useConductorStore((state) => state.studentManifest);
  const escalatePing = useConductorStore((state) => state.escalatePing);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [flagsOpen, setFlagsOpen] = useState(false);
  const [pingsOpen, setPingsOpen] = useState(false);
  const [flagQuery, setFlagQuery] = useState('');
  const [pingQuery, setPingQuery] = useState('');
  const [flagId, setFlagId] = useState<string | null>(null);
  const [pingId, setPingId] = useState<string | null>(null);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);

  const visiblePings = useMemo(() => pings.filter((item) => {
    if (filter === 'Awaiting') return item.status === 'Pending';
    if (filter === 'Replied') return item.status === 'Replied';
    if (filter === 'Escalated') return item.status === 'Escalated';
    return true;
  }), [pings, filter]);
  const openFlags = useMemo(() => {
    const needle = flagQuery.trim().toLowerCase();
    return flags.filter((item) => !needle || `${item.studentName} ${item.stopName}`.toLowerCase().includes(needle));
  }, [flags, flagQuery]);
  const openPings = useMemo(() => {
    const needle = pingQuery.trim().toLowerCase();
    return visiblePings.filter((item) => !needle || `${item.studentName} ${item.stopName} ${item.conductorMessage}`.toLowerCase().includes(needle));
  }, [visiblePings, pingQuery]);
  const flag = flags.find((item) => item.id === flagId) ?? null;
  const ping = pings.find((item) => item.id === pingId) ?? null;
  const flagPhone = students.find((item) => item.id === flag?.studentId)?.parentPhone;

  function call(phone?: string) {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => undefined);
  }

  return (
    <MeshBackground>
      <ScrollView bounces={false} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.section}>Off-location flags</Text>
          <AnimatedPressable haptic="selection" onPress={() => setFlagsOpen(true)} hitSlop={8}><Text style={styles.link}>View all ({flags.length})</Text></AnimatedPressable>
        </View>
        {flags.length === 0 ? <Text style={styles.empty}>No students are off their stop.</Text> : flags.slice(0, 2).map((item) => (
          <FlagCard key={item.id} item={item} onOpen={() => setFlagId(item.id)} onCall={() => call(students.find((row) => row.id === item.studentId)?.parentPhone)} />
        ))}

        <View style={styles.head}>
          <Text style={styles.section}>Parent pings</Text>
          <AnimatedPressable haptic="selection" onPress={() => setPingsOpen(true)} hitSlop={8}><Text style={styles.link}>Manage all ({pings.length})</Text></AnimatedPressable>
        </View>
        <View style={styles.filters}>
          {FILTERS.map((item) => (
            <AnimatedPressable key={item} haptic="selection" onPress={() => setFilter(item)} style={[styles.filter, filter === item ? styles.filterOn : null]}>
              <Text style={[styles.filterText, filter === item ? styles.filterTextOn : null]}>{item}</Text>
            </AnimatedPressable>
          ))}
        </View>
        {visiblePings.length === 0 ? <Text style={styles.empty}>Nothing in this filter.</Text> : visiblePings.slice(0, 2).map((item) => (
          <PingCard key={item.id} item={item} onOpen={() => setPingId(item.id)} onCall={() => call(item.parentPhone)} />
        ))}
      </ScrollView>

      <GlassModal visible={flagsOpen} fill scroll={false} maxHeight="90%" title={flag ? flag.studentName : 'Off-location flags'} onBack={flag ? () => setFlagId(null) : () => setFlagsOpen(false)} onClose={() => { setFlagId(null); setFlagsOpen(false); }}>
        {flag ? <FlagDetail flag={flag} onCall={() => call(flagPhone)} /> : (
          <>
            <AppTextInput value={flagQuery} onChangeText={setFlagQuery} placeholder="Search student or stop" placeholderTextColor={colors.textPlaceholder} style={styles.search} />
            <FlatList data={openFlags} keyExtractor={(item) => item.id} bounces={false} style={styles.flex} contentContainerStyle={styles.modalList} ListEmptyComponent={<Text style={styles.empty}>No matching flags.</Text>} renderItem={({ item }) => (
              <FlagCard item={item} onOpen={() => setFlagId(item.id)} onCall={() => call(students.find((row) => row.id === item.studentId)?.parentPhone)} />
            )} />
          </>
        )}
      </GlassModal>

      <GlassModal visible={pingsOpen} fill scroll={false} maxHeight="90%" title={ping ? ping.studentName : 'Parent pings'} onBack={ping ? () => setPingId(null) : () => setPingsOpen(false)} onClose={() => { setPingId(null); setPingsOpen(false); }}>
        {ping ? <PingDetail ping={ping} onCall={() => call(ping.parentPhone)} onEscalate={() => setAsk({ tone: 'override', title: 'Escalate this ping', summary: `${ping.studentName} has not replied. Send it to the gateman?`, confirmLabel: 'Escalate', onConfirm: () => { escalatePing(ping.id); setPingId(null); } })} /> : (
          <>
            <AppTextInput value={pingQuery} onChangeText={setPingQuery} placeholder="Search student or message" placeholderTextColor={colors.textPlaceholder} style={styles.search} />
            <View style={styles.filters}>
              {FILTERS.map((item) => (
                <AnimatedPressable key={item} haptic="selection" onPress={() => setFilter(item)} style={[styles.filter, filter === item ? styles.filterOn : null]}>
                  <Text style={[styles.filterText, filter === item ? styles.filterTextOn : null]}>{item}</Text>
                </AnimatedPressable>
              ))}
            </View>
            <FlatList data={openPings} keyExtractor={(item) => item.id} bounces={false} style={styles.flex} contentContainerStyle={styles.modalList} ListEmptyComponent={<Text style={styles.empty}>No matching pings.</Text>} renderItem={({ item }) => (
              <PingCard item={item} onOpen={() => setPingId(item.id)} onCall={() => call(item.parentPhone)} />
            )} />
          </>
        )}
      </GlassModal>

      <GlassModal visible={flag !== null && !flagsOpen} fill maxHeight="84%" title={flag?.studentName ?? 'Flag'} onClose={() => setFlagId(null)}>
        {flag ? <FlagDetail flag={flag} onCall={() => call(flagPhone)} /> : null}
      </GlassModal>

      <GlassModal visible={ping !== null && !pingsOpen} fill maxHeight="84%" title={ping?.studentName ?? 'Ping'} onClose={() => setPingId(null)}>
        {ping ? <PingDetail ping={ping} onCall={() => call(ping.parentPhone)} onEscalate={() => setAsk({ tone: 'override', title: 'Escalate this ping', summary: `${ping.studentName} has not replied. Send it to the gateman?`, confirmLabel: 'Escalate', onConfirm: () => { escalatePing(ping.id); setPingId(null); } })} /> : null}
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

function FlagCard({ item, onOpen, onCall }: { item: OffLocationFlag; onOpen: () => void; onCall: () => void }) {
  return (
    <View style={styles.card}>
      <AnimatedPressable haptic="selection" onPress={onOpen}>
        <View style={styles.row}>
          <View style={styles.main}>
            <Text style={styles.body} numberOfLines={1}>{item.studentName}</Text>
            <Text style={styles.meta} numberOfLines={2}>{item.stopName} · {item.distanceMeters}m off the stop</Text>
          </View>
          <StatusPill label={flagLabel(item.status)} tone={item.status === 'Verified' ? 'good' : item.status === 'Rejected' ? 'bad' : 'warn'} />
        </View>
        <Pipeline status={item.status} />
        <Text style={styles.note} numberOfLines={2}>{item.gatemanNote ?? 'Waiting on the next check.'}</Text>
      </AnimatedPressable>
      <AnimatedPressable haptic="medium" onPress={onCall} style={styles.call}><Text style={styles.callText}>Call parent</Text></AnimatedPressable>
    </View>
  );
}

function PingCard({ item, onOpen, onCall }: { item: PingRecord; onOpen: () => void; onCall: () => void }) {
  return (
    <View style={styles.card}>
      <AnimatedPressable haptic="selection" onPress={onOpen}>
        <View style={styles.row}>
          <View style={styles.main}>
            <Text style={styles.body} numberOfLines={1}>{item.studentName}</Text>
            <Text style={styles.meta}>{item.stopName} · {new Date(item.sentAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
          </View>
          <StatusPill label={item.status === 'Pending' ? 'Awaiting' : item.status} tone={item.status === 'Replied' ? 'good' : item.status === 'Escalated' ? 'bad' : 'warn'} />
        </View>
        <View style={styles.quote}><Text style={styles.quoteText} numberOfLines={2}>{item.conductorMessage}</Text></View>
        <Text style={styles.meta}>{item.parentReply ? `${item.parentReply}${item.parentReplyNote ? ` — ${item.parentReplyNote}` : ''}` : item.status === 'Escalated' ? 'With the gateman' : 'Waiting for a reply'}</Text>
      </AnimatedPressable>
      <AnimatedPressable haptic="medium" onPress={onCall} style={styles.call}><Text style={styles.callText}>Call parent</Text></AnimatedPressable>
    </View>
  );
}

function FlagDetail({ flag, onCall }: { flag: OffLocationFlag; onCall: () => void }) {
  return (
    <View style={styles.sheet}>
      <Text style={styles.body}>{flag.stopName}</Text>
      <Text style={styles.meta}>{flag.distanceMeters} metres from the scheduled stop</Text>
      <Pipeline status={flag.status} />
      <View style={styles.noteBox}>
        <Text style={styles.note}>{flag.gatemanNote ?? (flag.status === 'Rejected' ? 'The gateman rejected this flag.' : 'Waiting on the next check.')}</Text>
      </View>
      <Text style={styles.meta}>Flagged {new Date(flag.flaggedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}{flag.verifiedAt ? ` · Closed ${new Date(flag.verifiedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : ''}</Text>
      <AnimatedPressable haptic="medium" onPress={onCall} style={styles.call}><Text style={styles.callText}>Call parent</Text></AnimatedPressable>
    </View>
  );
}

function PingDetail({ ping, onCall, onEscalate }: { ping: PingRecord; onCall: () => void; onEscalate: () => void }) {
  return (
    <View style={styles.sheet}>
      <View style={styles.row}>
        <Text style={styles.meta}>{ping.stopName} · {new Date(ping.sentAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
        <StatusPill label={ping.status === 'Pending' ? 'Awaiting' : ping.status} tone={ping.status === 'Replied' ? 'good' : ping.status === 'Escalated' ? 'bad' : 'warn'} />
      </View>
      <View style={styles.quote}><Text style={styles.quoteText}>{ping.conductorMessage}</Text></View>
      <Text style={styles.body}>{ping.parentReply ? `${ping.parentReply}${ping.parentReplyNote ? ` — ${ping.parentReplyNote}` : ''}` : ping.status === 'Escalated' ? 'Escalated to the gateman. They will follow up.' : 'Still waiting for the parent.'}</Text>
      <AnimatedPressable haptic="medium" onPress={onCall} style={styles.call}><Text style={styles.callText}>Call parent</Text></AnimatedPressable>
      {ping.status === 'Pending' ? (
        <AnimatedPressable haptic="medium" onPress={onEscalate} style={styles.secondary}>
          <Text style={styles.secondaryText}>Escalate to gateman</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

function Pipeline({ status }: { status: OffLocationFlag['status'] }) {
  const current = stageIndex(status);
  return (
    <View style={styles.pipeline}>
      {STAGES.map((name, index) => {
        const done = status !== 'Rejected' && index < current;
        const now = index === current;
        return (
          <View key={name} style={styles.step}>
            <View style={styles.stepRail}>
              <View style={[styles.bar, index === 0 ? styles.barHide : null, done || now ? styles.barOn : null]} />
              <View style={[styles.dot, done ? styles.dotDone : now ? (status === 'Rejected' ? styles.dotBad : styles.dotNow) : styles.dotNext]} />
              <View style={[styles.bar, index === STAGES.length - 1 ? styles.barHide : null, done ? styles.barOn : null]} />
            </View>
            <Text style={styles.stepLabel} numberOfLines={1}>{name}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatusPill({ label, tone }: { label: string; tone: 'good' | 'bad' | 'warn' }) {
  return (
    <View style={[styles.pill, tone === 'good' ? styles.goodBg : tone === 'bad' ? styles.badBg : styles.warnBg]}>
      <Text style={[styles.pillText, tone === 'good' ? styles.goodFg : tone === 'bad' ? styles.badFg : styles.warnFg]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 150 },
  modalList: { paddingBottom: spacing.xl },
  sheet: { paddingBottom: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  section: { ...typography.label, flex: 1 },
  link: { ...typography.caption, color: portalAccents.conductor.from, fontWeight: '700' },
  card: { backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  main: { flex: 1, paddingRight: spacing.xs },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 4 },
  empty: { ...typography.body, color: colors.textMuted, marginBottom: spacing.sm },
  pill: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
  pillText: { ...typography.caption, fontWeight: '700' },
  goodBg: { backgroundColor: colors.successBg },
  goodFg: { color: colors.success },
  badBg: { backgroundColor: colors.errorBg },
  badFg: { color: colors.error },
  warnBg: { backgroundColor: colors.warningBg },
  warnFg: { color: colors.warning },
  pipeline: { flexDirection: 'row', marginTop: spacing.md },
  step: { flex: 1, alignItems: 'center' },
  stepRail: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  bar: { flex: 1, height: 2, backgroundColor: colors.borderStrong },
  barOn: { backgroundColor: colors.success },
  barHide: { backgroundColor: 'transparent' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotDone: { backgroundColor: colors.success },
  dotNow: { backgroundColor: colors.warning },
  dotBad: { backgroundColor: colors.error },
  dotNext: { backgroundColor: colors.borderStrong },
  stepLabel: { ...typography.caption, marginTop: 4, textAlign: 'center' },
  note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  noteBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.neutralBg },
  quote: { marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.neutralBg },
  quoteText: { ...typography.caption, color: colors.textPrimary },
  call: { marginTop: spacing.sm, minHeight: 36, borderRadius: radius.full, borderWidth: 1, borderColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  callText: { ...typography.caption, color: portalAccents.conductor.from, fontWeight: '700' },
  secondary: { marginTop: spacing.sm, minHeight: 40, borderRadius: radius.full, backgroundColor: colors.warningBg, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...typography.bodyBold, color: colors.warning },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  filter: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  filterOn: { borderColor: portalAccents.conductor.from, backgroundColor: colors.successBg },
  filterText: { ...typography.caption, color: colors.textPrimary },
  filterTextOn: { color: portalAccents.conductor.from, fontWeight: '700' },
  search: { minHeight: 40, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.textPrimary, backgroundColor: palette.white, marginBottom: spacing.sm },
});
