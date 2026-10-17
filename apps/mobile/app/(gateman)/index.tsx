import { useMemo, useState, type ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { ConfirmRequest, GlassConfirmModal } from '@/components/gateman/GlassConfirmModal';
import { WalkInSheet } from '@/components/gateman/WalkInSheet';
import { BusDetail, CheckBox, SEARCH_SHEET, SearchField, SHEET, SheetList, StudentDetail } from '@/components/gateman/sheets';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { GateBus, isBusOnCampus, runPhaseOf, useGatemanStore } from '@/store/gateman.store';

type Tile =
  | 'enroute' | 'school' | 'delayed' | 'offline'
  | 'expected' | 'movement' | 'off' | 'hold'
  | 'arrive' | 'delays' | 'visitor' | 'requests' | 'fleet';

type Focus = { kind: 'bus' | 'student'; id: string } | null;

const TILES: Array<{ key: Tile; label: string }> = [
  { key: 'enroute', label: 'En Route' },
  { key: 'school', label: 'At School' },
  { key: 'delayed', label: 'Malfunction' },
  { key: 'offline', label: 'Offline' },
  { key: 'expected', label: 'Expected' },
  { key: 'movement', label: 'Boarded' },
  { key: 'off', label: 'Off stop' },
  { key: 'hold', label: 'Gate hold' },
  { key: 'arrive', label: 'Mark arrived' },
  { key: 'delays', label: 'Delayed' },
  { key: 'visitor', label: 'Walk-in log' },
  { key: 'requests', label: 'Requests' },
];

export default function CommandHubScreen() {
  const width = useWindowDimensions().width;
  const buses = useGatemanStore((state) => state.buses);
  const students = useGatemanStore((state) => state.students);
  const pickups = useGatemanStore((state) => state.earlyPickups);
  const requests = useGatemanStore((state) => state.routingRequests);
  const gateOpen = useGatemanStore((state) => state.gateOpen);
  const pinned = useGatemanStore((state) => state.pinnedBusIds);
  const morningArrivalsClosed = useGatemanStore((state) => state.morningArrivalsClosed);
  const afternoonThresholdMinutes = useGatemanStore((state) => state.afternoonThresholdMinutes);
  const clockOverride = useGatemanStore((state) => state.clockOverride);
  const openGate = useGatemanStore((state) => state.openGate);
  const attemptCloseGate = useGatemanStore((state) => state.attemptCloseGate);
  const markBusAtSchool = useGatemanStore((state) => state.markBusAtSchool);
  const forceRecoverAndClose = useGatemanStore((state) => state.forceRecoverAndClose);
  const markBusesArrived = useGatemanStore((state) => state.markBusesArrived);
  const verifyPickup = useGatemanStore((state) => state.verifyPickup);
  const pingConductor = useGatemanStore((state) => state.pingConductor);
  const verifyOffLocation = useGatemanStore((state) => state.verifyOffLocation);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);
  const setAfternoonThreshold = useGatemanStore((state) => state.setAfternoonThreshold);
  const offLocationFlags = useGatemanStore((state) => state.offLocationFlags);
  const rejectOffLocation = useGatemanStore((state) => state.rejectOffLocation);

  const [tile, setTile] = useState<Tile | 'search' | 'blocked' | null>(null);
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<Focus>(null);
  const [fleetFilter, setFleetFilter] = useState<'All' | 'En Route' | 'At School' | 'Standby'>('All');
  const [picked, setPicked] = useState<string[]>([]);
  const [holdIds, setHoldIds] = useState<string[]>([]);
  const [offIds, setOffIds] = useState<string[]>([]);
  const [banner, setBanner] = useState(true);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);

  const phase = runPhaseOf({ morningArrivalsClosed, gateOpen, clockOverride, afternoonThresholdMinutes });
  const outside = buses.filter((bus) => !isBusOnCampus(bus.status));
  const nextBus = buses.filter((bus) => bus.status === 'En Route' || bus.status === 'Active').sort((a, b) => a.etaMinutes - b.etaMinutes)[0];
  const expected = students.filter((student) => student.busId && !student.absentToday && !student.selfDropOff && !student.earlyPickup);
  const boarded = students.filter((student) => student.boardedAt).sort((a, b) => (b.boardedAt ?? '').localeCompare(a.boardedAt ?? ''));
  const notDropped = expected.filter((student) => !student.droppedAt);
  const offStop = students.filter((student) => student.offLocation && !student.offLocationVerified);
  const holds = pickups.filter((item) => item.status === 'Pending');
  const pendingFlags = useMemo(() => offLocationFlags.filter((item) => item.status === 'Pending'), [offLocationFlags]);
  const counts: Record<string, number> = {
    enroute: buses.filter((bus) => bus.status === 'En Route' || bus.status === 'Active').length,
    school: buses.filter((bus) => bus.status === 'At School' || bus.status === 'Standby').length,
    delayed: buses.filter((bus) => bus.status === 'Delayed').length,
    offline: buses.filter((bus) => bus.status === 'Offline').length,
    expected: expected.length,
    movement: phase === 'morning' ? boarded.length : notDropped.length,
    off: offStop.length,
    hold: holds.length,
    arrive: outside.length,
    delays: buses.filter((bus) => bus.status === 'Delayed').length,
    visitor: 0,
    requests: requests.filter((item) => item.status === 'Pending').length,
  };

  const preview = useMemo(() => {
    const rows = buses.filter((bus) => {
      if (fleetFilter === 'En Route') return bus.status === 'En Route' || bus.status === 'Active';
      if (fleetFilter === 'At School') return bus.status === 'At School';
      if (fleetFilter === 'Standby') return bus.status === 'Standby';
      return bus.status !== 'Standby';
    });
    return [...rows].sort((a, b) => Number(pinned.includes(b.id)) - Number(pinned.includes(a.id))).slice(0, 8);
  }, [buses, fleetFilter, pinned]);

  const needle = query.trim().toLowerCase();
  const busHits = needle.length < 2 ? [] : buses.filter((bus) => `${bus.busNumber} ${bus.routeName} ${bus.areaName}`.toLowerCase().includes(needle)).slice(0, 12);
  const conductorHits = needle.length < 2 ? [] : buses.filter((bus) => bus.conductorName.toLowerCase().includes(needle)).slice(0, 8);
  const studentHits = needle.length < 2 ? [] : students.filter((student) => student.name.toLowerCase().includes(needle)).slice(0, 20);

  function toggleGate(next: boolean) {
    if (next) {
      openGate();
      return;
    }
    const blocked = attemptCloseGate();
    if (blocked.length > 0) setTile('blocked');
  }

  function openTile(key: Tile) {
    setQuery('');
    setFocus(null);
    setPicked([]);
    setTile(key);
  }

  const tileLabel = TILES.find((item) => item.key === tile)?.label ?? 'Fleet';
  const modalTitle = focus ? (focus.kind === 'bus' ? 'Bus' : 'Student') : tile === 'search' ? 'Search' : tile === 'blocked' ? 'Buses still outside' : tileLabel;

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Command Hub</Text>
          <NotificationBell />
        </View>
        <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <AnimatedPressable haptic="selection" onPress={() => { setQuery(''); setFocus(null); setTile('search'); }} style={styles.searchTap}>
            <Text style={styles.searchTapText}>Search students, buses, conductors</Text>
          </AnimatedPressable>

          <View style={styles.gate}>
            <View style={styles.gateCopy}>
              <Text style={styles.kicker}>{gateOpen ? 'Gate open' : 'Gate closed'}</Text>
              <Text style={styles.meta}>{gateOpen ? 'Conductor phones are tracking.' : 'Tracking is paused.'} {phase === 'morning' ? 'Morning run.' : 'Afternoon run.'}</Text>
            </View>
            <Switch value={gateOpen} onValueChange={toggleGate} trackColor={{ true: portalAccents.gateman.from, false: colors.borderStrong }} />
          </View>
          <AnimatedPressable haptic="selection" onPress={() => setAfternoonThreshold(afternoonThresholdMinutes === 13 * 60 ? 12 * 60 : afternoonThresholdMinutes === 12 * 60 ? 14 * 60 : 13 * 60)}>
            <Text style={styles.meta}>Admin afternoon window {String(Math.floor(afternoonThresholdMinutes / 60)).padStart(2, '0')}:{String(afternoonThresholdMinutes % 60).padStart(2, '0')}</Text>
          </AnimatedPressable>

          {nextBus && gateOpen ? (
            <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${nextBus.conductorPhone}`)} style={styles.next}>
              <Text style={styles.body}>Next arrival {nextBus.busNumber} · {nextBus.etaMinutes} min</Text>
              <Text style={styles.link}>Call conductor</Text>
            </AnimatedPressable>
          ) : null}
          {banner && counts.delayed > 0 ? (
            <View style={styles.banner}>
              <Text style={styles.meta}>Traffic delay on the main approach. {counts.delayed} buses are running late.</Text>
              <AnimatedPressable haptic="selection" onPress={() => setBanner(false)}><Text style={styles.link}>Dismiss</Text></AnimatedPressable>
            </View>
          ) : null}

          {pendingFlags.length > 0 ? (
            <View>
              <Text style={styles.section}>Off-location flags ({pendingFlags.length})</Text>
              {pendingFlags.map((flag) => (
                <GlassCard key={flag.id} style={styles.flagCard}>
                  <Text style={styles.body}>{flag.studentName}</Text>
                  <Text style={styles.meta}>{flag.conductorName} · {flag.busNumber} · {flag.distanceMeters}m from {flag.stopName}</Text>
                  <View style={styles.sectionRow}>
                    <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'override', title: 'Verify off-location attendance', summary: `${flag.conductorName} flagged ${flag.studentName} at ${flag.stopName}, ${flag.distanceMeters}m from the official stop. Verify this and ping the parent?`, confirmLabel: 'Verify and ping parent', onConfirm: () => verifyOffLocation(flag.id, 'Verified by the gateman') })}><Text style={styles.link}>Verify</Text></AnimatedPressable>
                    <AnimatedPressable haptic="light" onPress={() => rejectOffLocation(flag.id, 'Dismissed by the gateman')}><Text style={styles.meta}>Dismiss</Text></AnimatedPressable>
                  </View>
                </GlassCard>
              ))}
            </View>
          ) : null}

          <Text style={styles.section}>Quick actions</Text>
          <View style={styles.grid}>
            {TILES.map((item) => (
              <AnimatedPressable key={item.key} haptic="selection" onPress={() => openTile(item.key)} style={[styles.tile, { width: (width - spacing.lg * 2 - spacing.sm * 3) / 4 }]}>
                <Text style={styles.tileCount}>{item.key === 'visitor' ? '+' : counts[item.key]}</Text>
                <Text style={styles.tileLabel}>{item.key === 'movement' ? (phase === 'morning' ? 'Boarded' : 'Not dropped') : item.label}</Text>
              </AnimatedPressable>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>Active fleet</Text>
            <AnimatedPressable haptic="selection" onPress={() => openTile('fleet')}><Text style={styles.link}>View all</Text></AnimatedPressable>
          </View>
          <View style={styles.pills}>
            {(['All', 'En Route', 'At School', 'Standby'] as const).map((item) => (
              <AnimatedPressable key={item} haptic="selection" onPress={() => setFleetFilter(item)} style={[styles.pill, fleetFilter === item ? styles.pillOn : null]}>
                <Text style={styles.pillText}>{item === 'Standby' ? 'Standby' : item}</Text>
              </AnimatedPressable>
            ))}
          </View>
          {preview.map((bus) => (
            <AnimatedPressable key={bus.id} haptic="selection" onPress={() => { setFocus({ kind: 'bus', id: bus.id }); setTile('fleet'); }}>
              <GlassCard style={styles.busCard}>
                <Text style={styles.body}>{bus.busNumber}{pinned.includes(bus.id) ? ' · Pinned' : ''}</Text>
                <Text style={styles.meta}>{bus.routeName} · {bus.status} · {bus.boardedCount}/{bus.totalStudents}</Text>
              </GlassCard>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <GlassModal
        visible={tile !== null}
        fill
        scroll={false}
        maxHeight={tile === 'search' ? SEARCH_SHEET : SHEET}
        title={modalTitle}
        onClose={() => { setTile(null); setFocus(null); }}
      >
        {focus?.kind === 'bus' ? <BusDetail busId={focus.id} onStudent={(id) => setFocus({ kind: 'student', id })} /> : null}
        {focus?.kind === 'student' ? (
          <View style={styles.flex}>
            <StudentDetail studentId={focus.id} />
            <AnimatedPressable haptic="selection" onPress={() => setFocus(null)}><Text style={styles.link}>Back</Text></AnimatedPressable>
          </View>
        ) : null}
        {!focus && tile === 'search' ? (
          <View style={styles.flex}>
            <SearchField autoFocus value={query} onChangeText={setQuery} placeholder="Name, bus number, or conductor" />
            <SheetList
              data={[
                ...studentHits.map((student) => ({ kind: 'student' as const, id: student.id, title: student.name, meta: `${student.grade} · ${student.currentStatus}` })),
                ...busHits.map((bus) => ({ kind: 'bus' as const, id: bus.id, title: bus.busNumber, meta: `${bus.routeName} · ${bus.status}` })),
                ...conductorHits.map((bus) => ({ kind: 'bus' as const, id: bus.id, title: bus.conductorName, meta: `${bus.busNumber} · ${bus.conductorPhone}` })),
              ]}
              keyOf={(item) => `${item.kind}-${item.id}-${item.title}`}
              render={(item) => (
                <AnimatedPressable haptic="selection" onPress={() => setFocus({ kind: item.kind, id: item.id })} style={styles.line}>
                  <Text style={styles.body}>{item.title}</Text>
                  <Text style={styles.meta}>{item.meta}</Text>
                </AnimatedPressable>
              )}
            />
          </View>
        ) : null}
        {!focus && (tile === 'enroute' || tile === 'school' || tile === 'delayed' || tile === 'offline' || tile === 'fleet' || tile === 'delays') ? (
          <BusPicker
            query={query}
            onQuery={setQuery}
            buses={buses.filter((bus) => {
              if (tile === 'enroute') return bus.status === 'En Route' || bus.status === 'Active';
              if (tile === 'school') return bus.status === 'At School' || bus.status === 'Standby';
              if (tile === 'delayed' || tile === 'delays') return bus.status === 'Delayed';
              if (tile === 'offline') return bus.status === 'Offline';
              return true;
            })}
            onOpen={(id) => setFocus({ kind: 'bus', id })}
            onAll={() => setTile('fleet')}
            extra={(bus) => tile === 'delays' ? (
              <AnimatedPressable haptic="medium" onPress={() => { pingConductor(bus.id); setAsk({ tone: 'info', title: 'Ping sent', summary: `${bus.conductorName} was pinged on ${bus.busNumber}.`, confirmLabel: 'OK', onConfirm: () => undefined }); }}>
                <Text style={styles.link}>Ping · {bus.delayReason}</Text>
              </AnimatedPressable>
            ) : null}
          />
        ) : null}
        {!focus && (tile === 'expected' || tile === 'movement') ? (
          <View style={styles.flex}>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search students" />
            <SheetList
              data={(tile === 'expected' ? expected : phase === 'morning' ? boarded : notDropped)
                .filter((student) => student.name.toLowerCase().includes(query.trim().toLowerCase()))
                .sort((a, b) => (b.boardedAt ?? b.lastSeen ?? '').localeCompare(a.boardedAt ?? a.lastSeen ?? ''))}
              keyOf={(item) => item.id}
              render={(student) => (
                <AnimatedPressable haptic="selection" onPress={() => setFocus({ kind: 'student', id: student.id })} style={styles.dense}>
                  <View style={styles.flex}>
                    <Text style={styles.body}>{student.name}</Text>
                    <Text style={styles.meta}>{student.assignedStop}</Text>
                  </View>
                  <Text style={styles.badge}>{student.grade}</Text>
                  <Text style={styles.meta}>{student.boardedAt ? new Date(student.boardedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : student.currentStatus}</Text>
                </AnimatedPressable>
              )}
            />
          </View>
        ) : null}
        {!focus && tile === 'off' ? (
          <SelectSheet
            query={query}
            onQuery={setQuery}
            placeholder="Search flagged students"
            count={offIds.length}
            total={offStop.filter((student) => student.name.toLowerCase().includes(query.trim().toLowerCase())).length}
            onToggleAll={() => {
              const visible = offStop.filter((student) => student.name.toLowerCase().includes(query.trim().toLowerCase())).map((student) => student.id);
              setOffIds(offIds.length === visible.length ? [] : visible);
            }}
            actionLabel={`Verify selected with conductor (${offIds.length})`}
            onAction={() => {
              if (offIds.length === 0) return;
              setAsk({ tone: 'approve', title: 'Verify off-stop', summary: `Log conductor verification for ${offIds.length} students.`, confirmLabel: 'Confirm verify', onConfirm: () => { offIds.forEach((id) => verifyOffLocation(id, 'Conductor confirmed the stop exception.')); setOffIds([]); } });
            }}
          >
            <SheetList
              data={offStop.filter((student) => student.name.toLowerCase().includes(query.trim().toLowerCase()))}
              keyOf={(item) => item.id}
              render={(student) => (
                <View style={styles.dense}>
                  <CheckBox on={offIds.includes(student.id)} onPress={() => setOffIds((rows) => rows.includes(student.id) ? rows.filter((id) => id !== student.id) : [...rows, student.id])} />
                  <AnimatedPressable haptic="selection" onPress={() => setFocus({ kind: 'student', id: student.id })} style={styles.flex}>
                    <Text style={styles.body}>{student.name}</Text>
                    <Text style={styles.meta}>{student.grade} · {student.assignedStop}</Text>
                  </AnimatedPressable>
                  <Text style={styles.badge}>Off stop</Text>
                </View>
              )}
            />
          </SelectSheet>
        ) : null}
        {!focus && tile === 'hold' ? (
          <SelectSheet
            query={query}
            onQuery={setQuery}
            placeholder="Search gate holds"
            count={holdIds.length}
            total={holds.filter((item) => item.studentName.toLowerCase().includes(query.trim().toLowerCase())).length}
            onToggleAll={() => {
              const visible = holds.filter((item) => item.studentName.toLowerCase().includes(query.trim().toLowerCase())).map((item) => item.id);
              setHoldIds(holdIds.length === visible.length ? [] : visible);
            }}
            actionLabel={`Verify all selected (${holdIds.length})`}
            onAction={() => {
              if (holdIds.length === 0) return;
              setAsk({ tone: 'approve', title: 'Verify holds', summary: `Verify ${holdIds.length} students at the gate.`, confirmLabel: 'Confirm verify', onConfirm: () => { holdIds.forEach((id) => verifyPickup(id)); setHoldIds([]); } });
            }}
          >
            <SheetList
              data={holds.filter((item) => item.studentName.toLowerCase().includes(query.trim().toLowerCase()))}
              keyOf={(item) => item.id}
              render={(item) => (
                <View style={styles.dense}>
                  <CheckBox on={holdIds.includes(item.id)} onPress={() => setHoldIds((rows) => rows.includes(item.id) ? rows.filter((id) => id !== item.id) : [...rows, item.id])} />
                  <View style={styles.flex}>
                    <Text style={styles.body}>{item.studentName}</Text>
                    <Text style={styles.meta}>{item.grade}</Text>
                  </View>
                  <Text style={styles.badge}>{item.kind}</Text>
                  <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'approve', title: 'Verify at gate', summary: `${item.studentName} · ${item.kind}`, confirmLabel: 'Confirm verify', onConfirm: () => verifyPickup(item.id) })}><Text style={styles.link}>Verify</Text></AnimatedPressable>
                </View>
              )}
            />
          </SelectSheet>
        ) : null}
        {!focus && tile === 'arrive' ? (
          <SelectSheet
            query={query}
            onQuery={setQuery}
            placeholder="Search bus, route, or zone"
            count={picked.length}
            total={outside.filter((bus) => `${bus.busNumber} ${bus.routeName} ${bus.areaName}`.toLowerCase().includes(query.trim().toLowerCase())).length}
            onToggleAll={() => {
              const visible = outside.filter((bus) => `${bus.busNumber} ${bus.routeName} ${bus.areaName}`.toLowerCase().includes(query.trim().toLowerCase())).map((bus) => bus.id);
              setPicked(picked.length === visible.length ? [] : visible);
            }}
            actionLabel={`Mark selected at school (${picked.length})`}
            onAction={() => {
              if (picked.length === 0) return;
              setAsk({ tone: 'approve', title: 'Mark arrived', summary: `Mark ${picked.length} buses at school.`, confirmLabel: 'Confirm arrival', onConfirm: () => { markBusesArrived(picked); setPicked([]); setTile(null); } });
            }}
          >
            <SheetList
              data={outside.filter((bus) => `${bus.busNumber} ${bus.routeName} ${bus.areaName}`.toLowerCase().includes(query.trim().toLowerCase()))}
              keyOf={(item) => item.id}
              render={(bus) => (
                <View style={styles.dense}>
                  <CheckBox on={picked.includes(bus.id)} onPress={() => setPicked((rows) => rows.includes(bus.id) ? rows.filter((id) => id !== bus.id) : [...rows, bus.id])} />
                  <View style={styles.flex}>
                    <Text style={styles.body}>{bus.busNumber}</Text>
                    <Text style={styles.meta}>{bus.areaName} · {bus.conductorName}</Text>
                  </View>
                  <View>
                    <Text style={styles.badge}>{bus.etaMinutes ? `${bus.etaMinutes} min` : bus.status}</Text>
                    <Text style={styles.meta}>{bus.boardedCount}/{bus.totalStudents}</Text>
                  </View>
                </View>
              )}
            />
          </SelectSheet>
        ) : null}
        {!focus && tile === 'visitor' ? <WalkInSheet onSaved={() => undefined} /> : null}
        {!focus && tile === 'requests' ? (
          <SheetList
            data={requests.filter((item) => item.status === 'Pending')}
            keyOf={(item) => item.id}
              render={(item) => (
                <View style={styles.line}>
                  <Text style={styles.body}>{item.studentName}</Text>
                  <Text style={styles.meta}>{item.grade} · {item.requestType}</Text>
                  <View style={styles.sectionRow}>
                    <AnimatedPressable haptic="medium" onPress={() => rejectRequest(item.id)}><Text style={styles.meta}>Reject</Text></AnimatedPressable>
                    <AnimatedPressable haptic="medium" onPress={() => approveRequest(item.id)}><Text style={styles.link}>Approve</Text></AnimatedPressable>
                  </View>
                </View>
              )}
          />
        ) : null}
        {!focus && tile === 'blocked' ? (
          <View style={styles.flex}>
            <Text style={styles.meta}>A bus can be marked at school if it is back and the conductor phone died.</Text>
            <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'override', title: 'Close the gate', summary: 'Every bus still outside will be marked at school and live tracking will pause.', confirmLabel: 'Confirm close', onConfirm: () => { forceRecoverAndClose(); setTile(null); } })} style={styles.primary}>
              <Text style={styles.primaryText}>Mark all at school and close</Text>
            </AnimatedPressable>
            <SheetList
              data={outside}
              keyOf={(item) => item.id}
              render={(bus) => (
                <View style={styles.line}>
                  <Text style={styles.body}>{bus.busNumber}</Text>
                  <Text style={styles.meta}>{bus.status} · {bus.conductorName}</Text>
                  <AnimatedPressable haptic="medium" onPress={() => markBusAtSchool(bus.id)}><Text style={styles.link}>Mark at school</Text></AnimatedPressable>
                </View>
              )}
            />
          </View>
        ) : null}
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

function SelectSheet({ query, onQuery, placeholder, count, total, onToggleAll, actionLabel, onAction, children }: { query: string; onQuery: (value: string) => void; placeholder: string; count: number; total: number; onToggleAll: () => void; actionLabel: string; onAction: () => void; children: ReactNode }) {
  return (
    <View style={styles.flex}>
      <SearchField value={query} onChangeText={onQuery} placeholder={placeholder} />
      <View style={styles.sectionRow}>
        <Text style={styles.meta}>{count} of {total} selected</Text>
        <AnimatedPressable haptic="selection" onPress={onToggleAll}><Text style={styles.link}>{count === total && total > 0 ? 'Deselect all' : 'Select all'}</Text></AnimatedPressable>
      </View>
      {children}
      <AnimatedPressable haptic="medium" onPress={onAction} style={styles.primary}>
        <Text style={styles.primaryText}>{actionLabel}</Text>
      </AnimatedPressable>
    </View>
  );
}

function BusPicker({ buses, query, onQuery, onOpen, onAll, extra }: { buses: GateBus[]; query: string; onQuery: (value: string) => void; onOpen: (id: string) => void; onAll: () => void; extra?: (bus: GateBus) => ReactNode }) {
  const rows = buses.filter((bus) => `${bus.busNumber} ${bus.conductorName} ${bus.routeName}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <View style={styles.flex}>
      <SearchField value={query} onChangeText={onQuery} placeholder="Search buses or conductors" />
      <AnimatedPressable haptic="selection" onPress={onAll}><Text style={styles.link}>View all</Text></AnimatedPressable>
      <SheetList
        data={rows}
        keyOf={(item) => item.id}
        render={(bus) => (
          <AnimatedPressable haptic="selection" onPress={() => onOpen(bus.id)} style={styles.line}>
            <Text style={styles.body}>{bus.busNumber}</Text>
            <Text style={styles.meta}>{bus.areaName} · {bus.status} · {bus.conductorName} · {bus.boardedCount}/{bus.totalStudents}</Text>
            {extra?.(bus)}
          </AnimatedPressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  title: { ...typography.heading },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 150 },
  searchTap: { minHeight: 46, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchTapText: { ...typography.body, color: colors.textMuted },
  gate: { minHeight: 64, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gateCopy: { flex: 1, paddingRight: spacing.sm },
  kicker: { ...typography.overline, color: portalAccents.gateman.from },
  meta: { ...typography.caption, marginTop: 2 },
  body: { ...typography.bodyBold },
  next: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { ...typography.bodyBold, color: portalAccents.gateman.from, backgroundColor: 'transparent' },
  banner: { marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.warningBg },
  section: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { minHeight: 72, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.sm, justifyContent: 'space-between' },
  tileCount: { ...typography.heading },
  tileLabel: { ...typography.caption, color: colors.textPrimary },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center', backgroundColor: palette.white },
  pillOn: { borderColor: portalAccents.gateman.from, backgroundColor: colors.warningBg },
  pillText: { ...typography.caption, color: colors.textPrimary },
  busCard: { marginBottom: spacing.sm },
  flagCard: { marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.warning, padding: spacing.md },
  line: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dense: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  badge: { ...typography.caption, color: portalAccents.gateman.from, backgroundColor: colors.warningBg, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  primary: { minHeight: 46, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  primaryText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
