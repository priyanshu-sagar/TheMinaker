import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { RoutingRequest, useGatemanStore } from '@/store/gateman.store';

export default function RequestsScreen() {
  const requests = useGatemanStore((state) => state.routingRequests);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);
  const [tab, setTab] = useState<'Stop Change' | 'Bus Transfer'>('Stop Change');
  const [pending, setPending] = useState<{ id: string; approve: boolean } | null>(null);
  const rows = requests.filter((item) => item.requestType === tab && item.status === 'Pending');

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Parent requests</Text>
          <NotificationBell />
        </View>
        <View style={styles.tabs}>
          {(['Stop Change', 'Bus Transfer'] as const).map((item) => (
            <AnimatedPressable key={item} haptic="selection" onPress={() => setTab(item)} style={[styles.tab, tab === item ? styles.tabOn : null]}>
              <Text style={styles.tabText}>{item === 'Stop Change' ? 'Stops' : 'Bus transfers'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={styles.list}>
          {rows.length === 0 ? <Text style={styles.meta}>No pending {tab.toLowerCase()} requests.</Text> : null}
          {rows.map((item) => (
            <RequestCard key={item.id} request={item} onDecide={(approve) => setPending({ id: item.id, approve })} />
          ))}
        </ScrollView>
      </SafeAreaView>
      <GlassModal visible={pending !== null} title="Confirm" onClose={() => setPending(null)}>
        <Text style={styles.meta}>{pending?.approve ? 'Approve this request and update the student record?' : 'Reject this request?'}</Text>
        <AnimatedPressable
          haptic="medium"
          onPress={() => {
            if (!pending) return;
            if (pending.approve) approveRequest(pending.id);
            else rejectRequest(pending.id);
            setPending(null);
          }}
          style={styles.confirm}
        >
          <Text style={styles.approveText}>{pending?.approve ? 'Approve' : 'Reject'}</Text>
        </AnimatedPressable>
      </GlassModal>
    </MeshBackground>
  );
}

function RequestCard({ request, onDecide }: { request: RoutingRequest; onDecide: (approve: boolean) => void }) {
  const region = request.oldCoords && request.newCoords
    ? {
        latitude: (request.oldCoords.lat + request.newCoords.lat) / 2,
        longitude: (request.oldCoords.lng + request.newCoords.lng) / 2,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : null;
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.name}>{request.studentName}</Text>
      <Text style={styles.meta}>{request.grade} · {request.reason}</Text>
      {request.requestType === 'Stop Change' ? (
        <View>
          <Text style={styles.meta}>Current: {request.oldStop}</Text>
          <Text style={styles.meta}>Requested: {request.newStop}</Text>
          {region && request.oldCoords && request.newCoords ? (
            <View style={styles.map}>
              <MapView style={styles.mapFill} provider={undefined} pointerEvents="none" region={region}>
                <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                <Marker coordinate={{ latitude: request.oldCoords.lat, longitude: request.oldCoords.lng }} pinColor={colors.error} />
                <Marker coordinate={{ latitude: request.newCoords.lat, longitude: request.newCoords.lng }} pinColor={colors.success} />
                <Polyline coordinates={[{ latitude: request.oldCoords.lat, longitude: request.oldCoords.lng }, { latitude: request.newCoords.lat, longitude: request.newCoords.lng }]} strokeColor={portalAccents.gateman.from} strokeWidth={3} lineDashPattern={[6, 4]} />
              </MapView>
            </View>
          ) : null}
        </View>
      ) : (
        <Text style={styles.meta}>{request.fromBusNumber} → {request.toBusNumber}</Text>
      )}
      <View style={styles.actions}>
        <AnimatedPressable haptic="medium" onPress={() => onDecide(false)} style={styles.reject}><Text style={styles.rejectText}>Reject</Text></AnimatedPressable>
        <AnimatedPressable haptic="medium" onPress={() => onDecide(true)} style={styles.approve}><Text style={styles.approveText}>Approve</Text></AnimatedPressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  title: { ...typography.heading },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  tab: { flex: 1, minHeight: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  tabOn: { borderColor: portalAccents.gateman.from, backgroundColor: colors.warningBg },
  tabText: { ...typography.bodyBold },
  list: { padding: spacing.lg, paddingBottom: 140 },
  card: { marginBottom: spacing.md },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  map: { height: 140, borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.sm },
  mapFill: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  reject: { flex: 1, minHeight: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  rejectText: { ...typography.bodyBold, color: colors.error, backgroundColor: 'transparent' },
  approve: { flex: 1, minHeight: 42, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  approveText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  confirm: { marginTop: spacing.lg, minHeight: 48, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
});
