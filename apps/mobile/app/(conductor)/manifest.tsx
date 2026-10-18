import { memo, useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { ManifestStudent, useConductorStore } from '@/store/conductor.store';

type Bucket = 'Boarded' | 'Absent' | 'Waiting' | null;

export default function RosterScreen() {
  const students = useConductorStore((state) => state.studentManifest);
  const tripLeg = useConductorStore((state) => state.tripLeg);
  const setTripLeg = useConductorStore((state) => state.setTripLeg);
  const [query, setQuery] = useState('');
  const [bucket, setBucket] = useState<Bucket>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const ordered = useMemo(() => [...students].sort((a, b) => a.orderIndex - b.orderIndex), [students]);
  const boarded = ordered.filter((item) => item.boardingStatus === 'Boarded' || item.boardingStatus === 'Dropped').length;
  const absent = ordered.filter((item) => item.boardingStatus === 'Absent').length;
  const waiting = ordered.filter((item) => item.boardingStatus === 'Waiting' || item.boardingStatus === 'Approaching' || item.boardingStatus === 'Pinged').length;
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ordered.filter((item) => !needle || `${item.name} ${item.rollNumber} ${item.parentName}`.toLowerCase().includes(needle));
  }, [ordered, query]);
  const modalRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ordered.filter((item) => {
      const match = !needle || item.name.toLowerCase().includes(needle);
      if (!match) return false;
      if (bucket === 'Boarded') return item.boardingStatus === 'Boarded' || item.boardingStatus === 'Dropped';
      if (bucket === 'Absent') return item.boardingStatus === 'Absent';
      if (bucket === 'Waiting') return item.boardingStatus === 'Waiting' || item.boardingStatus === 'Approaching' || item.boardingStatus === 'Pinged';
      return false;
    });
  }, [ordered, bucket, query]);
  const open = students.find((item) => item.id === openId);

  return (
    <MeshBackground>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        bounces={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={7}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.kpis}>
              <Stat label="Boarded" value={boarded} color={colors.success} onPress={() => setBucket('Boarded')} />
              <Stat label="Absent" value={absent} color={colors.error} onPress={() => setBucket('Absent')} />
              <Stat label="Awaiting" value={waiting} color={colors.warning} onPress={() => setBucket('Waiting')} />
            </View>
            <View style={styles.leg}>
              {(['Morning pickup', 'Afternoon drop'] as const).map((item) => (
                <AnimatedPressable key={item} haptic="selection" onPress={() => setTripLeg(item)} style={[styles.legBtn, tripLeg === item ? styles.legOn : null]}>
                  <Text style={styles.legText}>{item === 'Morning pickup' ? 'Morning boarding' : 'Afternoon drop'}</Text>
                </AnimatedPressable>
              ))}
            </View>
            <AppTextInput value={query} onChangeText={setQuery} placeholder="Search name, roll, or parent" placeholderTextColor={colors.textPlaceholder} style={styles.search} />
            <Text style={styles.meta}>School, then students in route order, then school again.</Text>
          </View>
        }
        renderItem={({ item }) => <RosterRow student={item} onPress={setOpenId} />}
      />
      <GlassModal visible={bucket !== null} fill scroll={false} maxHeight="88%" title={bucket ?? ''} onClose={() => setBucket(null)}>
        <FlatList data={modalRows} keyExtractor={(item) => item.id} bounces={false} style={styles.flex} renderItem={({ item }) => <RosterRow student={item} onPress={setOpenId} />} />
      </GlassModal>
      <GlassModal visible={Boolean(open)} fill maxHeight="88%" title={open?.name ?? 'Student'} onClose={() => setOpenId(null)}>
        {open ? (
          <View>
            <Text style={styles.name}>{open.grade} · Roll {open.rollNumber} · Stop {open.orderIndex}</Text>
            <Text style={styles.meta}>{open.scheduledTime} · {open.boardingStatus}</Text>
            <Text style={styles.meta}>{open.stopAddress}</Text>
            <Text style={styles.meta}>{open.parentName} · {open.parentPhone}</Text>
            {open.specialNote ? <Text style={styles.note}>{open.specialNote}</Text> : null}
            <View style={styles.map}>
              <MapView style={styles.mapFill} provider={undefined} pointerEvents="none" region={{ latitude: 28.55 + open.orderIndex * 0.001, longitude: 77.08, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
                <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                <Marker coordinate={{ latitude: 28.55 + open.orderIndex * 0.001, longitude: 77.08 }} title={open.name} />
              </MapView>
            </View>
            <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${open.parentPhone}`)} style={styles.call}><Text style={styles.white}>Call parent</Text></AnimatedPressable>
            <Text style={styles.meta}>{open.lastUpdated ? `Last mark ${new Date(open.lastUpdated).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : 'No mark yet today'}</Text>
          </View>
        ) : null}
      </GlassModal>
    </MeshBackground>
  );
}

const RosterRow = memo(function RosterRow({ student, onPress }: { student: ManifestStudent; onPress: (id: string) => void }) {
  const tone = student.boardingStatus === 'Boarded' ? styles.good : student.boardingStatus === 'Dropped' || student.boardingStatus === 'Pinged' ? styles.info : student.boardingStatus === 'Absent' ? styles.bad : student.boardingStatus === 'Approaching' ? styles.warn : styles.muted;
  return (
    <AnimatedPressable haptic="selection" onPress={() => onPress(student.id)} style={styles.row}>
      <LinearGradient colors={[portalAccents.conductor.from, portalAccents.conductor.to]} style={styles.avatar}><Text style={styles.avatarText}>{student.name.slice(0, 1)}</Text></LinearGradient>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>{student.orderIndex}. {student.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{student.grade} · Roll {student.rollNumber} · {student.scheduledTime}</Text>
      </View>
      <Text style={[styles.chip, tone]}>{student.boardingStatus}</Text>
      <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${student.parentPhone}`)}><Text style={styles.callText}>Call</Text></AnimatedPressable>
      <Text style={styles.chev}>›</Text>
    </AnimatedPressable>
  );
});

function Stat({ label, value, color, onPress }: { label: string; value: number; color: string; onPress: () => void }) {
  return <AnimatedPressable haptic="light" onPress={onPress} style={styles.stat}><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.meta}>{label}</Text></AnimatedPressable>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: 140 },
  kpis: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, padding: spacing.sm, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong },
  statValue: { ...typography.heading },
  leg: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  legBtn: { flex: 1, minHeight: 36, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  legOn: { borderColor: portalAccents.conductor.from, backgroundColor: colors.successBg },
  legText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  search: { minHeight: 44, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.textPrimary, backgroundColor: palette.white },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 64, marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  main: { flex: 1 },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  note: { ...typography.body, marginTop: spacing.sm },
  chip: { ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, fontWeight: '700' },
  good: { backgroundColor: colors.successBg, color: colors.success },
  bad: { backgroundColor: colors.errorBg, color: colors.error },
  warn: { backgroundColor: colors.warningBg, color: colors.warning },
  info: { backgroundColor: colors.infoBg, color: colors.info },
  muted: { backgroundColor: colors.neutralBg, color: colors.textMuted },
  callText: { ...typography.caption, color: portalAccents.conductor.from, fontWeight: '700' },
  chev: { ...typography.heading, color: colors.textMuted, backgroundColor: 'transparent' },
  map: { height: 180, borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.md },
  mapFill: { flex: 1 },
  call: { marginTop: spacing.md, minHeight: 42, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center' },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
