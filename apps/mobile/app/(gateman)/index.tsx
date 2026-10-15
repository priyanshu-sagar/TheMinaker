import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';

import {
  colors,
  glass,
  palette,
  portalAccents,
  radius,
  shadows,
  spacing,
  typography,
} from '@/design/tokens';

import {
  BusStatus,
  GateBus,
  GateStudent,
  useGatemanStore,
} from '@/store/gateman.store';

// ─── SVG Icons (NO Lucide imports) ───────────────────────────

function SearchIcon({ size = 18, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

function PhoneIcon({ size = 16, color = palette.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

function CheckCircleIcon({ size = 20, color = portalAccents.gateman.from }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Path d="m9 11 3 3L22 4" />
    </Svg>
  );
}

function BroadcastIcon({ size = 20, color = portalAccents.gateman.from }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <Path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <Circle cx="12" cy="12" r="2" />
      <Path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <Path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </Svg>
  );
}

function UserPlusIcon({ size = 20, color = portalAccents.gateman.from }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M19 8v6m-3-3h6" />
    </Svg>
  );
}

function ClipboardListIcon({ size = 20, color = portalAccents.gateman.from }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <Path d="M9 12h6m-6 4h6" />
    </Svg>
  );
}

function ChevronRightIcon({ size = 16, color = portalAccents.gateman.from }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

function AlertTriangleIcon({ size = 16, color = colors.warning }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <Path d="M12 9v4" />
      <Path d="M12 17h.01" />
    </Svg>
  );
}

// ─── Status Helpers ──────────────────────────────────────────

function getStatusColor(status: BusStatus) {
  switch (status) {
    case 'En Route':
    case 'Active':
      return { fg: colors.success, bg: colors.successBg, border: 'rgba(16,185,129,0.3)' };
    case 'Delayed':
      return { fg: colors.warning, bg: colors.warningBg, border: colors.warningBorder };
    case 'At School':
      return { fg: colors.info, bg: colors.infoBg, border: colors.infoBorder };
    case 'Offline':
    default:
      return { fg: colors.error, bg: colors.errorBg, border: colors.dangerBorder };
  }
}

function getStudentStatusColor(status: GateStudent['currentStatus']) {
  switch (status) {
    case 'At School':
      return { fg: colors.info, bg: colors.infoBg };
    case 'On Bus':
    case 'In Transit':
      return { fg: colors.success, bg: colors.successBg };
    case 'Picked Up':
      return { fg: colors.checkedOut, bg: colors.checkedOutBg };
    case 'Absent':
    default:
      return { fg: colors.absent, bg: colors.absentBg };
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'CO';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

// ─── Main Screen Component ───────────────────────────────────

export default function CommandHubScreen() {
  const router = useRouter();

  // Zustand Store
  const buses = useGatemanStore((state) => state.buses);
  const students = useGatemanStore((state) => state.students);
  const earlyPickups = useGatemanStore((state) => state.earlyPickups);
  const routingRequests = useGatemanStore((state) => state.routingRequests);
  const shiftLog = useGatemanStore((state) => state.shiftLog);
  const gateLockedDown = useGatemanStore((state) => state.gateLockedDown);
  const toggleGateLock = useGatemanStore((state) => state.toggleGateLock);
  const attemptCloseGate = useGatemanStore((state) => state.attemptCloseGate);
  const forceRecoverAndClose = useGatemanStore((state) => state.forceRecoverAndClose);
  const markBusAtSchool = useGatemanStore((state) => state.markBusAtSchool);
  const adminOverrideGate = useGatemanStore((state) => state.adminOverrideGate);
  const forceBusOffline = useGatemanStore((state) => state.forceBusOffline);
  const pingConductor = useGatemanStore((state) => state.pingConductor);
  const addShiftLog = useGatemanStore((state) => state.addShiftLog);

  // Derived Gate State
  const gateOpen = !gateLockedDown;
  const lastAdminLog = shiftLog.find(
    (l) => l.action === 'OVERRIDE' && l.description.toLowerCase().includes('admin'),
  );
  const adminOverride = lastAdminLog
    ? {
        active: true,
        openedBy: lastAdminLog.description.toLowerCase().includes('open')
          ? 'Principal Rao'
          : 'School Admin',
      }
    : null;

  // Local State
  const [searchQ, setSearchQ] = useState('');
  const [blockedBuses, setBlockedBuses] = useState<GateBus[]>([]);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<GateBus | null>(null);
  const [fleetFilter, setFleetFilter] = useState<'All' | BusStatus>('All');
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInGrade, setWalkInGrade] = useState('');

  // Gate Toggle Animation: 0 = closed, 24 = open
  const toggleAnim = useRef(new Animated.Value(gateOpen ? 24 : 0)).current;

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: gateOpen ? 24 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [gateOpen, toggleAnim]);

  // Keep selectedBus reference updated if buses change in store
  const currentSelectedBus = useMemo(() => {
    if (!selectedBus) return null;
    return buses.find((b) => b.id === selectedBus.id) ?? selectedBus;
  }, [buses, selectedBus]);

  // Gate Toggle Handler
  function handleGateToggle() {
    if (gateOpen) {
      // Trying to CLOSE
      const outside = attemptCloseGate();
      if (outside.length > 0) {
        setBlockedBuses(outside);
      } else {
        Alert.alert('Gate Closed', 'Gate marked CLOSED. Live tracking halted.');
      }
    } else {
      // Trying to OPEN
      if (gateLockedDown) {
        toggleGateLock();
      }
      Alert.alert('Gate Opened', 'Gate marked OPEN. Live tracking resumed.');
    }
  }

  // Universal Search
  const searchHits = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (q.length < 2) return [];

    const studentHits = students
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s) => ({ type: 'STUDENT' as const, key: `s-${s.id}`, data: s }));

    const busHits = buses
      .filter(
        (b) =>
          b.busNumber.toLowerCase().includes(q) ||
          b.routeName.toLowerCase().includes(q),
      )
      .map((b) => ({ type: 'BUS' as const, key: `b-${b.id}`, data: b }));

    const conductorHits = buses
      .filter((b) => b.conductorName.toLowerCase().includes(q))
      .map((b) => ({ type: 'CONDUCTOR' as const, key: `c-${b.id}`, data: b }));

    return [...studentHits, ...busHits, ...conductorHits].slice(0, 8);
  }, [searchQ, students, buses]);

  // Quick Stats
  const activeBusesCount = useMemo(
    () => buses.filter((b) => b.status !== 'Offline').length,
    [buses],
  );
  const transitStudentsCount = useMemo(
    () =>
      students.filter(
        (s) => s.currentStatus === 'On Bus' || s.currentStatus === 'In Transit',
      ).length,
    [students],
  );
  const pendingActionsCount = useMemo(
    () =>
      earlyPickups.filter((p) => p.status === 'Pending').length +
      routingRequests.filter((r) => r.status === 'Pending').length,
    [earlyPickups, routingRequests],
  );

  // Fleet preview: first 4 buses
  const fleetPreview = useMemo(() => buses.slice(0, 4), [buses]);

  // Fleet modal filtered buses
  const filteredFleet = useMemo(() => {
    if (fleetFilter === 'All') return buses;
    return buses.filter((b) => b.status === fleetFilter);
  }, [buses, fleetFilter]);

  // Buses not at school (for arrival selector modal)
  const outsideBuses = useMemo(
    () => buses.filter((b) => b.status !== 'At School'),
    [buses],
  );

  // Quick Action Handlers
  function handlePingAllDelayed() {
    const delayed = buses.filter((b) => b.status === 'Delayed');
    if (delayed.length === 0) {
      Alert.alert('On Schedule', 'No buses are currently reporting delays.');
      return;
    }
    delayed.forEach((b) => pingConductor(b.id));
    Alert.alert(
      'Ping Dispatched',
      `Pinged conductors on ${delayed.length} delayed route(s).`,
    );
  }

  function handleConfirmWalkIn() {
    const cleanName = walkInName.trim();
    if (!cleanName) {
      Alert.alert('Student Name Required', 'Please provide student name to log walk-in.');
      return;
    }
    const desc = `Walk-in arrival logged: ${cleanName}${walkInGrade ? ` (${walkInGrade.trim()})` : ''}`;
    addShiftLog({ action: 'AUTHORIZED', description: desc });
    setWalkInName('');
    setWalkInGrade('');
    setShowWalkInModal(false);
    Alert.alert('Walk-In Logged', desc);
  }

  return (
    <MeshBackground>
      {/* Decorative bubbly orbs behind main content */}
      <View
        style={{
          position: 'absolute',
          top: -50,
          right: -30,
          width: 220,
          height: 220,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.65,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 140,
          left: -70,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.55,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          top: 340,
          left: 200,
          width: 170,
          height: 170,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.35,
        }}
        pointerEvents="none"
      />

      {/* FIXED HEADER — outside ScrollView */}
      <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
        <View style={styles.header}>
          <View>
            <Text style={typography.title}>Command Hub</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Operational Control Center
            </Text>
          </View>
          <NotificationBell />
        </View>
        <View style={styles.headerDivider} />
      </SafeAreaView>

      {/* MAIN SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Gate Open/Close Master Control */}
        <GlassCard
          style={[
            styles.gateCard,
            shadows.md,
            {
              borderWidth: gateOpen ? 1 : 1.5,
              borderColor: gateOpen ? 'rgba(16,185,129,0.35)' : colors.error,
            },
          ]}
        >
          <View style={styles.gateRow}>
            <View style={styles.gateLeftCol}>
              <View style={styles.gateTitleRow}>
                <View
                  style={[
                    styles.gatePulseDot,
                    { backgroundColor: gateOpen ? colors.success : colors.error },
                  ]}
                />
                <Text style={typography.label}>School Gate</Text>
              </View>
              <Text
                style={[
                  typography.bodyBold,
                  { color: gateOpen ? colors.success : colors.error, marginTop: 2 },
                ]}
              >
                {gateOpen ? 'OPEN — Tracking Active' : 'CLOSED — Tracking Halted'}
              </Text>
            </View>

            {/* Inline Toggle Switch */}
            <Pressable
              onPress={handleGateToggle}
              hitSlop={8}
              style={[
                styles.toggleTrack,
                {
                  backgroundColor: gateOpen ? colors.successBg : colors.errorBg,
                  borderColor: gateOpen ? colors.success : colors.error,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: gateOpen ? colors.success : colors.error,
                    transform: [{ translateX: toggleAnim }],
                  },
                ]}
              />
            </Pressable>
          </View>

          {/* Admin Override Banner */}
          {adminOverride?.active && (
            <View style={styles.adminBanner}>
              <AlertTriangleIcon size={14} color={colors.warning} />
              <Text style={styles.adminBannerText}>
                Admin Override Active — {adminOverride.openedBy}
              </Text>
            </View>
          )}

          {/* Closed Gate Notice */}
          {!gateOpen && (
            <View style={styles.gateNoticeBox}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Live tracking is paused. Switch gate to OPEN to resume all bus tracking.
              </Text>
            </View>
          )}
        </GlassCard>

        {/* SECTION 2: Universal Search Bar */}
        <GlassCard style={[styles.searchCard, shadows.sm]} padded={false}>
          <View style={styles.searchRow}>
            <SearchIcon size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search student, bus, or conductor..."
              value={searchQ}
              onChangeText={setSearchQ}
              style={styles.searchInput}
              placeholderTextColor={colors.textPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQ.length > 0 ? (
              <Pressable
                onPress={() => setSearchQ('')}
                hitSlop={10}
                style={styles.clearSearchBtn}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        </GlassCard>

        {/* Search Results */}
        {searchHits.length > 0 ? (
          <View style={styles.searchHitsWrap}>
            <Text style={[typography.overline, styles.resultsHeader]}>
              Search Results ({searchHits.length})
            </Text>
            {searchHits.map((hit) => {
              if (hit.type === 'STUDENT') {
                const s = hit.data;
                const bus = buses.find((b) => b.id === s.busId);
                const hasPending = routingRequests.some(
                  (r) => r.studentId === s.id && r.status === 'Pending',
                );
                const sc = getStudentStatusColor(s.currentStatus);

                return (
                  <GlassCard key={hit.key} style={[styles.hitCard, shadows.sm]}>
                    <View style={styles.hitTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={typography.bodyBold}>{s.name}</Text>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          Grade {s.grade} • Bus {bus ? bus.busNumber : 'Unassigned'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[typography.caption, { color: sc.fg, fontWeight: '700' }]}>
                          {s.currentStatus}
                        </Text>
                      </View>
                    </View>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                      Stop: {s.assignedStop}
                    </Text>
                    {hasPending && (
                      <View style={styles.pendingRequestTag}>
                        <Text style={[typography.caption, { color: colors.warning, fontWeight: '600' }]}>
                          ⚠️ Pending Parent Routing Request
                        </Text>
                      </View>
                    )}
                  </GlassCard>
                );
              }

              if (hit.type === 'BUS') {
                const b = hit.data;
                const bsc = getStatusColor(b.status);

                return (
                  <AnimatedPressable
                    key={hit.key}
                    onPress={() => setSelectedBus(b)}
                    style={styles.hitPressable}
                  >
                    <GlassCard style={[styles.hitCard, shadows.sm]}>
                      <View style={styles.hitTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={typography.bodyBold}>{b.busNumber}</Text>
                          <Text style={[typography.caption, { color: colors.textMuted }]}>
                            {b.routeName}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: bsc.bg, borderColor: bsc.border, borderWidth: 1 },
                          ]}
                        >
                          <Text style={[typography.caption, { color: bsc.fg, fontWeight: '700' }]}>
                            {b.status}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.hitMetaRow}>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          Conductor: {b.conductorName}
                        </Text>
                        <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                          ETA: {b.etaMinutes}m • {b.boardedCount}/{b.totalStudents} students
                        </Text>
                      </View>
                    </GlassCard>
                  </AnimatedPressable>
                );
              }

              if (hit.type === 'CONDUCTOR') {
                const b = hit.data;
                const bsc = getStatusColor(b.status);

                return (
                  <GlassCard key={hit.key} style={[styles.hitCard, shadows.sm]}>
                    <View style={styles.hitTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={typography.bodyBold}>{b.conductorName}</Text>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          Bus: {b.busNumber} • {b.routeName}
                        </Text>
                        <Text style={[typography.caption, { color: bsc.fg, fontWeight: '600', marginTop: 2 }]}>
                          Status: {b.status}
                        </Text>
                      </View>
                      <AnimatedPressable
                        onPress={() => Linking.openURL(`tel:${b.conductorPhone}`)}
                        style={styles.callSmallBtn}
                      >
                        <PhoneIcon size={14} color={palette.white} />
                        <Text style={styles.callSmallBtnText}>Call</Text>
                      </AnimatedPressable>
                    </View>
                  </GlassCard>
                );
              }

              return null;
            })}
          </View>
        ) : searchQ.trim().length >= 2 ? (
          <GlassCard style={styles.noResultsCard}>
            <Text style={[typography.caption, { textAlign: 'center', color: colors.textMuted }]}>
              No students, buses, or conductors found for "{searchQ}"
            </Text>
          </GlassCard>
        ) : null}

        {/* SECTION 3: Quick Stats Row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statTile} padded={false}>
            <View style={styles.statTileContent}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {activeBusesCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Active Buses
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.statTile} padded={false}>
            <View style={styles.statTileContent}>
              <Text style={[styles.statNumber, { color: colors.info }]}>
                {transitStudentsCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                In Transit
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.statTile} padded={false}>
            <View style={styles.statTileContent}>
              <Text
                style={[
                  styles.statNumber,
                  { color: pendingActionsCount > 0 ? colors.warning : colors.textPrimary },
                ]}
              >
                {pendingActionsCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Pending
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* SECTION 4: Quick Action Deck */}
        <View style={styles.deckSection}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.deckGrid}>
            <AnimatedPressable
              onPress={() => setShowArrivalModal(true)}
              style={styles.deckTileWrap}
            >
              <GlassCard style={styles.deckTile}>
                <View style={styles.deckIconCircle}>
                  <CheckCircleIcon size={20} color={portalAccents.gateman.from} />
                </View>
                <Text style={styles.deckLabel}>Mark Bus Arrived</Text>
              </GlassCard>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={handlePingAllDelayed}
              style={styles.deckTileWrap}
            >
              <GlassCard style={styles.deckTile}>
                <View style={styles.deckIconCircle}>
                  <BroadcastIcon size={20} color={portalAccents.gateman.from} />
                </View>
                <Text style={styles.deckLabel}>Ping All Delayed</Text>
              </GlassCard>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => setShowWalkInModal(true)}
              style={styles.deckTileWrap}
            >
              <GlassCard style={styles.deckTile}>
                <View style={styles.deckIconCircle}>
                  <UserPlusIcon size={20} color={portalAccents.gateman.from} />
                </View>
                <Text style={styles.deckLabel}>Log Walk-In</Text>
              </GlassCard>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => router.push('/(gateman)/requests' as any)}
              style={styles.deckTileWrap}
            >
              <GlassCard style={styles.deckTile}>
                <View style={styles.deckIconCircle}>
                  <ClipboardListIcon size={20} color={portalAccents.gateman.from} />
                </View>
                <Text style={styles.deckLabel}>View All Requests</Text>
              </GlassCard>
            </AnimatedPressable>
          </View>
        </View>

        {/* SECTION 5: Fleet Preview */}
        <View style={styles.fleetSection}>
          <View style={styles.fleetHeaderRow}>
            <View style={styles.fleetHeaderLeft}>
              <Text style={styles.sectionHeading}>Active Fleet</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{buses.length}</Text>
              </View>
            </View>
            <AnimatedPressable
              onPress={() => setShowFleetModal(true)}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRightIcon size={14} color={portalAccents.gateman.from} />
            </AnimatedPressable>
          </View>

          {/* First 4 buses preview */}
          <View style={styles.previewBusList}>
            {fleetPreview.map((b) => {
              const bsc = getStatusColor(b.status);
              const progressPct = Math.min(
                100,
                Math.round((b.boardedCount / (b.totalStudents || 1)) * 100),
              );

              return (
                <AnimatedPressable
                  key={b.id}
                  onPress={() => setSelectedBus(b)}
                  style={styles.busPreviewCardWrap}
                >
                  <GlassCard style={[styles.busPreviewCard, shadows.sm]}>
                    <View style={styles.busCardTopRow}>
                      <View style={styles.busNumberRow}>
                        <View style={[styles.statusDot, { backgroundColor: bsc.fg }]} />
                        <Text style={typography.bodyBold}>{b.busNumber}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: bsc.bg, borderColor: bsc.border, borderWidth: 1 },
                        ]}
                      >
                        <Text style={[typography.caption, { color: bsc.fg, fontWeight: '700' }]}>
                          {b.status}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}
                      numberOfLines={2}
                    >
                      {b.routeName}
                    </Text>

                    {/* Headcount progress */}
                    <View style={styles.headcountRow}>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        Boarded:{' '}
                        <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                          {b.boardedCount}
                        </Text>
                        /{b.totalStudents} students
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '600' }]}>
                        {progressPct}%
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progressPct}%`, backgroundColor: bsc.fg },
                        ]}
                      />
                    </View>

                    {/* Conductor & ETA chip */}
                    <View style={styles.busCardBottomRow}>
                      <Text
                        style={[typography.caption, { color: colors.textMuted, flex: 1 }]}
                        numberOfLines={1}
                      >
                        👤 {b.conductorName}
                      </Text>
                      <View style={styles.etaChip}>
                        <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                          {b.status === 'At School' ? 'At School' : `ETA ${b.etaMinutes}m`}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ─── MODAL 1: Blocked Buses Modal (Cannot close gate) ─── */}
      <GlassModal
        visible={blockedBuses.length > 0}
        title="Cannot Close Gate"
        onClose={() => setBlockedBuses([])}
        maxHeight="82%"
      >
        <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.md }]}>
          {blockedBuses.length} bus(es) are still en route outside campus. Mark returned buses as
          at school or force recover to halt tracking and close the gate.
        </Text>

        {blockedBuses.map((b) => (
          <GlassCard key={b.id} style={styles.modalBusCard}>
            <View style={styles.hitTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyBold}>{b.busNumber}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {b.conductorName} • {b.routeName}
                </Text>
                <Text style={[typography.caption, { color: getStatusColor(b.status).fg, fontWeight: '600' }]}>
                  Status: {b.status} • ETA {b.etaMinutes}m
                </Text>
              </View>
              <AnimatedPressable
                onPress={() => {
                  markBusAtSchool(b.id);
                  const remaining = blockedBuses.filter((item) => item.id !== b.id);
                  setBlockedBuses(remaining);
                  if (remaining.length === 0) {
                    attemptCloseGate();
                    Alert.alert('Gate Closed', 'All outside buses accounted for. Gate closed.');
                  }
                }}
                style={styles.markAtSchoolBtn}
              >
                <Text style={styles.markAtSchoolBtnText}>Mark At School</Text>
              </AnimatedPressable>
            </View>
          </GlassCard>
        ))}

        <View style={styles.modalActionGroup}>
          <AnimatedPressable
            onPress={() => {
              forceRecoverAndClose();
              setBlockedBuses([]);
              Alert.alert('Gate Closed', 'Forced all buses to At School and closed gate.');
            }}
            style={[styles.primaryActionBtn, { backgroundColor: colors.error }]}
          >
            <Text style={styles.primaryActionBtnText}>Force Place All At School & Close</Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => setBlockedBuses([])}
            style={styles.cancelActionBtn}
          >
            <Text style={styles.cancelActionBtnText}>Cancel</Text>
          </AnimatedPressable>
        </View>
      </GlassModal>

      {/* ─── MODAL 2: Full Fleet Modal (View All) ─── */}
      <GlassModal
        visible={showFleetModal}
        title="Fleet Overview"
        onClose={() => setShowFleetModal(false)}
        maxHeight="82%"
      >
        {/* Status Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['All', 'En Route', 'At School', 'Delayed', 'Offline'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setFleetFilter(tab)}
              style={[
                styles.filterPill,
                fleetFilter === tab ? styles.filterPillActive : null,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  fleetFilter === tab ? styles.filterPillTextActive : null,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredFleet.length === 0 ? (
          <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.lg }]}>
            No buses match filter "{fleetFilter}".
          </Text>
        ) : null}

        {filteredFleet.map((b) => {
          const bsc = getStatusColor(b.status);

          return (
            <AnimatedPressable
              key={b.id}
              onPress={() => {
                setShowFleetModal(false);
                setSelectedBus(b);
              }}
              style={styles.fleetModalItemPressable}
            >
              <GlassCard style={styles.modalBusCard}>
                <View style={styles.hitTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={typography.bodyBold}>{b.busNumber}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {b.routeName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      👤 {b.conductorName} • {b.boardedCount}/{b.totalStudents} boarded
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: bsc.bg, borderColor: bsc.border, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[typography.caption, { color: bsc.fg, fontWeight: '700' }]}>
                      {b.status}
                    </Text>
                  </View>
                </View>

                {b.status !== 'At School' && (
                  <View style={styles.modalBusItemBottom}>
                    <AnimatedPressable
                      onPress={() => {
                        markBusAtSchool(b.id);
                        Alert.alert('Bus Updated', `${b.busNumber} marked At School.`);
                      }}
                      style={styles.markAtSchoolBtn}
                    >
                      <Text style={styles.markAtSchoolBtnText}>Mark At School</Text>
                    </AnimatedPressable>
                  </View>
                )}
              </GlassCard>
            </AnimatedPressable>
          );
        })}
      </GlassModal>

      {/* ─── MODAL 3: Bus Deep-Dive Modal (selectedBus) ─── */}
      <GlassModal
        visible={currentSelectedBus !== null}
        title={currentSelectedBus?.busNumber ?? 'Bus Details'}
        onClose={() => setSelectedBus(null)}
        maxHeight="85%"
      >
        {currentSelectedBus && (
          <View>
            {/* Header info */}
            <View style={styles.deepDiveHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {currentSelectedBus.routeName}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  Departed: {currentSelectedBus.departureTime}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(currentSelectedBus.status).bg,
                    borderColor: getStatusColor(currentSelectedBus.status).border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: getStatusColor(currentSelectedBus.status).fg, fontWeight: '700' },
                  ]}
                >
                  {currentSelectedBus.status}
                </Text>
              </View>
            </View>

            {/* Conductor avatar row */}
            <GlassCard style={styles.conductorCard} padded={false}>
              <View style={styles.conductorRow}>
                <LinearGradient
                  colors={[colors.primary, '#6366F1']}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(currentSelectedBus.conductorName)}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={typography.bodyBold}>{currentSelectedBus.conductorName}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {currentSelectedBus.conductorPhone}
                  </Text>
                </View>
                <AnimatedPressable
                  onPress={() => Linking.openURL(`tel:${currentSelectedBus.conductorPhone}`)}
                  style={styles.callSmallBtn}
                >
                  <PhoneIcon size={14} color={palette.white} />
                  <Text style={styles.callSmallBtnText}>Call</Text>
                </AnimatedPressable>
              </View>
            </GlassCard>

            {/* Metrics Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={[typography.title, { color: colors.textPrimary }]}>
                  {currentSelectedBus.speedKmh}
                </Text>
                <Text style={typography.caption}>km/h Speed</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[typography.title, { color: colors.primary }]}>
                  {currentSelectedBus.etaMinutes}m
                </Text>
                <Text style={typography.caption}>Est. Arrival</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[typography.title, { color: colors.success }]}>
                  {currentSelectedBus.boardedCount}/{currentSelectedBus.totalStudents}
                </Text>
                <Text style={typography.caption}>Boarded</Text>
              </View>
            </View>

            {/* OpenStreetMap Map View */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.mapFill}
                provider={undefined}
                pointerEvents="none"
                region={{
                  latitude: currentSelectedBus.coordinates.lat,
                  longitude: currentSelectedBus.coordinates.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                <Marker
                  coordinate={{
                    latitude: currentSelectedBus.coordinates.lat,
                    longitude: currentSelectedBus.coordinates.lng,
                  }}
                  title={currentSelectedBus.busNumber}
                />
              </MapView>
            </View>

            {/* Actions */}
            <View style={styles.deepDiveActionRow}>
              <AnimatedPressable
                onPress={() => {
                  pingConductor(currentSelectedBus.id);
                  Alert.alert('Ping Sent', `Ping sent to conductor ${currentSelectedBus.conductorName}.`);
                }}
                style={styles.secondaryDeepDiveBtn}
              >
                <Text style={styles.secondaryDeepDiveBtnText}>Ping Conductor</Text>
              </AnimatedPressable>

              {currentSelectedBus.status !== 'At School' && (
                <AnimatedPressable
                  onPress={() => {
                    markBusAtSchool(currentSelectedBus.id);
                    Alert.alert('Bus Updated', `${currentSelectedBus.busNumber} marked At School.`);
                  }}
                  style={styles.primaryDeepDiveBtn}
                >
                  <Text style={styles.primaryDeepDiveBtnText}>Mark At School</Text>
                </AnimatedPressable>
              )}
            </View>

            <AnimatedPressable
              onPress={() => {
                Alert.alert(
                  'Confirm Force Offline',
                  `Are you sure you want to force ${currentSelectedBus.busNumber} offline?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Force Offline',
                      style: 'destructive',
                      onPress: () => {
                        forceBusOffline(currentSelectedBus.id);
                        setSelectedBus(null);
                        Alert.alert('Bus Offline', `${currentSelectedBus.busNumber} marked offline.`);
                      },
                    },
                  ],
                );
              }}
              style={styles.dangerDeepDiveBtn}
            >
              <Text style={styles.dangerDeepDiveBtnText}>Force Bus Offline</Text>
            </AnimatedPressable>

            {/* Mini Manifest */}
            <Text style={[typography.overline, styles.manifestTitle]}>
              Student Manifest ({students.filter((s) => s.busId === currentSelectedBus.id).length})
            </Text>
            {students
              .filter((s) => s.busId === currentSelectedBus.id)
              .map((s) => {
                const sc = getStudentStatusColor(s.currentStatus);

                return (
                  <View key={s.id} style={styles.manifestRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.bodyBold}>{s.name}</Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {s.grade} • Stop: {s.assignedStop}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[typography.caption, { color: sc.fg, fontWeight: '700' }]}>
                        {s.currentStatus}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </GlassModal>

      {/* ─── MODAL 4: Mark Bus Arrived Selector ─── */}
      <GlassModal
        visible={showArrivalModal}
        title="Mark Bus Arrived"
        onClose={() => setShowArrivalModal(false)}
        maxHeight="75%"
      >
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
          Select an arriving route to record its arrival at school.
        </Text>
        {outsideBuses.length === 0 ? (
          <Text style={[typography.body, { textAlign: 'center', marginTop: spacing.md, color: colors.success }]}>
            All active buses are already at school!
          </Text>
        ) : null}

        {outsideBuses.map((b) => (
          <GlassCard key={b.id} style={styles.modalBusCard}>
            <View style={styles.hitTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyBold}>{b.busNumber}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {b.routeName} • {b.conductorName}
                </Text>
                <Text style={[typography.caption, { color: getStatusColor(b.status).fg, fontWeight: '600' }]}>
                  Status: {b.status} • ETA {b.etaMinutes}m
                </Text>
              </View>
              <AnimatedPressable
                onPress={() => {
                  markBusAtSchool(b.id);
                  Alert.alert('Bus Arrived', `${b.busNumber} marked At School.`);
                  if (outsideBuses.length <= 1) {
                    setShowArrivalModal(false);
                  }
                }}
                style={styles.markAtSchoolBtn}
              >
                <Text style={styles.markAtSchoolBtnText}>Mark Arrived</Text>
              </AnimatedPressable>
            </View>
          </GlassCard>
        ))}
      </GlassModal>

      {/* ─── MODAL 5: Log Walk-In Arrival ─── */}
      <GlassModal
        visible={showWalkInModal}
        title="Log Walk-In Arrival"
        onClose={() => setShowWalkInModal(false)}
        maxHeight="65%"
      >
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
          Record unscheduled student entry or visitor walk-in to campus shift log.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={typography.label}>Student Name *</Text>
          <TextInput
            placeholder="e.g. Aarav Sharma"
            value={walkInName}
            onChangeText={setWalkInName}
            style={styles.modalTextInput}
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={typography.label}>Grade / Purpose</Text>
          <TextInput
            placeholder="e.g. Grade 5-B or Parent Escort"
            value={walkInGrade}
            onChangeText={setWalkInGrade}
            style={styles.modalTextInput}
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>

        <AnimatedPressable
          onPress={handleConfirmWalkIn}
          style={[styles.primaryActionBtn, { marginTop: spacing.md }]}
        >
          <Text style={styles.primaryActionBtnText}>Confirm Walk-In Arrival</Text>
        </AnimatedPressable>
      </GlassModal>
    </MeshBackground>
  );
}

// ─── Stylesheet ──────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 140, // Required clearance for floating tab bar
  },

  // Gate Card
  gateCard: {
    marginBottom: spacing.md,
  },
  gateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gateLeftCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  gateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gatePulseDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  toggleTrack: {
    width: 54,
    height: 30,
    borderRadius: 15,
    padding: 3,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginTop: spacing.sm,
  },
  adminBannerText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  gateNoticeBox: {
    backgroundColor: 'rgba(244,63,94,0.06)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },

  // Search Card
  searchCard: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 46,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 6,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },

  // Search Hits
  searchHitsWrap: {
    marginBottom: spacing.md,
  },
  resultsHeader: {
    marginBottom: spacing.xs,
  },
  hitPressable: {
    marginBottom: spacing.xs,
  },
  hitCard: {
    marginBottom: spacing.xs,
  },
  hitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hitMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pendingRequestTag: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.warningBg,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  callSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: portalAccents.gateman.from,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  callSmallBtnText: {
    ...typography.caption,
    color: palette.white,
    fontWeight: '700',
  },
  noResultsCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    borderRadius: radius.md,
  },
  statTileContent: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    ...typography.title,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Quick Action Deck
  deckSection: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  deckTileWrap: {
    width: '48.5%',
  },
  deckTile: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 90,
    justifyContent: 'center',
  },
  deckIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(249,115,22,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  deckLabel: {
    ...typography.label,
    fontSize: 13,
    textAlign: 'center',
    color: colors.textPrimary,
  },

  // Fleet Preview
  fleetSection: {
    marginBottom: spacing.md,
  },
  fleetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fleetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(79,70,229,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: portalAccents.gateman.from,
  },
  previewBusList: {
    gap: spacing.sm,
  },
  busPreviewCardWrap: {
    width: '100%',
  },
  busPreviewCard: {
    padding: spacing.md,
  },
  busCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  headcountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  progressTrack: {
    height: 5,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  busCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaChip: {
    backgroundColor: 'rgba(79,70,229,0.1)',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // Modals shared styles
  modalBusCard: {
    marginBottom: spacing.sm,
  },
  markAtSchoolBtn: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  markAtSchoolBtnText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '700',
  },
  modalActionGroup: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  primaryActionBtn: {
    backgroundColor: portalAccents.gateman.from,
    borderRadius: radius.md,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryActionBtnText: {
    ...typography.bodyBold,
    color: palette.white,
  },
  cancelActionBtn: {
    borderRadius: radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionBtnText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },

  // Fleet modal filter pills
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  filterPillActive: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  filterPillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: palette.white,
  },
  fleetModalItemPressable: {
    marginBottom: spacing.xs,
  },
  modalBusItemBottom: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  // Bus Deep Dive Modal
  deepDiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  conductorCard: {
    marginVertical: spacing.sm,
    borderRadius: radius.md,
  },
  conductorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: palette.white,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.divider,
  },
  mapContainer: {
    height: 160,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  mapFill: {
    flex: 1,
  },
  deepDiveActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryDeepDiveBtn: {
    flex: 1,
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDeepDiveBtnText: {
    ...typography.bodyBold,
    color: colors.info,
  },
  secondaryDeepDiveBtn: {
    flex: 1,
    backgroundColor: 'rgba(79,70,229,0.1)',
    borderRadius: radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryDeepDiveBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  dangerDeepDiveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.errorBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerDeepDiveBtnText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  manifestTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  manifestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  // Walk-In Modal Inputs
  inputGroup: {
    marginBottom: spacing.sm,
  },
  modalTextInput: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.textPrimary,
    marginTop: 4,
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.sm,
  },
});
