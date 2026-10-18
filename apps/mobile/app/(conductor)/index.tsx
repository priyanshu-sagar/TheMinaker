import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Linking, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, { Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { SlideToConfirm } from '@/components/gateman/SlideToConfirm';
import { BusDecisionBanner } from '@/components/conductor/BusDecisionBanner';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { ManifestStudent, useConductorStore } from '@/store/conductor.store';

const PINGS = ['Bus is waiting', 'Arrived at stop', 'Departing in 1 min'];
const NODE_W = 118;

type Node = { id: string; label: string; time: string; tone: 'done' | 'drop' | 'absent' | 'now' | 'next' | 'school'; studentId?: string };

export default function ConductorRouteScreen() {
  const students = useConductorStore((state) => state.studentManifest);
  const bus = useConductorStore((state) => state.assignedBus);
  const fleet = useConductorStore((state) => state.fleetBuses);
  const tripLive = useConductorStore((state) => state.tripLive);
  const tripLeg = useConductorStore((state) => state.tripLeg);
  const soundOn = useConductorStore((state) => state.soundAlertsEnabled && state.vibrationEnabled);
  const detourNote = useConductorStore((state) => state.detourNote);
  const routeMode = useConductorStore((state) => state.routeChangeModeActive);
  const setTripLive = useConductorStore((state) => state.setTripLive);
  const toggleAlerts = useConductorStore((state) => state.toggleAlerts);
  const markBoarded = useConductorStore((state) => state.markBoarded);
  const markDropped = useConductorStore((state) => state.markDropped);
  const markAbsent = useConductorStore((state) => state.markAbsent);
  const pingParent = useConductorStore((state) => state.pingParent);
  const flagOffLocation = useConductorStore((state) => state.flagOffLocation);
  const submitBusChangeRequest = useConductorStore((state) => state.submitBusChangeRequest);
  const scrollRef = useRef<ScrollView>(null);
  const expandRef = useRef<FlatList<Node>>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinged = useRef(new Set<string>());
  const [fleetOpen, setFleetOpen] = useState(false);
  const [fleetQuery, setFleetQuery] = useState('');
  const [rosterBus, setRosterBus] = useState<string | null>(null);
  const [routeQuery, setRouteQuery] = useState('');
  const [expand, setExpand] = useState(false);
  const [queueQuery, setQueueQuery] = useState('');
  const [viewAll, setViewAll] = useState(false);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [pingId, setPingId] = useState<string | null>(null);
  const [message, setMessage] = useState(PINGS[0] ?? '');
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [viewQuery, setViewQuery] = useState('');

  const ordered = useMemo(() => [...students].sort((a, b) => a.orderIndex - b.orderIndex), [students]);
  const active = ordered.find((item) => item.boardingStatus === 'Approaching') ?? ordered.find((item) => item.boardingStatus === 'Waiting');
  const activeIndex = Math.max(0, active ? ordered.findIndex((item) => item.id === active.id) + 1 : 0);
  const nodes = useMemo<Node[]>(() => [
    { id: 'school-start', label: 'School', time: '06:30 AM', tone: 'school' },
    ...ordered.map((student) => ({
      id: student.id,
      label: `${student.orderIndex} ${(student.name.split(' ')[0] ?? student.name)}`,
      time: student.scheduledTime,
      studentId: student.id,
      tone: student.boardingStatus === 'Boarded' ? 'done' as const : student.boardingStatus === 'Dropped' || student.boardingStatus === 'Pinged' ? 'drop' as const : student.boardingStatus === 'Absent' ? 'absent' as const : student.boardingStatus === 'Approaching' ? 'now' as const : 'next' as const,
    })),
    { id: 'school-end', label: 'School', time: '08:15 AM', tone: 'school' },
  ], [ordered]);
  const routeNodes = useMemo(() => {
    const needle = routeQuery.trim().toLowerCase();
    if (!needle) return nodes;
    return nodes.filter((item) => item.label.toLowerCase().includes(needle) || item.tone === 'school');
  }, [nodes, routeQuery]);
  const rosterList = useMemo(() => {
    const sorted = [...ordered].sort((a, b) => a.name.localeCompare(b.name));
    if (!rosterBus || rosterBus === bus.busNumber) return sorted;
    const busRow = fleet.find((item) => item.busNumber === rosterBus);
    const count = Math.min(busRow?.comingToday ?? 12, sorted.length);
    const start = Number(rosterBus.replace(/\D/g, '')) % Math.max(1, sorted.length - count);
    return sorted.slice(start, start + count);
  }, [ordered, rosterBus, bus.busNumber, fleet]);
  const queue = useMemo(() => {
    const needle = queueQuery.trim().toLowerCase();
    const start = routeMode ? ordered : ordered.filter((item) => !active || item.orderIndex >= active.orderIndex);
    return start.filter((item) => item.boardingStatus !== 'Boarded' && item.boardingStatus !== 'Dropped' && (!needle || `${item.name} ${item.rollNumber}`.toLowerCase().includes(needle)));
  }, [ordered, active, routeMode, queueQuery]);
  const fleetRows = useMemo(() => [...fleet].sort((a, b) => Number(a.busNumber.replace(/\D/g, '')) - Number(b.busNumber.replace(/\D/g, ''))).filter((item) => `${item.busNumber} ${item.routeName} ${item.conductorName ?? ''}`.toLowerCase().includes(fleetQuery.trim().toLowerCase())), [fleet, fleetQuery]);
  const selected = students.find((item) => item.id === nodeId);
  const dropping = tripLeg === 'Afternoon drop';

  const center = useCallback((animated = true) => {
    scrollRef.current?.scrollTo({ x: Math.max(0, activeIndex * NODE_W - NODE_W), animated });
  }, [activeIndex]);
  const armSnap = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => center(true), 4000);
  }, [center]);
  useEffect(() => { center(false); }, [center]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const act = useCallback((id: string, kind: 'board' | 'absent') => {
    const student = useConductorStore.getState().studentManifest.find((item) => item.id === id);
    if (!student) return;
    if (student.distanceMeters > 650 && kind === 'board') {
      setAsk({ tone: 'override', title: 'Off-location detected', summary: `You are ${student.distanceMeters}m from the scheduled stop. The allowed range is 650m. Send this to the gateman?`, confirmLabel: 'Send flag', onConfirm: () => flagOffLocation(id, { lat: 28.57, lng: 77.08 }) });
      return;
    }
    if (kind === 'absent') {
      setAsk({ tone: 'reject', title: 'Mark absent', summary: `Mark ${student.name} absent for this run?`, confirmLabel: 'Confirm absent', onConfirm: () => markAbsent(id) });
      return;
    }
    setAsk({ tone: 'approve', title: dropping ? 'Mark dropped' : 'Mark boarded', summary: `Confirm ${student.name} was ${dropping ? 'dropped' : 'boarded'}?`, confirmLabel: 'Confirm', onConfirm: () => dropping ? markDropped(id) : markBoarded(id) });
  }, [dropping, flagOffLocation, markAbsent, markBoarded, markDropped]);

  async function slideStart() {
    const services = await Location.hasServicesEnabledAsync();
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!services || perm.status !== 'granted') {
      setAsk({ tone: 'override', title: 'Location services required', summary: 'Your phone GPS provides live tracking for parents and the school. Turn on Location to start the trip.', confirmLabel: 'Open settings', onConfirm: () => Linking.openSettings() });
      return;
    }
    setTripLive(true);
    const nearby = useConductorStore.getState().studentManifest.filter((item) => item.distanceMeters <= 650 && (item.boardingStatus === 'Waiting' || item.boardingStatus === 'Approaching'));
    nearby.forEach((item) => {
      if (pinged.current.has(item.id)) return;
      pinged.current.add(item.id);
      pingParent(item.id, `Bus 7 is approaching stop ${item.orderIndex}. Arriving in about 2 minutes.`);
    });
  }

  function slideEnd() {
    const onBus = useConductorStore.getState().studentManifest.filter((item) => item.boardingStatus === 'Boarded');
    if (onBus.length > 0) {
      setAsk({ tone: 'override', title: 'Students are still on the bus', summary: `${onBus.length} students are still on the bus. Finish the ${dropping ? 'drop' : 'boarding'} before this bus can go offline.`, confirmLabel: 'OK', onConfirm: () => undefined });
      return;
    }
    setAsk({ tone: 'reject', title: 'Take the bus offline?', summary: 'Parents and the gate will stop seeing this bus until you go live again.', confirmLabel: 'Go offline', onConfirm: () => setTripLive(false) });
  }

  return (
    <MeshBackground>
      <View style={styles.screen}>
        <AnimatedPressable haptic="selection" onPress={() => setFleetOpen(true)} style={styles.busBtn}>
          <View style={styles.flex}>
            <Text style={styles.label}>{bus.busNumber} · {bus.routeName}</Text>
            <Text style={styles.meta}>{dropping ? 'Afternoon drop' : 'Morning boarding'} · {tripLive ? 'Live' : 'Offline'}</Text>
          </View>
          <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M6 9l6 6 6-6" stroke={colors.textPrimary} strokeWidth={2} fill="none" /></Svg>
        </AnimatedPressable>
        <BusDecisionBanner />
        <GlassCard style={[shadows.lg, styles.command]}>
          <View style={styles.liveRow}>
            <View style={styles.flex}>
              <Text style={styles.label}>{tripLive ? 'Live trip' : 'Offline'}</Text>
              <Text style={styles.meta}>{tripLive ? `Broadcasting ${bus.routeName} to parents and the gate` : 'GPS tracking is paused'}</Text>
            </View>
            <View style={[styles.liveDot, tripLive ? styles.liveOn : null]} />
          </View>
          {tripLive ? <Text style={styles.meta}>Speed 32 km/h · Next arrival 4 min · GPS high accuracy</Text> : null}
          {battery !== null && battery < 20 ? <Text style={styles.warn}>Low battery ({battery}%). Connect a charger so live GPS stays on for the whole route.</Text> : null}
          <SlideToConfirm compact key={tripLive ? 'end' : 'start'} label={tripLive ? 'Slide to end trip' : 'Slide to start live trip'} onConfirm={tripLive ? slideEnd : slideStart} accentColor={tripLive ? colors.error : portalAccents.conductor.from} />
          <AnimatedPressable haptic="light" onPress={toggleAlerts} style={styles.tool}><Text style={styles.meta}>Sound and vibration {soundOn ? 'on' : 'off'}</Text></AnimatedPressable>
        </GlassCard>
        {detourNote ? <Text style={styles.banner}>Detour active. Sequence unlocked. {detourNote}</Text> : null}
        <GlassCard style={[shadows.md, styles.metro]}>
          <View style={styles.metroHead}>
            <Text style={styles.label}>{dropping ? 'Afternoon drop route' : 'Morning boarding route'}</Text>
            <AnimatedPressable haptic="selection" onPress={() => setExpand(true)}><Text style={styles.link}>Expand view</Text></AnimatedPressable>
          </View>
          <ScrollView ref={scrollRef} horizontal bounces={false} showsHorizontalScrollIndicator={false} onScrollBeginDrag={() => { if (timer.current) clearTimeout(timer.current); }} onMomentumScrollEnd={() => armSnap()} contentContainerStyle={styles.track}>
            <View style={[styles.busIcon, { left: activeIndex * NODE_W }]}>
              <Svg width={28} height={16} viewBox="0 0 28 16"><Rect x={1} y={3} width={22} height={10} rx={2} fill={portalAccents.conductor.from} /><Rect x={23} y={6} width={4} height={4} fill={colors.warning} /></Svg>
            </View>
            {nodes.map((node, index) => <RouteNode key={node.id} node={node} last={index === nodes.length - 1} onPress={() => node.studentId && setNodeId(node.studentId)} />)}
          </ScrollView>
        </GlassCard>
        <View style={styles.queueHead}>
          <Text style={styles.label}>Approaching next</Text>
          <AnimatedPressable haptic="selection" onPress={() => setViewAll(true)}><Text style={styles.link}>View all ({ordered.length})</Text></AnimatedPressable>
        </View>
        <AppTextInput value={queueQuery} onChangeText={setQueueQuery} placeholder="Search upcoming students by name or roll" placeholderTextColor={colors.textPlaceholder} style={styles.search} />
        <FlatList style={styles.flex} data={queue} keyExtractor={(item) => item.id} bounces={false} removeClippedSubviews maxToRenderPerBatch={10} windowSize={7} contentContainerStyle={styles.list} renderItem={({ item }) => <QueueRow student={item} dropping={dropping} onOpen={setNodeId} onBoard={() => act(item.id, 'board')} onAbsent={() => act(item.id, 'absent')} onPing={() => setPingId(item.id)} />} />
      </View>

      <GlassModal visible={fleetOpen && rosterBus === null} fill scroll={false} maxHeight="88%" title="School fleet" onClose={() => setFleetOpen(false)}>
        <AppTextInput value={fleetQuery} onChangeText={setFleetQuery} placeholder="Search fleet by bus, driver, or route" placeholderTextColor={colors.textPlaceholder} style={styles.searchBare} />
        <FlatList data={fleetRows} keyExtractor={(item) => item.id} style={styles.flex} bounces={false} renderItem={({ item }) => (
          <View style={styles.fleetCard}>
            <View style={styles.flex}>
              <Text style={styles.body}>{item.busNumber} · {item.routeName}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.conductorName ?? 'Unassigned'} · {item.status}</Text>
              <Text style={styles.dots} numberOfLines={1}>School · {item.routeName} · School · {item.rosterCount} assigned · {item.busNumber === bus.busNumber ? ordered.filter((row) => row.boardingStatus !== 'Absent').length : item.comingToday} today</Text>
            </View>
            <View style={styles.fleetActions}>
              {item.conductorName || item.status === 'Maintenance' ? null : <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'override', title: `Request ${item.busNumber}`, summary: `Ask the gateman to move you onto ${item.busNumber}. If there is no approval in 2 minutes, the request is rejected.`, confirmLabel: 'Send request', reasons: ['Breakdown', 'Depot swap', 'Closer to my route'], onConfirm: (note) => { submitBusChangeRequest(item.busNumber, item.busNumber, note ?? 'Bus swap'); setFleetOpen(false); } })} style={styles.miniGo}><Text style={styles.miniWhite}>Request</Text></AnimatedPressable>}
              <AnimatedPressable haptic="selection" onPress={() => setRosterBus(item.busNumber)} style={styles.rosterBtn}><Text style={styles.link}>Roster</Text></AnimatedPressable>
            </View>
          </View>
        )} />
      </GlassModal>
      <GlassModal visible={rosterBus !== null} fill scroll={false} maxHeight="88%" title={`${rosterBus ?? ''} roster`} onBack={() => setRosterBus(null)} onClose={() => { setRosterBus(null); setFleetOpen(false); }}>
        <FlatList data={rosterList} keyExtractor={(item) => item.id} style={styles.flex} contentContainerStyle={styles.listBare} renderItem={({ item }) => (
          <View style={styles.queue}>
            <View style={styles.flex}>
              <Text style={styles.body}>{item.name}</Text>
              <Text style={styles.meta}>{item.grade} · Roll {item.rollNumber} · {item.scheduledTime}</Text>
            </View>
            <Text style={styles.chip}>{item.boardingStatus}</Text>
          </View>
        )} />
      </GlassModal>
      <GlassModal visible={expand} fill scroll={false} maxHeight="90%" title="Full route" onClose={() => setExpand(false)}>
        <AppTextInput value={routeQuery} onChangeText={setRouteQuery} placeholder="Search the route" placeholderTextColor={colors.textPlaceholder} style={styles.searchBare} />
        <FlatList
          ref={expandRef}
          data={routeNodes}
          keyExtractor={(item) => item.id}
          style={styles.flex}
          bounces={false}
          contentContainerStyle={styles.listBare}
          onScrollToIndexFailed={() => undefined}
          getItemLayout={(_, index) => ({ length: 76, offset: 76 * index, index })}
          onContentSizeChange={() => { if (!routeQuery) expandRef.current?.scrollToIndex({ index: Math.min(activeIndex, Math.max(routeNodes.length - 1, 0)), animated: false, viewPosition: 0 }); }}
          renderItem={({ item }) => {
            const student = ordered.find((row) => row.id === item.studentId);
            if (student) {
              return <QueueRow student={student} dropping={dropping} onOpen={setNodeId} onBoard={() => act(student.id, 'board')} onAbsent={() => act(student.id, 'absent')} onPing={() => setPingId(student.id)} />;
            }
            return (
              <View style={styles.expandRow}>
                <View style={[styles.dot, styles.school]} />
                <View style={styles.flex}>
                  <Text style={styles.body}>{item.label}</Text>
                  <Text style={styles.meta}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.legend}>
          <Text style={styles.meta}>Green boarded · Blue pinged or dropped · Red absent · Amber approaching · Grey upcoming · School at both ends</Text>
        </View>
      </GlassModal>
      <GlassModal visible={viewAll} fill scroll={false} maxHeight="90%" title="Approaching students" onClose={() => setViewAll(false)}>
        <AppTextInput value={viewQuery} onChangeText={setViewQuery} placeholder="Search by name or roll" placeholderTextColor={colors.textPlaceholder} style={styles.searchBare} />
        <FlatList data={ordered.filter((item) => `${item.name} ${item.rollNumber}`.toLowerCase().includes(viewQuery.trim().toLowerCase()))} keyExtractor={(item) => item.id} style={styles.flex} contentContainerStyle={styles.listBare} renderItem={({ item }) => <QueueRow student={item} dropping={dropping} onOpen={setNodeId} onBoard={() => act(item.id, 'board')} onAbsent={() => act(item.id, 'absent')} onPing={() => setPingId(item.id)} />} />
      </GlassModal>
      <GlassModal visible={nodeId !== null} fill maxHeight="88%" title={selected?.name ?? 'Student'} onClose={() => setNodeId(null)}>
        {selected ? (
          <View>
            <Text style={styles.body}>{selected.grade} · Roll {selected.rollNumber} · {bus.busNumber}</Text>
            <Text style={styles.meta}>{selected.stopAddress} · {selected.scheduledTime}</Text>
            <Text style={styles.meta}>{selected.parentName}</Text>
            <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${selected.parentPhone}`)} style={styles.call}><Text style={styles.white}>Call parent</Text></AnimatedPressable>
            <View style={styles.map}>
              <MapView style={styles.mapFill} provider={undefined} pointerEvents="none" region={{ latitude: 28.55 + selected.orderIndex * 0.001, longitude: 77.08, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
                <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                <Marker coordinate={{ latitude: 28.55 + selected.orderIndex * 0.001, longitude: 77.08 }} title="Stop" />
                <Marker coordinate={{ latitude: 28.55 + selected.orderIndex * 0.001 + 0.004, longitude: 77.084 }} title="Bus" pinColor={portalAccents.conductor.from} />
                <Circle center={{ latitude: 28.55 + selected.orderIndex * 0.001, longitude: 77.08 }} radius={650} strokeColor={portalAccents.conductor.from} fillColor={colors.successBg} />
              </MapView>
            </View>
            <AnimatedPressable haptic="medium" onPress={() => act(selected.id, 'board')} style={styles.go}><Text style={styles.white}>{dropping ? 'Mark dropped' : 'Mark boarded'}</Text></AnimatedPressable>
            <AnimatedPressable haptic="medium" onPress={() => act(selected.id, 'absent')} style={styles.absentBtn}><Text style={styles.danger}>Mark absent</Text></AnimatedPressable>
            <AnimatedPressable haptic="selection" onPress={() => { setPingId(selected.id); }}><Text style={styles.link}>Ping parent</Text></AnimatedPressable>
          </View>
        ) : null}
      </GlassModal>
      <GlassModal visible={pingId !== null} maxHeight="60%" title="Ping parent" onClose={() => setPingId(null)}>
        {PINGS.map((item) => <AnimatedPressable key={item} haptic="selection" onPress={() => setMessage(item)} style={styles.preset}><Text style={styles.meta}>{item}</Text></AnimatedPressable>)}
        <AnimatedPressable haptic="medium" onPress={() => { if (pingId) pingParent(pingId, message); setPingId(null); }} style={styles.go}><Text style={styles.white}>Send ping</Text></AnimatedPressable>
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const RouteNode = memo(function RouteNode({ node, last, vertical, onPress }: { node: Node; last: boolean; vertical?: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable haptic="selection" onPress={onPress} style={vertical ? styles.nodeTall : styles.node}>
      <View style={vertical ? styles.railTall : styles.rail}>
        <View style={[styles.dot, node.tone === 'done' ? styles.done : node.tone === 'drop' ? styles.drop : node.tone === 'absent' ? styles.absent : node.tone === 'now' ? styles.now : node.tone === 'school' ? styles.school : styles.next]} />
        {last || vertical ? null : <View style={[styles.line, node.tone === 'done' || node.tone === 'drop' ? styles.done : node.tone === 'now' ? styles.now : styles.nextLine]} />}
      </View>
      <Text style={styles.nodeName} numberOfLines={1}>{node.label}</Text>
      <Text style={styles.nodeTime}>{node.time}</Text>
    </AnimatedPressable>
  );
});

const QueueRow = memo(function QueueRow({ student, dropping, onOpen, onBoard, onAbsent, onPing }: { student: ManifestStudent; dropping: boolean; onOpen: (id: string) => void; onBoard: () => void; onAbsent: () => void; onPing: () => void }) {
  return (
    <View style={styles.queue}>
      <View style={[styles.dot, student.boardingStatus === 'Boarded' ? styles.done : student.boardingStatus === 'Dropped' || student.boardingStatus === 'Pinged' ? styles.drop : student.boardingStatus === 'Absent' ? styles.absent : student.boardingStatus === 'Approaching' ? styles.now : styles.next]} />
      <LinearGradient colors={[portalAccents.conductor.from, portalAccents.conductor.to]} style={styles.avatar}><Text style={styles.avatarText}>{student.name.slice(0, 1)}</Text></LinearGradient>
      <AnimatedPressable haptic="selection" onPress={() => onOpen(student.id)} style={styles.flex}>
        <Text style={styles.body} numberOfLines={1}>{student.name}</Text>
        <Text style={styles.meta}>{student.grade} · {student.rollNumber} · {student.scheduledTime}</Text>
      </AnimatedPressable>
      <AnimatedPressable haptic="medium" onPress={onBoard} style={styles.miniGo}><Text style={styles.miniWhite}>{dropping ? 'Drop' : 'Board'}</Text></AnimatedPressable>
      <AnimatedPressable haptic="medium" onPress={onAbsent} style={styles.miniNo}><Text style={styles.danger}>Absent</Text></AnimatedPressable>
      <AnimatedPressable haptic="selection" onPress={onPing}><Text style={styles.link}>Ping</Text></AnimatedPressable>
      <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${student.parentPhone}`)}><Text style={styles.link}>Call</Text></AnimatedPressable>
      <AnimatedPressable haptic="selection" onPress={() => onOpen(student.id)}><Text style={styles.chev}>›</Text></AnimatedPressable>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  legend: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: palette.offWhite },
  busBtn: { marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong, flexDirection: 'row', alignItems: 'center' },
  label: { ...typography.label },
  meta: { ...typography.caption, marginTop: 2 },
  body: { ...typography.bodyBold },
  swap: { marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warningBg },
  command: { marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.md },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.textMuted, marginLeft: spacing.sm },
  liveOn: { backgroundColor: colors.success },
  warn: { ...typography.caption, color: colors.warning, marginTop: spacing.sm },
  go: { minHeight: 44, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  miniWhite: { ...typography.caption, color: palette.white, fontWeight: '700' },
  tool: { alignSelf: 'flex-start', marginTop: spacing.sm, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  banner: { ...typography.caption, marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.warningBg, color: colors.warning },
  metro: { marginHorizontal: spacing.lg, marginTop: spacing.sm, paddingVertical: spacing.md, minHeight: 150 },
  metroHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  link: { ...typography.caption, color: portalAccents.conductor.from, fontWeight: '700' },
  danger: { ...typography.caption, color: colors.error, fontWeight: '700', backgroundColor: 'transparent' },
  track: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  busIcon: { position: 'absolute', top: 0 },
  node: { width: NODE_W },
  nodeTall: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rail: { flexDirection: 'row', alignItems: 'center' },
  railTall: { width: 20, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  done: { backgroundColor: colors.success, borderColor: colors.success },
  drop: { backgroundColor: colors.info, borderColor: colors.info },
  absent: { backgroundColor: colors.error, borderColor: colors.error },
  now: { backgroundColor: colors.warning, borderColor: colors.warning },
  school: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  next: { backgroundColor: colors.borderStrong, borderColor: colors.borderStrong },
  nextLine: { backgroundColor: colors.borderStrong },
  line: { height: 3, width: NODE_W - 14 },
  nodeName: { ...typography.caption, color: colors.textPrimary, fontWeight: '700', marginTop: 4, width: NODE_W - 12 },
  nodeTime: { ...typography.caption },
  queueHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md },
  search: { minHeight: 40, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.textPrimary, backgroundColor: palette.white },
  searchBare: { minHeight: 40, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.textPrimary, backgroundColor: palette.white, marginBottom: spacing.sm },
  listBare: { paddingBottom: spacing.xl },
  expandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 56, borderBottomWidth: 1, borderBottomColor: colors.divider },
  chip: { ...typography.caption, backgroundColor: colors.neutralBg, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  queue: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 64, marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.caption, color: palette.white, fontWeight: '700', backgroundColor: 'transparent' },
  miniGo: { backgroundColor: colors.success, borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 28, justifyContent: 'center' },
  miniNo: { borderWidth: 1, borderColor: colors.error, borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 28, justifyContent: 'center' },
  chev: { ...typography.heading, color: colors.textMuted, backgroundColor: 'transparent' },
  fleetCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 64, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  fleetActions: { alignItems: 'flex-end', gap: spacing.xs },
  rosterBtn: { borderWidth: 1, borderColor: portalAccents.conductor.from, borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 28, justifyContent: 'center' },
  tools: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  dots: { ...typography.caption, marginTop: 2 },
  map: { height: 180, borderRadius: radius.lg, overflow: 'hidden', marginVertical: spacing.sm },
  mapFill: { flex: 1 },
  call: { marginTop: spacing.sm, minHeight: 40, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center' },
  absentBtn: { marginTop: spacing.sm, minHeight: 40, borderRadius: radius.full, borderWidth: 1, borderColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  preset: { paddingVertical: spacing.sm },
});
