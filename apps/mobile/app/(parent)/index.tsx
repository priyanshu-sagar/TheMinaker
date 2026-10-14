import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { StatusPill } from '@/components/shared/StatusPill';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { colors, glass, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useActiveChild, useParentStore } from '@/store/parent.store';

export default function ParentLiveScreen() {
  const child = useActiveChild();
  const transit = useParentStore((state) => state.liveTransit);
  const markAbsentToday = useParentStore((state) => state.markAbsentToday);
  const confirmWaitingAtStop = useParentStore((state) => state.confirmWaitingAtStop);
  const pickupCode = useParentStore((state) => state.pickupCode);
  const [note, setNote] = useState<string | null>(null);

  const nearby = !child?.absentToday && transit.status === 'En route' && transit.distanceToStop <= 600;
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
        <ChildSwitcher />
        {nearby ? (
          <Animated.View entering={FadeInDown.duration(320)} style={[styles.banner, glow]}>
            <Text style={styles.bannerText}>Bus is arriving soon. Please reach the boarding point.</Text>
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
          {child?.waitingAtStop ? <Text style={styles.waiting}>Marked waiting at the stop. The conductor can see this.</Text> : null}
          <Text style={styles.code}>Trusted pickup code {pickupCode}</Text>
          <View style={styles.actions}>
            <AnimatedPressable
              haptic="medium"
              disabled={!child || child.absentToday}
              onPress={() => child && confirmWaitingAtStop(child.id)}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>I am at the stop</Text>
            </AnimatedPressable>
            <AnimatedPressable
              haptic="medium"
              disabled={!child || child.absentToday}
              onPress={() => {
                if (!child) return;
                markAbsentToday(child.id);
                setNote(`${child.name} is off today's bus. The conductor's list updates locally.`);
              }}
              style={[styles.primary, child?.absentToday ? styles.disabled : null]}
            >
              <Text style={styles.primaryText}>{child?.absentToday ? 'Marked absent today' : 'Not taking bus today'}</Text>
            </AnimatedPressable>
          </View>
          {note ? <Text style={styles.note}>{note}</Text> : null}
        </GlassCard>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingBottom: 88 },
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
  code: { ...typography.caption, marginTop: spacing.sm },
  actions: { marginTop: spacing.md },
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
  primary: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  disabled: { opacity: 0.55 },
  note: { ...typography.caption, marginTop: spacing.sm },
});
