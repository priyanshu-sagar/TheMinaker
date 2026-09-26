import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { glass } from '@/design/glass-theme';
import { colors, spacing } from '@/design/gateman-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
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
                  pinColor={bus.status === 'Online' ? '#10B981' : '#EF4444'}
                />
              ))}
            </MapView>
            <Pressable style={styles.expandBtn} onPress={() => setExpanded(true)}>
              <Text style={styles.expandIcon}>⤢</Text>
            </Pressable>
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
          renderItem={({ item }) => <BusRouteListItem bus={item} onPress={() => setSelectedBus(item)} />}
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
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  metrics: { flexDirection: 'row', gap: spacing.md },
  mapShadow: {
    height: 220,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    shadowColor: glass.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  mapWrap: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  map: { flex: 1 },
  expandBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: { fontSize: 16, color: colors.textPrimary },
  searchWrap: { marginTop: spacing.md, marginHorizontal: spacing.lg },
  list: { flex: 1, marginTop: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  empty: { textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
});
