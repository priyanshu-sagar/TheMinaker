import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { CheckBox, SearchField, SHEET, SlideToConfirm } from '@/components/gateman/sheets';
import { ConfirmRequest, GlassConfirmModal } from '@/components/gateman/GlassConfirmModal';
import { StudentDossier } from '@/components/gateman/StudentDossier';
import { ApprovalsPanel } from './approvals';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

type Segment = 'gate' | 'approvals';
type Filter = 'All' | 'Pending Verification' | 'Early Pickup' | 'Self Drop-Off' | 'Bus Arrival' | 'Walk-In';

type GateRow = {
  id: string;
  source: 'pickup' | 'entry';
  studentId: string;
  name: string;
  grade: string;
  detail: string;
  kind: string;
  status: 'PENDING' | 'VERIFIED' | 'DENIED' | 'ARRIVAL' | 'EXIT';
  time: string;
  pending: boolean;
  phone?: string;
};

const FILTERS: Filter[] = ['All', 'Pending Verification', 'Early Pickup', 'Self Drop-Off', 'Bus Arrival', 'Walk-In'];
const NOTES = ['ID checked', 'Vehicle noted', 'Escorted in', 'No concern'];
const DENY_REASONS = ['Guardian mismatch', 'No prior request', 'Safety concern'];

function formatWhen(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff >= 0 && diff < 60 * 60000) return `${Math.max(1, Math.round(diff / 60000))}m ago`;
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function statusTone(status: GateRow['status']) {
  if (status === 'DENIED') return styles.bad;
  if (status === 'PENDING') return styles.wait;
  return styles.good;
}

export default function GateAccessScreen() {
  const pickups = useGatemanStore((state) => state.earlyPickups);
  const entries = useGatemanStore((state) => state.gateEntries);
  const students = useGatemanStore((state) => state.students);
  const verifyMultiplePickups = useGatemanStore((state) => state.verifyMultiplePickups);
  const denyMultiplePickups = useGatemanStore((state) => state.denyMultiplePickups);
  const pingParentForHomeConfirmation = useGatemanStore((state) => state.pingParentForHomeConfirmation);
  const [segment, setSegment] = useState<Segment>('gate');
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const [homePing, setHomePing] = useState<string | null>(null);

  const studentMap = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

  const rows = useMemo<GateRow[]>(() => {
    const pickupRows: GateRow[] = pickups.map((item) => {
      const student = studentMap.get(item.studentId);
      const kind = item.kind === 'Self Drop-off' ? 'Self Drop-Off' : 'Early Pickup';
      return {
        id: item.id,
        source: 'pickup',
        studentId: item.studentId,
        name: item.studentName,
        grade: item.grade || student?.grade || '',
        detail: `${kind} by ${item.parentName}`,
        kind,
        status: item.status === 'Pending' ? 'PENDING' : item.status === 'Verified' ? 'VERIFIED' : 'DENIED',
        time: item.requestedAt,
        pending: item.status === 'Pending',
        phone: item.parentPhone,
      };
    });
    const entryRows: GateRow[] = entries.map((item) => {
      const student = studentMap.get(item.studentId);
      const kind = item.method === 'Bus' ? 'Bus Arrival' : item.method === 'Self' ? 'Self Drop-Off' : 'Walk-In';
      return {
        id: item.id,
        source: 'entry',
        studentId: item.studentId,
        name: item.studentName,
        grade: student?.grade ?? '',
        detail: item.method === 'Bus' ? `Bus ${item.busNumber ?? 'unassigned'}` : `${item.method}${item.authorizedBy ? ` · ${item.authorizedBy}` : ''}`,
        kind,
        status: item.type === 'Arrival' ? 'ARRIVAL' : 'EXIT',
        time: item.time,
        pending: false,
        phone: student?.parentPhone,
      };
    });
    return [...pickupRows, ...entryRows].sort((a, b) => b.time.localeCompare(a.time));
  }, [pickups, entries, studentMap]);

  const counts = useMemo(() => ({
    All: rows.length,
    'Pending Verification': rows.filter((item) => item.pending).length,
    'Early Pickup': rows.filter((item) => item.kind === 'Early Pickup').length,
    'Self Drop-Off': rows.filter((item) => item.kind === 'Self Drop-Off').length,
    'Bus Arrival': rows.filter((item) => item.kind === 'Bus Arrival').length,
    'Walk-In': rows.filter((item) => item.kind === 'Walk-In').length,
  }), [rows]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((item) => {
      if (filter === 'Pending Verification' && !item.pending) return false;
      if (filter !== 'All' && filter !== 'Pending Verification' && item.kind !== filter) return false;
      return !needle || `${item.name} ${item.grade} ${item.detail}`.toLowerCase().includes(needle);
    });
  }, [rows, filter, query]);

  const pendingIds = useMemo(() => visible.filter((item) => item.pending).map((item) => item.id), [visible]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const open = rows.find((item) => `${item.source}-${item.id}` === openId);
  const entered = entries.filter((item) => item.type === 'Arrival').length;
  const earlyPending = pickups.filter((item) => item.kind === 'Early Pickup' && item.status === 'Pending').length;
  const earlyDone = pickups.filter((item) => item.kind === 'Early Pickup' && item.status === 'Verified').length;
  const selfCount = rows.filter((item) => item.kind === 'Self Drop-Off').length;
  const waiting = pickups.filter((item) => item.status === 'Pending').length;

  const toggleSelect = useCallback((id: string) => {
    setSelected((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }, []);

  const openDossier = useCallback((key: string) => {
    setNote(null);
    setOpenId(key);
  }, []);

  const callPhone = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => undefined);
  }, []);

  const askVerify = useCallback((ids: string[], summary: string) => {
    if (ids.length === 0) return;
    setAsk({
      tone: 'approve',
      title: ids.length > 1 ? 'Verify selected' : 'Verify at gate',
      summary,
      confirmLabel: ids.length > 1 ? `Confirm verify (${ids.length})` : 'Confirm verify',
      onConfirm: () => {
        verifyMultiplePickups(ids);
        setSelected((current) => current.filter((id) => !ids.includes(id)));
        setOpenId(null);
      },
    });
  }, [verifyMultiplePickups]);

  const askDeny = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setAsk({
      tone: 'reject',
      title: 'Deny selected',
      summary: `${ids.length} gate ${ids.length === 1 ? 'request' : 'requests'} will be denied.`,
      confirmLabel: `Confirm deny (${ids.length})`,
      reasons: DENY_REASONS,
      onConfirm: () => {
        denyMultiplePickups(ids);
        setSelected((current) => current.filter((id) => !ids.includes(id)));
      },
    });
  }, [denyMultiplePickups]);

  const renderRow = useCallback(({ item }: { item: GateRow }) => (
    <GateAccessRow
      item={item}
      selected={selectedSet.has(item.id)}
      onToggle={toggleSelect}
      onVerify={askVerify}
      onCall={callPhone}
      onOpen={openDossier}
    />
  ), [selectedSet, toggleSelect, askVerify, callPhone, openDossier]);

  return (
    <MeshBackground>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Gate & Approvals</Text>
          <NotificationBell />
        </View>
        <View style={styles.switcher}>
          {(['gate', 'approvals'] as const).map((item) => (
            <AnimatedPressable key={item} haptic="selection" onPress={() => setSegment(item)} style={[styles.switch, segment === item ? styles.switchOn : null]}>
              <Text style={[styles.switchText, segment === item ? styles.switchTextOn : null]}>{item === 'gate' ? 'Gate access' : 'Parent approvals'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        {segment === 'approvals' ? <ApprovalsPanel /> : (
          <View style={styles.flex}>
            <FlatList
              data={visible}
              keyExtractor={(item) => `${item.source}-${item.id}-${item.studentId}`}
              renderItem={renderRow}
              extraData={selectedSet}
              bounces={false}
              overScrollMode="never"
              removeClippedSubviews
              maxToRenderPerBatch={10}
              windowSize={7}
              initialNumToRender={12}
              contentContainerStyle={[styles.list, selected.length > 0 ? styles.listWithDock : null]}
              ListHeaderComponent={
                <View>
                  <View style={styles.kpis}>
                    <Kpi label="Entered" value={String(entered)} />
                    <Kpi label="Early pickup" value={`${earlyPending} / ${earlyDone}`} />
                    <Kpi label="Self drop" value={String(selfCount)} />
                    <Kpi label="Waiting" value={String(waiting)} amber />
                  </View>
                  <View>
                    <SearchField value={query} onChangeText={setQuery} placeholder="Search student, class, bus, or guardian" />
                    {query.length > 0 ? (
                      <AnimatedPressable haptic="selection" onPress={() => setQuery('')} style={styles.clear}>
                        <Text style={styles.clearText}>Clear</Text>
                      </AnimatedPressable>
                    ) : null}
                  </View>
                  <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
                    {FILTERS.map((item) => (
                      <AnimatedPressable key={item} haptic="selection" onPress={() => setFilter(item)} style={[styles.pill, filter === item ? styles.pillOn : null]}>
                        <Text style={[styles.pillText, filter === item ? styles.pillTextOn : null]}>{item} {counts[item]}</Text>
                      </AnimatedPressable>
                    ))}
                  </ScrollView>
                  {selected.length === 0 ? (
                    <AnimatedPressable haptic="selection" onPress={() => setSelected(pendingIds)}>
                      <Text style={styles.link}>Select all pending ({pendingIds.length})</Text>
                    </AnimatedPressable>
                  ) : null}
                </View>
              }
            />
            {selected.length > 0 ? (
              <View style={styles.dockWrap}>
                <BlurView intensity={80} tint="light" style={styles.dock}>
                  <View style={styles.dockCopy}>
                    <Text style={styles.body}>{selected.length} selected</Text>
                    <AnimatedPressable haptic="selection" onPress={() => setSelected([])}><Text style={styles.link}>Deselect all</Text></AnimatedPressable>
                  </View>
                  <AnimatedPressable haptic="medium" onPress={() => askVerify(selected, `${selected.length} students will be cleared at the gate.`)} style={styles.approve}><Text style={styles.white}>Verify ({selected.length})</Text></AnimatedPressable>
                  <AnimatedPressable haptic="medium" onPress={() => askDeny(selected)} style={styles.reject}><Text style={styles.white}>Deny ({selected.length})</Text></AnimatedPressable>
                </BlurView>
              </View>
            ) : null}
          </View>
        )}
      </SafeAreaView>
      <GlassModal visible={open !== undefined && segment === 'gate'} fill maxHeight={SHEET} title="Gate record" onClose={() => setOpenId(null)}>
        {open ? (
          <StudentDossier studentId={open.studentId} statusLabel={`${open.kind} · ${open.status}`} time={open.time} footer={
            open.pending ? <SlideToConfirm label="Slide to verify" onConfirm={() => askVerify([open.id], `${open.name} · ${open.detail}`)} /> : (
              <Text style={styles.meta}>Logged at the main front gate{note ? ` · ${note}` : ''}</Text>
            )
          }>
            <View style={styles.panel}>
              <Text style={styles.kicker}>Gate handover</Text>
              <Text style={styles.body}>Duty officer on the record</Text>
              <Text style={styles.meta}>Main front gate · {open.detail}</Text>
              <Text style={styles.meta}>{formatWhen(open.time)} · {open.kind}</Text>
              <AnimatedPressable haptic="light" onPress={() => setAsk({ tone: 'info', title: 'Ping parent for home confirmation', summary: `Ask ${open.name}'s parent to confirm the child has arrived home safely?`, confirmLabel: 'Send ping', onConfirm: () => { pingParentForHomeConfirmation(open.studentId, open.name); setHomePing('Ping sent to the parent'); } })}>
                <Text style={styles.link}>Ping parent to confirm the child is home</Text>
              </AnimatedPressable>
              {homePing ? <Text style={styles.meta}>{homePing}</Text> : null}
              <Text style={styles.kicker}>Security note</Text>
              <View style={styles.noteRow}>
                {NOTES.map((item) => (
                  <AnimatedPressable key={item} haptic="selection" onPress={() => setNote(item)} style={[styles.pill, note === item ? styles.pillOn : null]}>
                    <Text style={[styles.pillText, note === item ? styles.pillTextOn : null]}>{item}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          </StudentDossier>
        ) : null}
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const GateAccessRow = memo(function GateAccessRow({
  item,
  selected,
  onToggle,
  onVerify,
  onCall,
  onOpen,
}: {
  item: GateRow;
  selected: boolean;
  onToggle: (id: string) => void;
  onVerify: (ids: string[], summary: string) => void;
  onCall: (phone: string) => void;
  onOpen: (key: string) => void;
}) {
  return (
    <View style={styles.card}>
      {item.pending ? <CheckBox on={selected} onPress={() => onToggle(item.id)} /> : null}
      <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.slice(0, 1)}</Text></View>
      <View style={styles.main}>
        <Text style={styles.body}>{item.name}{item.grade ? ` · ${item.grade}` : ''}</Text>
        <Text style={styles.meta}>{item.detail}</Text>
      </View>
      <View style={styles.side}>
        <Text style={[styles.status, statusTone(item.status)]}>{item.kind} · {item.status}</Text>
        <Text style={styles.meta}>{formatWhen(item.time)}</Text>
        <View style={styles.actions}>
          {item.pending ? (
            <AnimatedPressable haptic="medium" onPress={() => onVerify([item.id], `${item.name} · ${item.detail}`)} style={styles.verify}>
              <Text style={styles.white}>Verify</Text>
            </AnimatedPressable>
          ) : null}
          {item.phone ? (
            <AnimatedPressable haptic="medium" onPress={() => onCall(item.phone!)} style={styles.call}>
              <Text style={styles.callText}>Call</Text>
            </AnimatedPressable>
          ) : null}
          <AnimatedPressable haptic="selection" onPress={() => onOpen(`${item.source}-${item.id}`)}>
            <Text style={styles.link}>View more</Text>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}, (prev, next) => prev.selected === next.selected && prev.item.id === next.item.id && prev.item.status === next.item.status && prev.item.pending === next.item.pending && prev.item.detail === next.item.detail && prev.item.time === next.item.time && prev.onToggle === next.onToggle && prev.onVerify === next.onVerify && prev.onCall === next.onCall && prev.onOpen === next.onOpen);

function Kpi({ label, value, amber }: { label: string; value: string; amber?: boolean }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, amber ? styles.amber : null]}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.heading },
  switcher: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  switch: { flex: 1, minHeight: 36, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)' },
  switchOn: { borderColor: portalAccents.gateman.from, backgroundColor: '#FFF7ED' },
  switchText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  switchTextOn: { color: portalAccents.gateman.from },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 160 },
  listWithDock: { paddingBottom: 230 },
  kpis: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  kpi: { flex: 1, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.xs },
  kpiValue: { ...typography.bodyBold },
  amber: { color: '#EA580C' },
  clear: { position: 'absolute', right: spacing.sm, top: 10 },
  clearText: { ...typography.caption, color: portalAccents.gateman.from, fontWeight: '700' },
  pills: { gap: spacing.xs, paddingBottom: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(255,255,255,0.84)', paddingHorizontal: spacing.sm, minHeight: 32, justifyContent: 'center' },
  pillOn: { borderColor: portalAccents.gateman.from, backgroundColor: '#FFF7ED' },
  pillText: { ...typography.caption, color: colors.textPrimary },
  pillTextOn: { color: portalAccents.gateman.from, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: portalAccents.gateman.from },
  main: { flex: 1 },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  side: { alignItems: 'flex-end', maxWidth: '48%' },
  status: { ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, fontWeight: '700', textAlign: 'right' },
  good: { backgroundColor: '#ECFDF5', color: '#059669' },
  wait: { backgroundColor: '#FFF7ED', color: '#EA580C' },
  bad: { backgroundColor: '#FEF2F2', color: '#DC2626' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
  verify: { backgroundColor: '#059669', borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 28, justifyContent: 'center' },
  call: { borderRadius: radius.full, borderWidth: 1, borderColor: portalAccents.gateman.from, paddingHorizontal: spacing.sm, minHeight: 28, justifyContent: 'center' },
  callText: { ...typography.caption, color: portalAccents.gateman.from, fontWeight: '700' },
  white: { ...typography.caption, color: palette.white, fontWeight: '700' },
  link: { ...typography.caption, color: portalAccents.gateman.from, fontWeight: '700' },
  dockWrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 88 },
  dock: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.sm, backgroundColor: 'rgba(248,250,252,0.94)' },
  dockCopy: { flex: 1 },
  approve: { backgroundColor: '#059669', borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 36, justifyContent: 'center' },
  reject: { backgroundColor: '#DC2626', borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 36, justifyContent: 'center' },
  panel: { backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  kicker: { ...typography.overline, marginTop: spacing.sm },
  noteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
});
