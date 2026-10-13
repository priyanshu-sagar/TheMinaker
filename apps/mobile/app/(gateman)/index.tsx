import { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  colors,
  palette,
  spacing,
  radius,
  shadows,
  glass,
  typography,
  portalAccents,
} from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FullScreenMapModal } from '@/components/gateman/FullScreenMapModal';
import { BusDetailsModal } from '@/components/gateman/BusDetailsModal';
import { FleetBus, useGatemanStore } from '@/store/gateman.store';

// Centered over the Delhi-NCR / Agra / Mathura corridor.
const INITIAL_REGION = {
  latitude: 27.95,
  longitude: 77.55,
  latitudeDelta: 3.1,
  longitudeDelta: 2.3,
};

// Mock departure times — sorted ascending so earlier-departing buses show first
const MOCK_DEPARTURE_TIMES: Record<string, string> = {
  'bus-1': '06:30',
  'bus-2': '06:45',
  'bus-3': '07:00',
  'bus-4': '07:15',
  'bus-5': '07:30',
  'bus-6': '07:45',
};

const { height: SCREEN_H } = Dimensions.get('window');
const MAP_H = Math.round(SCREEN_H * 0.38);

export default function CommandCenterScreen() {
  const fleet = useGatemanStore((state) => state.fleet);
  const profileApprovals = useGatemanStore((state) => state.profileApprovals);
  const editRequests = useGatemanStore((state) => state.editRequests);
  const geofenceAlerts = useGatemanStore((state) => state.geofenceAlerts);

  const [expanded, setExpanded] = useState(false);
  const [selectedBus, setSelectedBus] = useState<FleetBus | null>(null);

  const { onlineCount } = useMemo(
    () => ({
      onlineCount: fleet.filter((bus) => bus.status === 'Online').length,
    }),
    [fleet],
  );

  // Sort fleet by departure time for display
  const sortedFleet = useMemo(() => {
    return [...fleet].sort((a, b) => {
      const ta = MOCK_DEPARTURE_TIMES[a.id] ?? '99:99';
      const tb = MOCK_DEPARTURE_TIMES[b.id] ?? '99:99';
      return ta.localeCompare(tb);
    });
  }, [fleet]);

  // Show first 6 in the grid
  const gridFleet = useMemo(() => sortedFleet.slice(0, 6), [sortedFleet]);

  const pendingApprovalsCount = profileApprovals.length + editRequests.length;
  const geofenceAlertsCount = geofenceAlerts.length;

  return (
    <MeshBackground>
      {/* Decorative orbs */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          top: 240,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.45,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* 1. Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Command Center</Text>
            <Text style={styles.subtitle}>Live fleet overview</Text>
          </View>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlinePillText}>{onlineCount} Online</Text>
          </View>
        </View>

        {/* 2. Metric Cards Row */}
        <View style={styles.metricsRow}>
          {/* Card 1: Active Buses */}
          <AnimatedPressable haptic="light" style={styles.metricCardWrap}>
            <GlassCard padded={false} style={[shadows.sm, styles.metricCard]}>
              <View style={styles.metricCardInner}>
                <LinearGradient
                  colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={palette.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M8 6v6M16 6v6M4 11h16M2 18h20M5 18v2M19 18v2M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
                  </Svg>
                </LinearGradient>
                <Text style={styles.metricValue}>{onlineCount}</Text>
                <Text style={styles.metricLabel} numberOfLines={2}>
                  Active Buses
                </Text>
              </View>
            </GlassCard>
          </AnimatedPressable>

          {/* Card 2: Pending Approvals */}
          <AnimatedPressable haptic="light" style={styles.metricCardWrap}>
            <GlassCard padded={false} style={[shadows.sm, styles.metricCard]}>
              <View style={styles.metricCardInner}>
                <LinearGradient
                  colors={[colors.warning, palette.amberLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={palette.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="12" cy="12" r="10" />
                    <Path d="M12 6v6l4 2" />
                  </Svg>
                </LinearGradient>
                <Text style={styles.metricValue}>{pendingApprovalsCount}</Text>
                <Text style={styles.metricLabel} numberOfLines={2}>
                  Approvals
                </Text>
              </View>
            </GlassCard>
          </AnimatedPressable>

          {/* Card 3: Geofence Alerts */}
          <AnimatedPressable haptic="light" style={styles.metricCardWrap}>
            <GlassCard padded={false} style={[shadows.sm, styles.metricCard]}>
              <View style={styles.metricCardInner}>
                <LinearGradient
                  colors={[colors.error, palette.roseLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={palette.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <Path d="M12 8v4M12 16h.01" />
                  </Svg>
                </LinearGradient>
                <Text style={styles.metricValue}>{geofenceAlertsCount}</Text>
                <Text style={styles.metricLabel} numberOfLines={2}>
                  Alerts
                </Text>
              </View>
            </GlassCard>
          </AnimatedPressable>
        </View>

        {/* 3. Map Card (~38% of screen height) */}
        <View style={styles.mapSection}>
          <GlassCard
            padded={false}
            style={[
              shadows.lg,
              styles.mapCard,
              { height: MAP_H, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
            ]}
          >
            <MapView
              style={styles.map}
              provider={undefined}
              initialRegion={INITIAL_REGION}
            >
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              {fleet.map((bus) => (
                <Marker
                  key={bus.id}
                  coordinate={{ latitude: bus.coordinates.lat, longitude: bus.coordinates.lng }}
                  title={bus.busNumber}
                  description={`${bus.routeName} · ${bus.conductorName}`}
                  pinColor={
                    bus.status === 'Online'
                      ? portalAccents.gateman.from
                      : colors.offline
                  }
                  onCalloutPress={() => setSelectedBus(bus)}
                />
              ))}
            </MapView>
            <AnimatedPressable
              style={styles.expandBtn}
              onPress={() => setExpanded(true)}
              haptic="light"
            >
              <Svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.textPrimary}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </Svg>
            </AnimatedPressable>
          </GlassCard>
        </View>

        {/* 4. Fleet Status section header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
          <Text style={[typography.label, { color: colors.textPrimary }]}>Fleet Status</Text>
          <AnimatedPressable onPress={() => setExpanded(true)} haptic="light">
            <Text style={{ ...typography.caption, color: portalAccents.gateman.from, fontWeight: '700' }}>View All</Text>
          </AnimatedPressable>
        </View>

        {/* 3x2 Grid */}
        <View style={styles.fleetGrid}>
          {gridFleet.map((bus) => (
            <AnimatedPressable
              key={bus.id}
              onPress={() => setSelectedBus(bus)}
              haptic="selection"
              style={styles.fleetGridItem}
            >
              <GlassCard style={[shadows.sm, { flex: 1 }]} padded={false}>
                <View style={styles.fleetGridCardInner}>
                  {/* Status dot */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <View style={[styles.statusDot, { backgroundColor: bus.status === 'Online' ? colors.online : colors.offline }]} />
                    <Text style={{ ...typography.overline, fontSize: 9, color: bus.status === 'Online' ? colors.online : colors.offline }}>
                      {bus.status}
                    </Text>
                  </View>
                  {/* Bus number */}
                  <Text style={{ ...typography.caption, fontWeight: '700', color: colors.textPrimary, fontSize: 10 }} numberOfLines={1}>
                    {bus.busNumber}
                  </Text>
                  {/* Departure time */}
                  <Text style={{ ...typography.caption, color: colors.textMuted, fontSize: 9, marginTop: 2 }}>
                    {MOCK_DEPARTURE_TIMES[bus.id] ?? '--:--'}
                  </Text>
                </View>
              </GlassCard>
            </AnimatedPressable>
          ))}
        </View>
      </SafeAreaView>

      <FullScreenMapModal
        visible={expanded}
        fleet={fleet}
        onClose={() => setExpanded(false)}
      />
      <BusDetailsModal
        bus={selectedBus}
        onClose={() => setSelectedBus(null)}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitleWrap: {
    gap: spacing.xxs,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: glass.border,
    ...shadows.sm,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.online,
  },
  onlinePillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  metricCardWrap: {
    flex: 1,
  },
  metricCard: {
    borderRadius: radius.md,
  },
  metricCardInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.hero,
    fontSize: 22,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  mapSection: {
    marginTop: spacing.md,
  },
  mapCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    borderRadius: radius.lg,
  },
  expandBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  fleetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  fleetGridItem: {
    width: '32%', // 3 columns
    minHeight: 70,
  },
  fleetGridCardInner: {
    padding: spacing.sm,
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusFleetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
