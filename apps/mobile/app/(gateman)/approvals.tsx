import { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { CheckBox, SearchField, SHEET } from '@/components/gateman/sheets';
import { ConfirmRequest, GlassConfirmModal } from '@/components/gateman/GlassConfirmModal';
import { StudentDossier } from '@/components/gateman/StudentDossier';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'All' | 'Pending' | 'Stop Change' | 'Bus Transfer' | 'Resolved';
const REJECT_REASONS = ['Stop is too far', 'Bus is full', 'Incomplete details', 'Safety concern'];

function toneFor(status: string) {
  if (status === 'Rejected') return { backgroundColor: '#FEF2F2', color: '#DC2626' };
  if (status === 'Approved') return { backgroundColor: '#ECFDF5', color: '#059669' };
  return { backgroundColor: '#FFF7ED', color: '#EA580C' };
}

export function ApprovalsPanel() {
  const requests = useGatemanStore((state) => state.routingRequests);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);
  const reopenRequest = useGatemanStore((state) => state.reopenRequest);
  const [filter, setFilter] = useState<Filter>('Pending');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);

  const pending = requests.filter((item) => item.status === 'Pending');
  const rows = useMemo(() => requests.filter((item) => {
    if (filter === 'Pending' && item.status !== 'Pending') return false;
    if (filter === 'Resolved' && item.status === 'Pending') return false;
    if (filter === 'Stop Change' && item.requestType !== 'Stop Change') return false;
    if (filter === 'Bus Transfer' && item.requestType !== 'Bus Transfer') return false;
    const needle = query.trim().toLowerCase();
    return !needle || `${item.studentName} ${item.grade} ${item.oldStop ?? ''} ${item.newStop ?? ''} ${item.fromBusNumber ?? ''} ${item.toBusNumber ?? ''}`.toLowerCase().includes(needle);
  }), [requests, filter, query]);
  const request = requests.find((item) => item.id === openId);
  const routeLine = (item: NonNullable<typeof request>) => item.requestType === 'Stop Change' ? `${item.oldStop} → ${item.newStop}` : `${item.fromBusNumber} → ${item.toBusNumber}`;

  function togglePending() {
    const ids = pending.map((item) => item.id);
    setSelected(selected.length === ids.length ? [] : ids);
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.kpis}>
              <Kpi label="Pending" value={pending.length} />
              <Kpi label="Stop changes" value={pending.filter((item) => item.requestType === 'Stop Change').length} />
              <Kpi label="Transfers" value={pending.filter((item) => item.requestType === 'Bus Transfer').length} />
            </View>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search student, stop, or bus" />
            <View style={styles.pills}>
              {(['All', 'Pending', 'Stop Change', 'Bus Transfer', 'Resolved'] as const).map((item) => (
                <AnimatedPressable key={item} haptic="selection" onPress={() => setFilter(item)} style={[styles.pill, filter === item ? styles.pillOn : null]}>
                  <Text style={styles.pillText}>{item}</Text>
                </AnimatedPressable>
              ))}
            </View>
            {selected.length === 0 ? (
              <AnimatedPressable haptic="selection" onPress={togglePending}>
                <Text style={styles.link}>Select all pending ({pending.length})</Text>
              </AnimatedPressable>
            ) : (
              <View style={styles.bulk}>
                <View style={styles.main}>
                  <Text style={styles.body}>{selected.length} selected</Text>
                  <AnimatedPressable haptic="selection" onPress={togglePending}><Text style={styles.link}>{selected.length === pending.length ? 'Deselect all' : 'Select all'}</Text></AnimatedPressable>
                </View>
                <AnimatedPressable haptic="medium" onPress={() => setAsk({
                  tone: 'approve',
                  title: 'Approve selected',
                  summary: `${selected.length} parent requests will update the student records.`,
                  confirmLabel: `Confirm approve (${selected.length})`,
                  onConfirm: () => { selected.forEach((id) => approveRequest(id)); setSelected([]); },
                })} style={styles.approve}>
                  <Text style={styles.white}>Approve ({selected.length})</Text>
                </AnimatedPressable>
                <AnimatedPressable haptic="medium" onPress={() => setAsk({
                  tone: 'reject',
                  title: 'Reject selected',
                  summary: `${selected.length} requests will be declined.`,
                  confirmLabel: `Confirm reject (${selected.length})`,
                  reasons: REJECT_REASONS,
                  onConfirm: (reason) => { selected.forEach((id) => rejectRequest(id, reason)); setSelected([]); },
                })} style={styles.reject}>
                  <Text style={styles.white}>Reject ({selected.length})</Text>
                </AnimatedPressable>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.status === 'Pending' ? (
              <CheckBox on={selected.includes(item.id)} onPress={() => setSelected((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])} />
            ) : <View style={styles.spacer} />}
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.studentName.slice(0, 1)}</Text></View>
            <View style={styles.main}>
              <Text style={styles.body}>{item.studentName} · {item.grade}</Text>
              <Text style={styles.type}>{item.requestType}</Text>
              <Text style={styles.meta}>{routeLine(item)}</Text>
              <Text style={styles.meta}>{new Date(item.submittedAt).toLocaleString()}</Text>
            </View>
            <View style={styles.side}>
              <Text style={[styles.status, toneFor(item.status)]}>{item.status}</Text>
              {item.status === 'Pending' ? (
                <View style={styles.iconRow}>
                  <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'approve', title: 'Approve request', summary: `${item.studentName}: ${routeLine(item)}`, confirmLabel: 'Confirm approve', onConfirm: () => approveRequest(item.id) })} style={styles.yes}><Text style={styles.yesText}>✓</Text></AnimatedPressable>
                  <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'reject', title: 'Reject request', summary: `${item.studentName}: ${routeLine(item)}`, confirmLabel: 'Confirm reject', reasons: REJECT_REASONS, onConfirm: (reason) => rejectRequest(item.id, reason) })} style={styles.no}><Text style={styles.noText}>✕</Text></AnimatedPressable>
                </View>
              ) : null}
              <AnimatedPressable haptic="selection" onPress={() => setOpenId(item.id)}><Text style={styles.link}>View more</Text></AnimatedPressable>
            </View>
          </View>
        )}
      />
      <GlassModal visible={openId !== null} fill maxHeight={SHEET} title={request?.requestType ?? 'Request'} onClose={() => setOpenId(null)}>
        {request ? (
          <StudentDossier studentId={request.studentId} statusLabel={request.status} time={request.submittedAt} footer={
            request.status === 'Pending' ? (
              <View style={styles.iconRow}>
                <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'reject', title: 'Reject request', summary: `${request.studentName}: ${routeLine(request)}`, confirmLabel: 'Confirm reject', reasons: REJECT_REASONS, onConfirm: (reason) => { rejectRequest(request.id, reason); setOpenId(null); } })} style={styles.rejectWide}><Text style={styles.white}>Reject</Text></AnimatedPressable>
                <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'approve', title: 'Approve request', summary: `${request.studentName}: ${routeLine(request)}`, confirmLabel: 'Confirm approve', onConfirm: () => { approveRequest(request.id); setOpenId(null); } })} style={styles.approveWide}><Text style={styles.white}>Approve</Text></AnimatedPressable>
              </View>
            ) : (
              <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'override', title: 'Change decision', summary: `${request.studentName} will return to pending${request.status === 'Approved' ? ' and the previous stop or bus will be restored' : ''}.`, confirmLabel: 'Reopen request', onConfirm: () => { reopenRequest(request.id); setOpenId(null); } })} style={styles.ghost}>
                <Text style={styles.body}>Change decision</Text>
              </AnimatedPressable>
            )
          }>
            <View style={styles.compare}>
              <Text style={styles.kicker}>Before</Text>
              <Text style={styles.body}>{request.requestType === 'Stop Change' ? request.oldStop : request.fromBusNumber}</Text>
              <Text style={styles.kicker}>Requested</Text>
              <Text style={styles.body}>{request.requestType === 'Stop Change' ? request.newStop : request.toBusNumber}</Text>
              <Text style={styles.meta}>{request.reason}</Text>
              <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${request.parentPhone}`)}><Text style={styles.link}>{request.parentName} · {request.parentPhone}</Text></AnimatedPressable>
            </View>
            {request.requestType === 'Stop Change' && request.oldCoords && request.newCoords ? (
              <View style={styles.map}>
                <MapView style={styles.mapFill} provider={undefined} pointerEvents="none" region={{ latitude: (request.oldCoords.lat + request.newCoords.lat) / 2, longitude: (request.oldCoords.lng + request.newCoords.lng) / 2, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
                  <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                  <Marker coordinate={{ latitude: request.oldCoords.lat, longitude: request.oldCoords.lng }} pinColor="#DC2626" title="Current stop" />
                  <Marker coordinate={{ latitude: request.newCoords.lat, longitude: request.newCoords.lng }} pinColor="#059669" title="Requested stop" />
                </MapView>
              </View>
            ) : null}
          </StudentDossier>
        ) : null}
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <View style={styles.kpi}><Text style={styles.kpiValue}>{value}</Text><Text style={styles.meta}>{label}</Text></View>;
}

export default function ApprovalsScreen() {
  return (
    <MeshBackground>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Approvals</Text>
          <NotificationBell />
        </View>
        <ApprovalsPanel />
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.heading },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 150 },
  kpis: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  kpi: { flex: 1, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.sm },
  kpiValue: { ...typography.heading },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillOn: { borderColor: portalAccents.gateman.from, backgroundColor: '#FFF7ED' },
  pillText: { ...typography.caption, color: colors.textPrimary },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  spacer: { width: 24 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: portalAccents.gateman.from },
  main: { flex: 1 },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  type: { ...typography.caption, color: portalAccents.gateman.from, marginTop: 2 },
  side: { alignItems: 'flex-end', gap: 4 },
  status: { ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, fontWeight: '700' },
  iconRow: { flexDirection: 'row', gap: spacing.xs },
  yes: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  yesText: { color: '#059669', fontWeight: '700', backgroundColor: 'transparent' },
  no: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  noText: { color: '#DC2626', fontWeight: '700', backgroundColor: 'transparent' },
  link: { ...typography.caption, color: portalAccents.gateman.from, fontWeight: '700' },
  bulk: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong },
  approve: { backgroundColor: '#059669', borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 36, justifyContent: 'center' },
  reject: { backgroundColor: '#DC2626', borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 36, justifyContent: 'center' },
  approveWide: { flex: 1, minHeight: 48, borderRadius: radius.full, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
  rejectWide: { flex: 1, minHeight: 48, borderRadius: radius.full, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  white: { ...typography.caption, color: palette.white, fontWeight: '700' },
  ghost: { minHeight: 48, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  compare: { backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  kicker: { ...typography.overline, marginTop: spacing.xs },
  map: { height: 180, borderRadius: radius.lg, overflow: 'hidden' },
  mapFill: { flex: 1 },
});
