import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useLiveTracking } from '@/hooks/use-live-tracking';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { StatusPill } from '@/components/shared/StatusPill';
import { colors, glass, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';

/**
 * Parent Live Tracking Screen
 * Shows the real-time position of the child's school bus on a map with
 * a floating glassmorphic overlay for trip status and live telemetry.
 */
export default function ParentTrackingScreen() {
  const { buses } = useLiveTracking();
  const busEntries = Object.entries(buses);
  const isLive = busEntries.length > 0;

  return (
    <MeshBackground>
      <View style={styles.container}>
        {/* MapView fills top 60% of the screen */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 19.0760, // Mumbai default
            longitude: 72.8777,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {busEntries.map(([busId, coords]) => (
            <Marker
              key={busId}
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
              title="School Bus"
              description="Live Location"
            >
              <View style={styles.markerContainer}>
                <LinearGradient
                  colors={[portalAccents.parent.from, '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.markerBubble, shadows.md]}
                >
                  <Text style={styles.busEmoji}>🚌</Text>
                </LinearGradient>
                <View style={styles.markerArrow} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Decorative orbs behind floating overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: 220,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: radius.full,
            backgroundColor: glass.orb1,
            opacity: 0.5,
          }}
          pointerEvents="none"
        />
        <View
          style={{
            position: 'absolute',
            bottom: 40,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: radius.full,
            backgroundColor: glass.orb3,
            opacity: 0.45,
          }}
          pointerEvents="none"
        />

        {/* Floating glass overlay at bottom, overlapping map bottom edge */}
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <GlassCard style={[styles.card, shadows.lg]}>
            {/* Header row: Bus Status title + green dot indicator */}
            <View style={styles.statusHeaderRow}>
              <View style={styles.statusTitleWithDot}>
                {isLive ? (
                  <View style={styles.greenDot} />
                ) : (
                  <View style={styles.idleDot} />
                )}
                <Text style={typography.overline}>Bus Status</Text>
              </View>
              <StatusPill
                variant={isLive ? 'online' : 'offline'}
                label={isLive ? 'Active Transit' : 'Idle'}
              />
            </View>

            {/* Status text */}
            <Text style={[typography.heading, styles.statusHeading]}>
              {isLive ? '🟢 On Route' : '⏳ No active trip'}
            </Text>

            {/* ETA Row with StatusPill */}
            <View style={styles.etaRow}>
              <View style={styles.etaInfo}>
                <Text style={typography.caption}>Estimated Arrival</Text>
                <Text style={typography.bodyBold}>
                  {isLive ? '8:15 AM (approx. 12 mins)' : 'Awaiting trip start'}
                </Text>
              </View>
              <StatusPill variant="info" label="Tracking Live" />
            </View>

            {/* Mini-chips metrics strip */}
            <View style={styles.metricsStrip}>
              <View style={styles.metricChip}>
                <Text style={typography.overline}>Students</Text>
                <Text style={[typography.label, styles.metricValue]}>
                  {isLive ? '18 / 32' : '0'}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricChip}>
                <Text style={typography.overline}>Speed</Text>
                <Text style={[typography.label, styles.metricValue]}>
                  {isLive ? '28 km/h' : '0 km/h'}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricChip}>
                <Text style={typography.overline}>Last Update</Text>
                <Text style={[typography.label, styles.metricValue]}>
                  {isLive ? 'Just now' : '--'}
                </Text>
              </View>
            </View>

            {/* Interactive recenter / details button */}
            <AnimatedPressable
              onPress={() => {}}
              style={[styles.btn, shadows.sm]}
            >
              <LinearGradient
                colors={[portalAccents.parent.from, '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnInner}
              >
                <Text style={styles.btnText}>
                  {isLive ? 'View Route Schedule' : 'Trip Details'}
                </Text>
              </LinearGradient>
            </AnimatedPressable>
          </GlassCard>
        </View>
      </View>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: '62%',
    width: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBubble: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  busEmoji: {
    fontSize: 22,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2563EB',
    marginTop: -2,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    gap: spacing.md,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTitleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  idleDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.textPlaceholder,
  },
  statusHeading: {
    marginTop: spacing.xxs,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  etaInfo: {
    gap: spacing.xxs,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  metricChip: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metricValue: {
    color: colors.textPrimary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },
  btn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  btnInner: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
