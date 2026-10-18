import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { BusDetail, SearchField, SHEET } from '@/components/gateman/sheets';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { BusStatus, useGatemanStore } from '@/store/gateman.store';
import { useConductorStore } from '@/store/conductor.store';

const FILTERS: Array<BusStatus | 'All'> = ['All', 'En Route', 'At School', 'Delayed', 'Offline', 'Standby'];

export default function FleetScreen() {
  const buses = useGatemanStore((state) => state.buses);
  const areas = useGatemanStore((state) => state.areas);
  const pinned = useGatemanStore((state) => state.pinnedBusIds);
  const createArea = useGatemanStore((state) => state.createArea);
  const updateArea = useGatemanStore((state) => state.updateArea);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const [busId, setBusId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | 'new' | null>(null);
  const [editing, setEditing] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [mapOn, setMapOn] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const routeStudents = useConductorStore((state) => state.studentManifest);
  const setRouteOrder = useConductorStore((state) => state.setRouteOrder);
  const [routeIds, setRouteIds] = useState<string[]>([]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...buses]
      .filter((bus) => filter === 'All' || bus.status === filter || (filter === 'En Route' && bus.status === 'Active'))
      .filter((bus) => !needle || `${bus.busNumber} ${bus.conductorName} ${bus.routeName} ${bus.areaName}`.toLowerCase().includes(needle))
      .sort((a, b) => Number(pinned.includes(b.id)) - Number(pinned.includes(a.id)));
  }, [buses, filter, query, pinned]);

  const area = areas.find((item) => item.id === areaId);
  const areaBuses = buses.filter((bus) => area?.busIds.includes(bus.id));
  const areaVisible = areaBuses.filter((bus) => `${bus.busNumber} ${bus.conductorName}`.toLowerCase().includes(areaQuery.trim().toLowerCase()));

  function openCreate() {
    setAreaName('');
    setSelected([]);
    setEditing(true);
    setAreaId('new');
  }

  function openArea(id: string) {
    const found = areas.find((item) => item.id === id);
    setAreaName(found?.name ?? '');
    setSelected(found?.busIds ?? []);
    setAreaQuery('');
    setEditing(false);
    setAreaId(id);
  }

  function saveArea() {
    if (!areaName.trim()) return;
    if (areaId === 'new') createArea(areaName.trim(), selected);
    else if (areaId) updateArea(areaId, areaName.trim(), selected);
    setEditing(false);
    if (areaId === 'new') setAreaId(null);
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Fleet</Text>
          <NotificationBell />
        </View>
        <View style={styles.pad}>
          <View style={styles.kpis}>
            <Kpi label="Fleet" value={buses.length} />
            <Kpi label="En route" value={buses.filter((bus) => bus.status === 'En Route' || bus.status === 'Active').length} />
            <Kpi label="At school" value={buses.filter((bus) => bus.status === 'At School' || bus.status === 'Standby').length} />
            <Kpi label="Delayed" value={buses.filter((bus) => bus.status === 'Delayed' || bus.status === 'Offline').length} />
          </View>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search 48 buses or conductors" />
          <View style={styles.pills}>
            {FILTERS.map((item) => (
              <AnimatedPressable key={item} haptic="selection" onPress={() => setFilter(item)} style={[styles.pill, filter === item ? styles.pillOn : null]}>
                <Text style={styles.pillText}>{item === 'Delayed' ? 'Delayed' : item}</Text>
              </AnimatedPressable>
            ))}
          </View>
          <View style={styles.pills}>
            <AnimatedPressable haptic="selection" onPress={openCreate} style={styles.pillOn}>
              <Text style={styles.pillText}>+ Create area</Text>
            </AnimatedPressable>
            {areas.map((item) => (
              <AnimatedPressable key={item.id} haptic="selection" onPress={() => openArea(item.id)} style={styles.pill}>
                <Text style={styles.pillText}>{item.name}</Text>
              </AnimatedPressable>
            ))}
            <AnimatedPressable haptic="selection" onPress={() => { setRouteIds([...routeStudents].sort((a, b) => a.orderIndex - b.orderIndex).map((item) => item.id)); setRouteOpen(true); }} style={styles.pill}>
              <Text style={styles.pillText}>Design route</Text>
            </AnimatedPressable>
            <AnimatedPressable haptic="selection" onPress={() => setMapOn(true)} style={styles.pill}>
              <Text style={styles.pillText}>Map</Text>
            </AnimatedPressable>
          </View>
        </View>
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.list}
          initialNumToRender={14}
          renderItem={({ item }) => (
            <AnimatedPressable haptic="selection" onPress={() => setBusId(item.id)} style={styles.card}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.busNumber.slice(-2)}</Text></View>
              <View style={styles.main}>
                <Text style={styles.body}>{item.busNumber}{pinned.includes(item.id) ? ' · Pinned' : ''}</Text>
                <Text style={[styles.badge, item.status === 'Delayed' || item.status === 'Offline' ? styles.badgeBad : item.status === 'At School' || item.status === 'Standby' ? styles.badgeGood : styles.badgeWait]}>{item.status}</Text>
                <Text style={styles.meta}>{item.routeName}</Text>
                <Text style={styles.meta}>{item.conductorName}</Text>
              </View>
              <View style={styles.side}>
                <Text style={styles.body}>{item.boardedCount}/{item.totalStudents}</Text>
                <Text style={styles.meta}>boarded</Text>
                <Text style={styles.meta}>Dep {item.departureTime}</Text>
                <Text style={styles.link}>Inspect</Text>
              </View>
            </AnimatedPressable>
          )}
        />
      </SafeAreaView>

      <GlassModal visible={busId !== null} fill scroll={false} maxHeight={SHEET} title="Bus" onClose={() => setBusId(null)}>
        {busId ? <BusDetail busId={busId} /> : null}
      </GlassModal>

      <GlassModal visible={mapOn} fill scroll={false} maxHeight={SHEET} title="Fleet map" onClose={() => setMapOn(false)}>
        <MapView style={styles.map} provider={undefined} initialRegion={{ latitude: 28.55, longitude: 77.15, latitudeDelta: 0.5, longitudeDelta: 0.5 }}>
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
          {rows.slice(0, 40).map((bus) => (
            <Marker key={bus.id} coordinate={{ latitude: bus.coordinates.lat, longitude: bus.coordinates.lng }} title={bus.busNumber} onPress={() => { setMapOn(false); setBusId(bus.id); }} />
          ))}
        </MapView>
      </GlassModal>

      <GlassModal visible={areaId !== null} fill scroll={false} maxHeight={SHEET} title={editing ? 'Edit area' : area?.name ?? 'Area'} onClose={() => { setAreaId(null); setEditing(false); }}>
        <View style={styles.flex}>
          {!editing && areaId !== 'new' ? (
            <View style={styles.editRow}>
              <SearchField value={areaQuery} onChangeText={setAreaQuery} placeholder="Search this area" />
              <AnimatedPressable haptic="selection" onPress={() => setEditing(true)} style={styles.pen}><Text style={styles.link}>✎ Edit</Text></AnimatedPressable>
            </View>
          ) : (
            <SearchField value={areaName} onChangeText={setAreaName} placeholder="Area name" />
          )}
          <FlatList
            data={editing || areaId === 'new' ? buses.filter((bus) => `${bus.busNumber} ${bus.routeName}`.toLowerCase().includes(areaQuery.trim().toLowerCase())) : areaVisible}
            keyExtractor={(item) => item.id}
            bounces={false}
            style={styles.flex}
            renderItem={({ item }) => (
              <AnimatedPressable
                haptic="selection"
                onPress={() => {
                  if (!editing && areaId !== 'new') setBusId(item.id);
                  else setSelected((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]);
                }}
                style={styles.row}
              >
                <Text style={styles.body}>{(editing || areaId === 'new') && selected.includes(item.id) ? 'Selected · ' : ''}{item.busNumber}</Text>
                <Text style={styles.meta}>{item.routeName} · {item.conductorName}</Text>
              </AnimatedPressable>
            )}
          />
          {editing || areaId === 'new' ? (
            <AnimatedPressable haptic="medium" onPress={saveArea} style={styles.primary}><Text style={styles.primaryText}>Save area</Text></AnimatedPressable>
          ) : null}
        </View>
      </GlassModal>
      <GlassModal visible={routeOpen} fill scroll={false} maxHeight="88%" title="Design Bus 7 route" onClose={() => setRouteOpen(false)}>
        <Text style={styles.meta}>Morning and afternoon both run school, then these students in order, then school.</Text>
        <FlatList
          data={routeIds}
          keyExtractor={(item) => item}
          bounces={false}
          style={styles.flex}
          renderItem={({ item, index }) => {
            const student = routeStudents.find((row) => row.id === item);
            return (
              <View style={styles.row}>
                <Text style={styles.body}>{index + 1}. {student?.name ?? item}</Text>
                <AnimatedPressable haptic="selection" onPress={() => setRouteIds((ids) => { if (index === 0) return ids; const next = [...ids]; const swap = next[index - 1]; next[index - 1] = next[index]!; next[index] = swap!; return next; })}><Text style={styles.link}>Up</Text></AnimatedPressable>
              </View>
            );
          }}
        />
        <AnimatedPressable haptic="medium" onPress={() => { setRouteOrder(routeIds); setRouteOpen(false); }} style={styles.primary}><Text style={styles.primaryText}>Save route order</Text></AnimatedPressable>
      </GlassModal>
    </MeshBackground>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <View style={styles.kpi}><Text style={styles.body}>{value}</Text><Text style={styles.meta}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.heading },
  pad: { paddingHorizontal: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 150 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillOn: { borderColor: portalAccents.gateman.from, backgroundColor: colors.warningBg, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillText: { ...typography.caption, color: colors.textPrimary },
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  kpis: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  kpi: { flex: 1, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.xs },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.caption, color: portalAccents.gateman.from, fontWeight: '700' },
  main: { flex: 1 },
  side: { alignItems: 'flex-end' },
  badge: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, marginTop: 2, ...typography.caption, fontWeight: '700' },
  badgeWait: { backgroundColor: '#FFF7ED', color: '#EA580C' },
  badgeGood: { backgroundColor: '#ECFDF5', color: '#059669' },
  badgeBad: { backgroundColor: '#FEF2F2', color: '#DC2626' },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  link: { ...typography.bodyBold, color: portalAccents.gateman.from, backgroundColor: 'transparent' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pen: { minHeight: 44, justifyContent: 'center' },
  map: { flex: 1, borderRadius: radius.lg, overflow: 'hidden' },
  primary: { minHeight: 46, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.sm },
  primaryText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
