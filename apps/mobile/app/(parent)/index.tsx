import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ParentToast } from '@/components/parent/ParentToast';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { StatusPill } from '@/components/shared/StatusPill';
import { Linking } from 'react-native';
import { Phone } from 'lucide-react-native';
import { ConfirmModal } from '@/components/parent/ConfirmModal';
import { ParentChrome } from '@/components/parent/ParentChrome';
import { colors, glass, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useActiveChild, useParentStore } from '@/store/parent.store';

export default function ParentLiveScreen() {
  const child = useActiveChild();
  const transit = useParentStore((state) => state.liveTransit);
  const setAbsentToday = useParentStore((state) => state.setAbsentToday);
  const confirmWaitingAtStop = useParentStore((state) => state.confirmWaitingAtStop);
  const [note, setNote] = useState<string | null>(null);
  const [askAbsent, setAskAbsent] = useState(false);
  const conductorPings = useParentStore((state) => state.conductorPings);
  const gatemanHomePings = useParentStore((state) => state.gatemanHomePings);
  const replyToConductorPing = useParentStore((state) => state.replyToConductorPing);
  const replyToGatemanHomePing = useParentStore((state) => state.replyToGatemanHomePing);
  const [otherId, setOtherId] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const openPings = useMemo(() => conductorPings.filter((item) => !item.replied), [conductorPings]);
  const openHome = useMemo(() => gatemanHomePings.filter((item) => !item.replied), [gatemanHomePings]);

  const nearby = child?.status === 'Active' && !child.absentToday && transit.status === 'En route' && transit.distanceToStop <= 600;
  const pulse = useSharedValue(0.45);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const region = useMemo(() => {
    if (!child) return { latitude: 19.076, longitude: 72.877, latitudeDelta: 0.08, longitudeDelta: 0.08 };
    const lat = (transit.currentLocation.lat + child.boardingPoint.lat) / 2;
    const lng = (transit.currentLocation.lng + child.boardingPoint.lng) / 2;
    return { latitude: lat, longitude: lng, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  }, [child, transit.currentLocation.lat, transit.currentLocation.lng]);

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ParentChrome />
        <View style={styles.stage}>
        {openPings.map((ping) => (
          <GlassCard key={ping.id} style={[shadows.md, styles.pingCard]}>
            <Text style={styles.route}>{ping.conductorName} ({ping.busNumber}) is asking about {ping.studentName}</Text>
            <Text style={styles.quote}>{ping.message}</Text>
            <View style={styles.pingActions}>
              <AnimatedPressable haptic="medium" onPress={() => replyToConductorPing(ping.id, 'Coming')} style={styles.coming}><Text style={styles.primaryText}>Coming</Text></AnimatedPressable>
              <AnimatedPressable haptic="medium" onPress={() => replyToConductorPing(ping.id, 'NotComing')} style={styles.notComing}><Text style={styles.primaryText}>Not coming</Text></AnimatedPressable>
              <AnimatedPressable haptic="light" onPress={() => setOtherId(ping.id)} style={styles.other}><Text style={styles.secondaryText}>Other</Text></AnimatedPressable>
            </View>
            {otherId === ping.id ? (
              <View>
                <AppTextInput value={otherText} onChangeText={setOtherText} placeholder="Type your reason" placeholderTextColor={colors.textPlaceholder} style={styles.otherInput} />
                <AnimatedPressable haptic="medium" onPress={() => { replyToConductorPing(ping.id, 'Other', otherText); setOtherId(null); setOtherText(''); }} style={styles.secondary}><Text style={styles.secondaryText}>Send</Text></AnimatedPressable>
              </View>
            ) : null}
          </GlassCard>
        ))}
        {openHome.map((ping) => (
          <GlassCard key={ping.id} style={[shadows.md, styles.homeCard]}>
            <Text style={styles.route}>Gateman {ping.gatemanName} is asking about {ping.studentName}</Text>
            <Text style={styles.homeQuote}>{ping.message}</Text>
            <View style={styles.pingActions}>
              <AnimatedPressable haptic="medium" onPress={() => replyToGatemanHomePing(ping.id, true)} style={styles.coming}><Text style={styles.primaryText}>Home safe</Text></AnimatedPressable>
              <AnimatedPressable haptic="light" onPress={() => replyToGatemanHomePing(ping.id, false)} style={styles.notComing}><Text style={styles.primaryText}>Not yet</Text></AnimatedPressable>
            </View>
          </GlassCard>
        ))}
        {nearby ? (
          <Animated.View entering={FadeInDown.duration(320)}>
            <Animated.View style={[styles.banner, glow]}>
              <Text style={styles.bannerText}>Bus is arriving soon. Please reach the boarding point.</Text>
            </Animated.View>
          </Animated.View>
        ) : null}

        <View style={styles.mapWrap}>
          <MapView style={styles.map} provider={undefined} region={region}>
            <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
            <Marker
              coordinate={{ latitude: transit.currentLocation.lat, longitude: transit.currentLocation.lng }}
              title={transit.busId}
              description={transit.routeName}
              pinColor={portalAccents.parent.from}
            />
            {child ? (
              <Marker
                coordinate={{ latitude: child.boardingPoint.lat, longitude: child.boardingPoint.lng }}
                title={child.boardingPoint.name}
                description="Boarding point"
                pinColor={palette.emerald}
              />
            ) : null}
          </MapView>
        </View>

        <GlassCard style={[styles.card, shadows.lg]}>
          <View style={styles.cardTop}>
            <Text style={styles.route}>{transit.routeName}</Text>
            <StatusPill
              variant={transit.status === 'Not travelling' ? 'absent' : nearby ? 'warning' : 'online'}
              label={transit.status}
            />
          </View>
          <Text style={styles.meta}>Conductor {transit.conductorName}</Text>
          <Text style={styles.eta}>ETA {transit.eta}</Text>
          <Text style={styles.meta}>{transit.distanceToStop} m from {child?.boardingPoint.name}</Text>
          {child?.waitingAtStop ? <Text style={styles.waiting}>Marked waiting at the stop.</Text> : null}
          <View style={styles.dialRow}>
            <Text style={styles.meta}>{child?.absentToday ? 'Not taking the bus' : 'Taking the bus'}</Text>
            <AnimatedPressable
              haptic="selection"
              onPress={() => setAskAbsent(true)}
              style={[styles.switch, child?.absentToday ? null : styles.switchOn]}
            >
              <View style={[styles.knob, child?.absentToday ? null : styles.knobOn]} />
            </AnimatedPressable>
            <AnimatedPressable
              haptic="medium"
              onPress={() => transit.conductorPhone && Linking.openURL(`tel:${transit.conductorPhone}`).catch(() => undefined)}
              style={styles.dial}
            >
              <Phone color={palette.white} size={14} />
            </AnimatedPressable>
          </View>
        </GlassCard>
        {child?.status === 'Pending' ? (
          <View style={styles.lock}>
            <GlassCard style={shadows.lg}>
              <Text style={styles.lockTitle}>Awaiting School Admin Verification</Text>
              <Text style={styles.lockBody}>Live tracking stays hidden until the school confirms {child.name}.</Text>
            </GlassCard>
          </View>
        ) : null}
        </View>
        <ParentToast message={note} onDone={() => setNote(null)} />
      </SafeAreaView>
      <ConfirmModal
        visible={askAbsent}
        title={child?.absentToday ? 'Resume the bus?' : 'Mark absent today?'}
        body={child?.absentToday ? 'The conductor will expect them on the route again.' : 'They will be taken off both runs. You can undo this.'}
        confirmLabel={child?.absentToday ? 'Resume' : 'Mark absent'}
        onClose={() => setAskAbsent(false)}
        onConfirm={() => {
          if (!child) return;
          const next = !child.absentToday;
          setAbsentToday(child.id, next);
          setNote(next ? `${child.name} is off the bus today.` : `${child.name} is back on the route.`);
          setAskAbsent(false);
        }}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingBottom: 88 },
  stage: { flex: 1 },
  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  bannerText: { ...typography.bodyBold, color: colors.warning, backgroundColor: 'transparent' },
  mapWrap: { flex: 1, margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  map: { flex: 1 },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { ...typography.bodyBold, flex: 1, marginRight: spacing.sm },
  meta: { ...typography.caption, marginTop: 4 },
  eta: { ...typography.heading, color: portalAccents.parent.from, marginTop: spacing.xs },
  waiting: { ...typography.caption, color: colors.success, marginTop: spacing.sm },
  dialRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  switch: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: 3 },
  switchOn: { backgroundColor: portalAccents.parent.from },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.white },
  knobOn: { alignSelf: 'flex-end' },
  dial: { marginLeft: 'auto', width: 32, height: 32, borderRadius: 16, backgroundColor: portalAccents.parent.from, alignItems: 'center', justifyContent: 'center' },
  secondary: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  secondaryText: { ...typography.bodyBold, color: portalAccents.parent.from, backgroundColor: 'transparent' },
  primary: { borderRadius: radius.md, overflow: 'hidden' },
  primaryFill: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  primaryText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  disabled: { opacity: 0.55 },
  note: { ...typography.caption, marginTop: spacing.sm },
  lock: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,251,235,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  lockTitle: { ...typography.heading, color: colors.warning, backgroundColor: 'transparent' },
  lockBody: { ...typography.body, marginTop: spacing.sm },
  pingCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderWidth: 1.5, borderColor: colors.warning, padding: spacing.md },
  homeCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderWidth: 1.5, borderColor: colors.success, padding: spacing.md },
  quote: { ...typography.body, fontStyle: 'italic', backgroundColor: colors.warningBg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm },
  homeQuote: { ...typography.body, fontStyle: 'italic', backgroundColor: colors.successBg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm },
  pingActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  coming: { flex: 1, minHeight: 36, borderRadius: radius.full, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  notComing: { flex: 1, minHeight: 36, borderRadius: radius.full, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  other: { flex: 1, minHeight: 36, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  otherInput: { minHeight: 40, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.sm, marginTop: spacing.sm, color: colors.textPrimary, backgroundColor: palette.white },
});
