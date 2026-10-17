import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { StudentManifestRow } from '@/components/conductor/StudentManifestRow';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { ManifestStudent, useConductorStore } from '@/store/conductor.store';

const PINGS = ['Is your child coming today?', 'Child not at stop', 'Please confirm'];

type ListItem = { key: string; kind: 'header'; title: string } | { key: string; kind: 'student'; student: ManifestStudent };

export default function ConductorRouteScreen() {
  const stops = useConductorStore((state) => state.routeStops);
  const students = useConductorStore((state) => state.studentManifest);
  const bus = useConductorStore((state) => state.assignedBus);
  const soundOn = useConductorStore((state) => state.soundAlertsEnabled);
  const routeMode = useConductorStore((state) => state.routeChangeModeActive);
  const toggleSoundAlerts = useConductorStore((state) => state.toggleSoundAlerts);
  const toggleRouteChangeMode = useConductorStore((state) => state.toggleRouteChangeMode);
  const advanceToNextStop = useConductorStore((state) => state.advanceToNextStop);
  const markBoarded = useConductorStore((state) => state.markBoarded);
  const markAbsent = useConductorStore((state) => state.markAbsent);
  const pingParent = useConductorStore((state) => state.pingParent);
  const flagOffLocation = useConductorStore((state) => state.flagOffLocation);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const [pingId, setPingId] = useState<string | null>(null);
  const [message, setMessage] = useState(PINGS[0]);
  const height = useWindowDimensions().height;
  const current = stops[bus.currentStopIndex];
  const next = stops[bus.currentStopIndex + 1];
  const here = useMemo(() => students.filter((student) => student.stopId === current?.id), [students, current?.id]);
  const boardedHere = here.filter((student) => student.boardingStatus === 'Boarded').length;
  const rows = useMemo<ListItem[]>(() => {
    if (!routeMode) return here.map((student) => ({ key: student.id, kind: 'student' as const, student }));
    const grouped: ListItem[] = [];
    stops.forEach((stop) => {
      grouped.push({ key: `h-${stop.id}`, kind: 'header', title: stop.name });
      students.filter((student) => student.stopId === stop.id).forEach((student) => grouped.push({ key: student.id, kind: 'student', student }));
    });
    return grouped;
  }, [routeMode, here, stops, students]);

  const confirmBoard = useCallback((id: string) => {
    const student = students.find((item) => item.id === id);
    if (!student) return;
    setAsk({ tone: 'approve', title: 'Mark boarded', summary: `Confirm ${student.name} boarded at ${student.stopName}?`, confirmLabel: 'Confirm boarded', onConfirm: () => markBoarded(id) });
  }, [students, markBoarded]);
  const confirmAbsent = useCallback((id: string) => {
    const student = students.find((item) => item.id === id);
    if (!student) return;
    setAsk({ tone: 'reject', title: 'Mark absent', summary: `Mark ${student.name} as absent at ${student.stopName}?`, confirmLabel: 'Confirm absent', onConfirm: () => markAbsent(id) });
  }, [students, markAbsent]);
  const confirmOff = useCallback((id: string) => {
    const student = students.find((item) => item.id === id);
    if (!student) return;
    setAsk({ tone: 'override', title: 'Off-location detected', summary: `You are ${student.distanceMeters}m from ${student.stopName}. The allowed range is 650m. Flag this attendance for the gateman?`, confirmLabel: 'Send off-location flag', onConfirm: () => flagOffLocation(id, { lat: student.distanceMeters > 700 ? 28.58 : 28.572, lng: 77.08 }) });
  }, [students, flagOffLocation]);
  const openPing = useCallback((id: string) => { setMessage(PINGS[0]); setPingId(id); }, []);
  const pingStudent = students.find((item) => item.id === pingId);

  return (
    <MeshBackground>
      <View style={styles.flex}>
        <View style={{ height: height * 0.42 }}>
          <GlassCard style={[shadows.lg, styles.mapCard]}>
            <View style={styles.mapHead}>
              <Text style={styles.label}>Live route</Text>
              <AnimatedPressable haptic="light" onPress={toggleSoundAlerts} style={styles.sound}>
                <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M4 10v4h4l5 4V6L8 10H4zm11.5 2a3.5 3.5 0 0 0-1.5-2.9v5.8a3.5 3.5 0 0 0 1.5-2.9z" fill={soundOn ? portalAccents.conductor.from : colors.textMuted} /></Svg>
              </AnimatedPressable>
            </View>
            <View style={styles.flex}>
              {stops.map((stop, index) => <StopRow key={stop.id} name={stop.name} eta={stop.eta} status={stop.status} boarded={stop.boardedCount} total={stop.studentCount} last={index === stops.length - 1} />)}
            </View>
            <AnimatedPressable haptic="medium" onPress={() => current && setAsk({ tone: 'approve', title: 'Advance route', summary: `Mark ${current.name} complete and move to ${next?.name ?? 'the school'}?`, confirmLabel: 'Advance', onConfirm: advanceToNextStop })} style={styles.advance}>
              <Text style={styles.white}>{current ? `Mark ${current.name} complete` : 'Route complete'}</Text>
            </AnimatedPressable>
            <AnimatedPressable haptic="selection" onPress={toggleRouteChangeMode} style={[styles.mode, routeMode ? styles.modeOn : null]}>
              <Text style={routeMode ? styles.modeOnText : styles.modeText}>{routeMode ? 'Route change mode is on' : 'Enable route change mode'}</Text>
            </AnimatedPressable>
          </GlassCard>
        </View>
        <View style={styles.flex}>
          {routeMode ? <Text style={styles.banner}>Route change mode is on. Any student can be marked, in any stop order.</Text> : null}
          <View style={styles.sectionHead}>
            <Text style={styles.label}>{routeMode ? 'All students' : `Students at ${current?.name ?? 'this stop'}`}</Text>
            <Text style={styles.progress}>{boardedHere} of {here.length} boarded</Text>
          </View>
          <FlatList
            data={rows}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => item.kind === 'header' ? <Text style={styles.stopHead}>{item.title}</Text> : (
              <StudentManifestRow student={item.student} routeChangeModeActive={routeMode} showStop={routeMode} onBoarded={confirmBoard} onAbsent={confirmAbsent} onPing={openPing} onOffLocation={confirmOff} />
            )}
            bounces={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={7}
            contentContainerStyle={styles.list}
          />
        </View>
      </View>
      <GlassModal visible={pingId !== null} maxHeight="60%" title="Ping parent" onClose={() => setPingId(null)}>
        <Text style={styles.name}>{pingStudent?.name}</Text>
        <Text style={styles.meta}>{pingStudent?.parentName}</Text>
        <AppTextInput value={message} onChangeText={setMessage} placeholder="Message to parent" placeholderTextColor={colors.textPlaceholder} style={styles.input} />
        <View style={styles.pills}>
          {PINGS.map((item) => <AnimatedPressable key={item} haptic="selection" onPress={() => setMessage(item)} style={styles.pill}><Text style={styles.meta}>{item}</Text></AnimatedPressable>)}
        </View>
        <AnimatedPressable haptic="medium" onPress={() => { if (pingId) pingParent(pingId, message); setPingId(null); }} style={styles.advance}><Text style={styles.white}>Send ping</Text></AnimatedPressable>
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const StopRow = memo(function StopRow({ name, eta, status, boarded, total, last }: { name: string; eta: string; status: string; boarded: number; total: number; last: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (status !== 'Current') return undefined;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 750, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [scale, status]);
  const done = status === 'Completed';
  return (
    <View style={styles.stop}>
      <View style={styles.rail}>
        {status === 'Current' ? <Animated.View style={[styles.pulse, { transform: [{ scale }] }]} /> : last ? <View style={styles.square} /> : <View style={[styles.dot, done ? styles.dotDone : styles.dotNext]} />}
        {last ? null : <View style={[styles.line, done ? styles.lineDone : status === 'Current' ? styles.lineNow : styles.lineNext]} />}
      </View>
      <View style={styles.stopCopy}>
        <Text style={done ? styles.doneName : status === 'Current' ? styles.currentName : styles.nextName}>{name}</Text>
        <Text style={styles.meta}>{eta}</Text>
      </View>
      <Text style={[styles.count, done ? styles.countDone : status === 'Current' ? styles.countNow : null]}>{status === 'Current' ? `${boarded} of ${total} boarded` : `${total}`}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapCard: { flex: 1, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md },
  mapHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.label },
  sound: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  stop: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 28 },
  rail: { width: 28, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotNext: { backgroundColor: palette.white, borderColor: colors.textMuted },
  pulse: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.warning },
  square: { width: 10, height: 10, backgroundColor: colors.textPrimary },
  line: { width: 2, flex: 1, minHeight: 14 },
  lineDone: { backgroundColor: colors.success },
  lineNow: { backgroundColor: colors.warning },
  lineNext: { backgroundColor: colors.borderStrong },
  stopCopy: { flex: 1 },
  currentName: { ...typography.bodyBold },
  nextName: { ...typography.body },
  doneName: { ...typography.caption },
  meta: { ...typography.caption },
  count: { ...typography.caption, backgroundColor: colors.neutralBg, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm },
  countNow: { backgroundColor: colors.warningBg, color: colors.warning },
  countDone: { backgroundColor: colors.successBg, color: colors.success },
  advance: { minHeight: 42, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  mode: { minHeight: 36, borderRadius: radius.full, borderWidth: 1, borderColor: colors.warning, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  modeOn: { backgroundColor: colors.warningBg },
  modeText: { ...typography.caption, color: colors.warning },
  modeOnText: { ...typography.caption, color: colors.warning, fontWeight: '700' },
  banner: { ...typography.caption, marginHorizontal: spacing.lg, marginBottom: spacing.xs, backgroundColor: colors.warningBg, color: colors.warning, padding: spacing.sm, borderRadius: radius.md },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  progress: { ...typography.caption, color: colors.success, backgroundColor: colors.successBg, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  stopHead: { ...typography.overline, marginTop: spacing.sm, marginBottom: spacing.xs },
  name: { ...typography.bodyBold },
  pills: { gap: spacing.xs, marginVertical: spacing.sm },
  pill: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, padding: spacing.sm },
  input: { minHeight: 44, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.textPrimary, backgroundColor: palette.white, marginTop: spacing.sm },
});
