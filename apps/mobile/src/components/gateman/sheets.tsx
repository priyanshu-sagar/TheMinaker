import { ReactNode, useMemo } from 'react';
import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { GateBus, GateStudent, useGatemanStore } from '@/store/gateman.store';

export const SHEET = '88%' as const;
export const SEARCH_SHEET = '90%' as const;

export function SearchField({ value, onChangeText, placeholder, autoFocus }: { value: string; onChangeText: (value: string) => void; placeholder: string; autoFocus?: boolean }) {
  return (
    <AppTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textPlaceholder}
      autoFocus={autoFocus}
      style={styles.search}
    />
  );
}

export function BusDetail({ busId, onStudent }: { busId: string; onStudent?: (id: string) => void }) {
  const buses = useGatemanStore((state) => state.buses);
  const allStudents = useGatemanStore((state) => state.students);
  const bus = useMemo(() => buses.find((item) => item.id === busId), [buses, busId]);
  const students = useMemo(() => allStudents.filter((item) => item.busId === busId), [allStudents, busId]);
  const gateOpen = useGatemanStore((state) => state.gateOpen);
  const markBusAtSchool = useGatemanStore((state) => state.markBusAtSchool);
  const togglePin = useGatemanStore((state) => state.togglePin);
  const pinned = useGatemanStore((state) => state.pinnedBusIds.includes(busId));
  if (!bus) return null;
  return (
    <View style={styles.detail}>
      <Text style={styles.title}>{bus.busNumber}</Text>
      <Text style={styles.meta}>{bus.routeName} · {bus.areaName}</Text>
      <Text style={styles.meta}>{gateOpen ? `${bus.status} · ${bus.speedKmh} km/h · ETA ${bus.etaMinutes} min` : 'Tracking paused while the gate is closed'}</Text>
      <Text style={styles.meta}>{bus.conductorName}</Text>
      <View style={styles.row}>
        <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${bus.conductorPhone}`)} style={styles.solid}>
          <Text style={styles.solidText}>Call</Text>
        </AnimatedPressable>
        <AnimatedPressable haptic="selection" onPress={() => togglePin(bus.id)} style={styles.ghost}>
          <Text style={styles.ghostText}>{pinned ? 'Unpin' : 'Pin'}</Text>
        </AnimatedPressable>
        {bus.status !== 'At School' && bus.status !== 'Standby' ? (
          <AnimatedPressable haptic="medium" onPress={() => markBusAtSchool(bus.id)} style={styles.ghost}>
            <Text style={styles.ghostText}>At school</Text>
          </AnimatedPressable>
        ) : null}
      </View>
      <View style={styles.map}>
        <MapView style={styles.mapFill} provider={undefined} pointerEvents="none" region={{ latitude: bus.coordinates.lat, longitude: bus.coordinates.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
          <Marker coordinate={{ latitude: bus.coordinates.lat, longitude: bus.coordinates.lng }} />
        </MapView>
      </View>
      <Text style={styles.kicker}>{students.length} students · {bus.boardedCount} boarded</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        bounces={false}
        overScrollMode="never"
        style={styles.flex}
        renderItem={({ item }) => (
          <AnimatedPressable haptic="selection" onPress={() => onStudent?.(item.id)} style={styles.line}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.meta}>{item.grade} · {item.currentStatus} · {item.assignedStop}</Text>
          </AnimatedPressable>
        )}
      />
    </View>
  );
}

export function StudentDetail({ studentId }: { studentId: string }) {
  const students = useGatemanStore((state) => state.students);
  const buses = useGatemanStore((state) => state.buses);
  const routingRequests = useGatemanStore((state) => state.routingRequests);
  const earlyPickups = useGatemanStore((state) => state.earlyPickups);
  const student = useMemo(() => students.find((item) => item.id === studentId), [students, studentId]);
  const bus = useMemo(() => buses.find((item) => item.id === student?.busId), [buses, student?.busId]);
  const requests = useMemo(
    () => routingRequests.filter((item) => item.studentId === studentId && item.status === 'Pending'),
    [routingRequests, studentId],
  );
  const pickups = useMemo(
    () => earlyPickups.filter((item) => item.studentId === studentId && item.status === 'Pending'),
    [earlyPickups, studentId],
  );
  if (!student) return null;
  return (
    <View>
      <View style={styles.dense}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{student.name.slice(0, 1)}</Text></View>
        <View style={styles.denseMain}>
          <Text style={styles.title}>{student.name}</Text>
          <Text style={styles.meta}>{student.grade} · {student.currentStatus}</Text>
          <Text style={styles.meta}>{bus ? `${bus.busNumber} · ${bus.routeName}` : 'No bus assigned'}</Text>
          <Text style={styles.meta}>Stop {student.assignedStop}</Text>
        </View>
        <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${student.parentPhone}`)} style={styles.solid}>
          <Text style={styles.solidText}>Call</Text>
        </AnimatedPressable>
      </View>
      <Text style={styles.meta}>{student.parentName} · {student.parentPhone}</Text>
      {student.offLocation ? <Text style={styles.warn}>Flagged away from the assigned stop{student.offLocationVerified ? ' · verified' : ''}</Text> : null}
      {pickups.map((item) => <Text key={item.id} style={styles.meta}>{item.kind}: {item.reason}</Text>)}
      {requests.map((item) => <Text key={item.id} style={styles.meta}>Pending {item.requestType}</Text>)}
    </View>
  );
}

export function CheckBox({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable haptic="selection" onPress={onPress} style={[styles.box, on ? styles.boxOn : null]}>
      <Text style={styles.boxMark}>{on ? '✓' : ''}</Text>
    </AnimatedPressable>
  );
}

export function SlideToConfirm({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const gesture = Gesture.Pan()
    .onUpdate((event) => { x.value = Math.max(0, Math.min(event.translationX, 220)); })
    .onEnd(() => {
      if (x.value > 170) runOnJS(onConfirm)();
      x.value = withSpring(0, { damping: 16, stiffness: 180 });
    });
  return (
    <View style={styles.track}>
      <Text style={styles.trackLabel}>{label}</Text>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.knob, style]} />
      </GestureDetector>
    </View>
  );
}

export function SheetList<T>({ data, keyOf, render }: { data: T[]; keyOf: (item: T) => string; render: (item: T) => ReactNode }) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyOf}
      bounces={false}
      overScrollMode="never"
      style={styles.flex}
      initialNumToRender={12}
      windowSize={7}
      renderItem={({ item }) => <>{render(item)}</>}
    />
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, color: colors.textPrimary, marginBottom: spacing.sm },
  detail: { flex: 1 },
  flex: { flex: 1 },
  title: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  kicker: { ...typography.overline, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  solid: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  solidText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  ghost: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  ghostText: { ...typography.bodyBold },
  chip: { alignSelf: 'flex-start', marginTop: spacing.sm, backgroundColor: portalAccents.gateman.from, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  warn: { ...typography.caption, color: colors.warning, marginTop: spacing.sm },
  map: { height: 150, borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.sm },
  mapFill: { flex: 1 },
  line: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dense: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  denseMain: { flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.warningBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: portalAccents.gateman.from },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  boxOn: { backgroundColor: portalAccents.gateman.from, borderColor: portalAccents.gateman.from },
  boxMark: { color: palette.white, fontSize: 14, fontWeight: '700', backgroundColor: 'transparent' },
  track: { marginTop: spacing.md, height: 48, borderRadius: radius.full, backgroundColor: colors.neutralBg, justifyContent: 'center', overflow: 'hidden' },
  trackLabel: { ...typography.caption, textAlign: 'center' },
  knob: { position: 'absolute', left: 4, width: 40, height: 40, borderRadius: 20, backgroundColor: portalAccents.gateman.from },
});
