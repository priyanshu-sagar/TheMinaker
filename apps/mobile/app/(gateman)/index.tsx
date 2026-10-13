import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows, glass, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { MetricChip } from '@/components/gateman/MetricChip';
import { BusRouteListItem } from '@/components/gateman/BusRouteListItem';
import { SearchBar } from '@/components/glass/SearchBar';
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

export default function LiveFleetScreen() {
  const fleet = useGatemanStore((state) => state.fleet);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [selectedBus, setSelectedBus] = useState<FleetBus | null>(null);

  const { onlineCount, offlineCount } = useMemo(
    () => ({
      onlineCount: fleet.filter((bus) => bus.status === 'Online').length,
      offlineCount: fleet.filter((bus) => bus.status === 'Offline').length,
    }),
    [fleet],
  );

  const filteredFleet = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fleet;
    return fleet.filter(
      (bus) =>
        bus.routeName.toLowerCase().includes(q) ||
        bus.busNumber.toLowerCase().includes(q) ||
        bus.conductorName.toLowerCase().includes(q),
    );
  }, [fleet, query]);

  return (
    <MeshBackground>
      {/* Decorative orbs */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Fleet</Text>
          <View style={styles.metrics}>
            <MetricChip label="Online" count={onlineCount} tone="online" />
            <MetricChip label="Offline" count={offlineCount} tone="offline" />
          </View>
        </View>

        <View style={styles.mapShadow}>
          <View style={styles.mapWrap}>
            <MapView style={styles.map} provider={undefined} initialRegion={INITIAL_REGION}>
              <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
              {fleet.map((bus) => (
                <Marker
                  key={bus.id}
                  coordinate={{ latitude: bus.coordinates.lat, longitude: bus.coordinates.lng }}
                  title={bus.busNumber}
                  description={`${bus.routeName} · ${bus.conductorName}`}
                  pinColor={bus.status === 'Online' ? colors.online : colors.offline}
                />
              ))}
            </MapView>
            <AnimatedPressable style={styles.expandBtn} onPress={() => setExpanded(true)}>
              <Text style={styles.expandIcon}>⤢</Text>
            </AnimatedPressable>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search route, bus number, or conductor" />
        </View>

        <FlatList
          data={filteredFleet}
          keyExtractor={(bus) => bus.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<Text style={styles.empty}>No buses match your search.</Text>}
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <BusRouteListItem bus={item} onPress={() => setSelectedBus(item)} />
            </FadeInRow>
          )}
        />
      </SafeAreaView>

      <FullScreenMapModal visible={expanded} fleet={fleet} onClose={() => setExpanded(false)} />
      <BusDetailsModal bus={selectedBus} onClose={() => setSelectedBus(null)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  title: { ...typography.title, color: colors.textPrimary },
  metrics: { flexDirection: 'row', gap: spacing.md },
  mapShadow: {
    height: 220,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  mapWrap: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  map: { flex: 1 },
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
  expandIcon: { fontSize: 16, color: colors.textPrimary },
  searchWrap: { marginTop: spacing.md, marginHorizontal: spacing.lg },
  list: { flex: 1, marginTop: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  empty: { ...typography.body, textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
});
