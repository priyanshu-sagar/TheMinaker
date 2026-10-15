import React, { memo, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import MapView, { Marker } from 'react-native-maps';

import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
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

// ─── SVG Icons (NO lucide-react-native) ───────────────────────────

function PhoneIcon({ color = palette.white, size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
        fill={color}
      />
    </Svg>
  );
}

function SpeedIcon({ color = colors.textMuted, size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.49 2 2 6.49 2 12C2 14.86 3.21 17.43 5.14 19.24L6.56 17.82C5 16.32 4 14.28 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 14.28 19 16.32 17.44 17.82L18.86 19.24C20.79 17.43 22 14.86 22 12C22 6.49 17.51 2 12 2ZM12 6C8.69 6 6 8.69 6 12C6 13.57 6.61 14.99 7.6 16.06L11.27 12.39C11.1 12.15 11 11.84 11 11.5C11 10.67 11.67 10 12.5 10C13.33 10 14 10.67 14 11.5C14 12.33 13.33 13 12.5 13C12.16 13 11.85 12.9 11.61 12.73L7.94 16.4C8.98 17.4 10.41 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z"
        fill={color}
      />
    </Svg>
  );
}

function ClockIcon({ color = colors.textMuted, size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12.5 7V12.2L16.5 14.6L15.7 15.9L11 13V7H12.5Z"
        fill={color}
      />
    </Svg>
  );
}

function UsersIcon({ color = colors.textMuted, size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
        fill={color}
      />
    </Svg>
  );
}

function BusIcon({ color = colors.textPrimary, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 16C4 16.88 4.39 17.67 5 18.22V20H8V19H16V20H19V18.22C19.61 17.67 20 16.88 20 16V6C20 2 16 2 12 2C8 2 4 2 4 6V16ZM6 10V6H18V10H6Z"
        fill={color}
      />
    </Svg>
  );
}

function WarningIcon({ color = colors.warning, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
        fill={color}
      />
    </Svg>
  );
}

function PingIcon({ color = colors.primary, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z"
        fill={color}
      />
    </Svg>
  );
}

function CheckCircleIcon({ color = colors.info, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
        fill={color}
      />
    </Svg>
  );
}

function PowerOffIcon({ color = colors.error, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 3H11V13H13V3ZM17.83 5.17L16.41 6.59C17.99 7.86 19 9.81 19 12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12C5 9.81 6.01 7.86 7.58 6.58L6.17 5.17C4.23 6.82 3 9.26 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 9.26 19.77 6.82 17.83 5.17Z"
        fill={color}
      />
    </Svg>
  );
}

function ChevronIcon({ expanded, color = colors.textMuted }: { expanded: boolean; color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d={
          expanded
            ? 'M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z'
            : 'M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z'
        }
        fill={color}
      />
    </Svg>
  );
}

// ─── Status Helpers ───────────────────────────────────────────────

function statusColor(s: BusStatus): string {
  const MAP: Record<BusStatus, string> = {
    Active: colors.success,
    'En Route': colors.success,
    Delayed: colors.warning,
    'At School': colors.info,
    Offline: colors.error,
  };
  return MAP[s] ?? colors.textMuted;
}

function statusBgColor(s: BusStatus): string {
  const MAP: Record<BusStatus, string> = {
    Active: colors.successBg,
    'En Route': colors.successBg,
    Delayed: colors.warningBg,
    'At School': colors.infoBg,
    Offline: colors.errorBg,
  };
  return MAP[s] ?? colors.surfaceStrong;
}

function studentStatusBadge(status: GateStudent['currentStatus']): { bg: string; color: string } {
  switch (status) {
    case 'On Bus':
      return { bg: colors.boardedBg, color: colors.boarded };
    case 'At School':
      return { bg: colors.successBg, color: colors.success };
    case 'In Transit':
      return { bg: colors.warningBg, color: colors.warning };
    case 'Picked Up':
      return { bg: colors.checkedOutBg, color: colors.checkedOut };
    case 'Absent':
      return { bg: colors.absentBg, color: colors.absent };
    default:
      return { bg: colors.surfaceStrong, color: colors.textMuted };
  }
}

function getMinutesAgo(isoString: string): number {
  if (!isoString) return 0;
  const time = new Date(isoString).getTime();
  if (Number.isNaN(time)) return 0;
  const diff = Date.now() - time;
  return Math.max(0, Math.floor(diff / 60000));
}

function formatRelativePing(isoString: string): string {
  const mins = getMinutesAgo(isoString);
  if (mins <= 0) return 'Last seen just now';
  if (mins === 1) return 'Last seen 1 min ago';
  if (mins < 60) return `Last seen ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `Last seen ${hrs}h ago`;
}

function getRouteProgress(etaMinutes: number): number {
  if (etaMinutes <= 0) return 100;
  if (etaMinutes <= 5) return 85;
  if (etaMinutes <= 10) return 60;
  if (etaMinutes <= 20) return 35;
  return 15;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'C';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Map Error Boundary & Placeholder ─────────────────────────────

function MapFallbackPlaceholder() {
  return (
    <View style={styles.mapFallback}>
      <Svg width="100%" height={220} style={StyleSheet.absoluteFill}>
        <Path
          d="M0 44 H400 M0 88 H400 M0 132 H400 M0 176 H400 M50 0 V220 M100 0 V220 M150 0 V220 M200 0 V220 M250 0 V220 M300 0 V220 M350 0 V220"
          stroke={colors.borderStrong}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.35}
        />
      </Svg>
      <View style={styles.mapFallbackContent}>
        <BusIcon color={portalAccents.gateman.from} size={28} />
        <Text style={styles.mapFallbackTitle}>Live Fleet Tracking</Text>
        <Text style={styles.mapFallbackSub}>GPS satellite signals active</Text>
      </View>
    </View>
  );
}

class SafeFleetMap extends React.Component<
  { buses: GateBus[] },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('MapView render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <MapFallbackPlaceholder />;
    }

    const { buses } = this.props;

    return (
      <MapView
        style={styles.mapView}
        initialRegion={{
          latitude: 28.5,
          longitude: 77.2,
          latitudeDelta: 0.8,
          longitudeDelta: 0.8,
        }}
        scrollEnabled={false}
      >
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={{
              latitude: bus.coordinates.lat,
              longitude: bus.coordinates.lng,
            }}
            title={bus.busNumber}
            description={`${bus.routeName} • ${bus.status}`}
            pinColor={statusColor(bus.status)}
          />
        ))}
      </MapView>
    );
  }
}

// ─── BusCard Component (React.memo) ───────────────────────────────

interface BusCardProps {
  bus: GateBus;
  students: GateStudent[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPing: (bus: GateBus) => void;
  onMarkAtSchool: (bus: GateBus) => void;
  onForceOffline: (bus: GateBus) => void;
}

const BusCard = memo(function BusCard({
  bus,
  students,
  isExpanded,
  onToggleExpand,
  onPing,
  onMarkAtSchool,
  onForceOffline,
}: BusCardProps) {
  const minsAgo = getMinutesAgo(bus.lastPing);
  const isDeadPhone = minsAgo > 10 && bus.status !== 'Offline';
  const showProgress = bus.status === 'En Route' || bus.status === 'Active';
  const progress = getRouteProgress(bus.etaMinutes);

  const busStudents = useMemo(
    () => students.filter((s) => s.busId === bus.id),
    [students, bus.id]
  );

  return (
    <GlassCard
      style={[
        shadows.md,
        styles.busCard,
        { borderLeftWidth: 4, borderLeftColor: statusColor(bus.status) },
      ]}
    >
      {/* Autonomous Feature: Dead Phone Alert Indicator */}
      {isDeadPhone && (
        <View style={styles.deadPhoneAlert}>
          <View style={styles.deadPhoneHeader}>
            <WarningIcon color={colors.warning} size={15} />
            <Text style={styles.deadPhoneText}>
              ⚠️ Conductor phone may be offline — last ping {minsAgo}m ago
            </Text>
          </View>
          <AnimatedPressable
            haptic="medium"
            onPress={() => onMarkAtSchool(bus)}
            style={styles.deadPhoneBtn}
          >
            <Text style={styles.deadPhoneBtnText}>Mark At School</Text>
          </AnimatedPressable>
        </View>
      )}

      {/* Row 1: Bus number + Status pill */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.busNumberWrap}>
          <Text style={styles.busNumber}>{bus.busNumber}</Text>
          <Text style={styles.departureMeta}>Dep: {bus.departureTime}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: statusBgColor(bus.status),
              borderColor: statusColor(bus.status),
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor(bus.status) },
            ]}
          />
          <Text
            style={[styles.statusPillText, { color: statusColor(bus.status) }]}
          >
            {bus.status}
          </Text>
        </View>
      </View>

      {/* Row 2: Route name */}
      <Text style={styles.routeName} numberOfLines={2}>
        {bus.routeName}
      </Text>

      {/* Autonomous Feature: Route Progress Bar */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Route Progress</Text>
            <Text
              style={[
                styles.progressPercent,
                { color: statusColor(bus.status) },
              ]}
            >
              {progress}%
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: statusColor(bus.status),
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Row 3: Metrics grid (3 columns) */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricColumn}>
          <View style={styles.metricRowIcon}>
            <SpeedIcon color={colors.textMuted} size={12} />
            <Text style={styles.metricKey}>Speed</Text>
          </View>
          <Text style={styles.metricValue}>{bus.speedKmh} km/h</Text>
        </View>
        <View style={styles.metricGridDivider} />
        <View style={styles.metricColumn}>
          <View style={styles.metricRowIcon}>
            <ClockIcon color={colors.textMuted} size={12} />
            <Text style={styles.metricKey}>ETA</Text>
          </View>
          <Text style={styles.metricValue}>
            {bus.etaMinutes > 0 ? `${bus.etaMinutes} min` : 'Arrived'}
          </Text>
        </View>
        <View style={styles.metricGridDivider} />
        <View style={styles.metricColumn}>
          <View style={styles.metricRowIcon}>
            <UsersIcon color={colors.textMuted} size={12} />
            <Text style={styles.metricKey}>Students</Text>
          </View>
          <Text style={styles.metricValue}>
            {bus.boardedCount}/{bus.totalStudents}
          </Text>
        </View>
      </View>

      {/* Row 4: Conductor avatar initials circle + name + one-tap call button */}
      <View style={styles.conductorRow}>
        <View style={styles.conductorAvatar}>
          <Text style={styles.conductorInitials}>
            {getInitials(bus.conductorName)}
          </Text>
        </View>
        <View style={styles.conductorInfo}>
          <Text style={styles.conductorName}>{bus.conductorName}</Text>
          <Text style={styles.conductorPhone}>{bus.conductorPhone}</Text>
        </View>
        <AnimatedPressable
          haptic="selection"
          onPress={() => {
            Linking.openURL(`tel:${bus.conductorPhone}`).catch(() => {
              Alert.alert('Unable to Call', `Could not dial ${bus.conductorPhone}`);
            });
          }}
          style={styles.callBtn}
        >
          <PhoneIcon color={palette.white} size={13} />
          <Text style={styles.callBtnText}>Call</Text>
        </AnimatedPressable>
      </View>

      {/* Row 5: Last ping time relative */}
      <View style={styles.pingRow}>
        <View
          style={[
            styles.pingDot,
            { backgroundColor: isDeadPhone ? colors.warning : colors.success },
          ]}
        />
        <Text style={styles.pingText}>{formatRelativePing(bus.lastPing)}</Text>
      </View>

      {/* Expandable Section */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Student Manifest */}
          <View style={styles.manifestHeader}>
            <Text style={styles.manifestTitle}>
              Student Manifest ({busStudents.length})
            </Text>
            <Text style={styles.manifestSub}>
              {bus.boardedCount} Boarded • {bus.totalStudents - bus.boardedCount} Pending
            </Text>
          </View>

          {busStudents.length === 0 ? (
            <View style={styles.emptyManifest}>
              <Text style={styles.emptyManifestText}>
                No students currently assigned to this bus route.
              </Text>
            </View>
          ) : (
            <View style={styles.manifestList}>
              {busStudents.map((s) => {
                const badge = studentStatusBadge(s.currentStatus);
                return (
                  <View key={s.id} style={styles.studentItem}>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{s.name}</Text>
                      <Text style={styles.studentMeta}>
                        Grade {s.grade} • {s.assignedStop}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.studentBadge,
                        { backgroundColor: badge.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.studentBadgeText,
                          { color: badge.color },
                        ]}
                      >
                        {s.currentStatus}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Action buttons row */}
          <View style={styles.actionRow}>
            <AnimatedPressable
              haptic="medium"
              onPress={() => onPing(bus)}
              style={[styles.actionBtn, styles.actionBtnPing]}
            >
              <PingIcon color={colors.primary} size={13} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                Ping
              </Text>
            </AnimatedPressable>

            {bus.status !== 'At School' && (
              <AnimatedPressable
                haptic="medium"
                onPress={() => onMarkAtSchool(bus)}
                style={[styles.actionBtn, styles.actionBtnSchool]}
              >
                <CheckCircleIcon color={colors.info} size={13} />
                <Text style={[styles.actionBtnText, { color: colors.info }]}>
                  Mark At School
                </Text>
              </AnimatedPressable>
            )}

            {bus.status !== 'Offline' && (
              <AnimatedPressable
                haptic="medium"
                onPress={() => onForceOffline(bus)}
                style={[styles.actionBtn, styles.actionBtnOffline]}
              >
                <PowerOffIcon color={colors.error} size={13} />
                <Text style={[styles.actionBtnText, { color: colors.error }]}>
                  Force Offline
                </Text>
              </AnimatedPressable>
            )}
          </View>
        </View>
      )}

      {/* "View Details" / "Collapse" Toggle Button */}
      <AnimatedPressable
        haptic="selection"
        onPress={onToggleExpand}
        style={styles.expandToggle}
      >
        <Text style={styles.expandToggleText}>
          {isExpanded ? 'Collapse Details' : 'View Details & Manifest'}
        </Text>
        <ChevronIcon expanded={isExpanded} color={portalAccents.gateman.from} />
      </AnimatedPressable>
    </GlassCard>
  );
});

// ─── Main Screen Component ────────────────────────────────────────

const FILTER_OPTIONS: Array<BusStatus | 'All'> = [
  'All',
  'En Route',
  'At School',
  'Delayed',
  'Offline',
];

export default function FleetRoutesScreen() {
  const buses = useGatemanStore((state) => state.buses);
  const students = useGatemanStore((state) => state.students);
  const pingConductor = useGatemanStore((state) => state.pingConductor);
  const markBusAtSchool = useGatemanStore((state) => state.markBusAtSchool);
  const forceBusOffline = useGatemanStore((state) => state.forceBusOffline);

  const [filter, setFilter] = useState<BusStatus | 'All'>('All');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (busId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [busId]: !prev[busId],
    }));
  };

  // Section 1: Fleet Status Summary Strip metrics
  const totalBuses = buses.length;
  const activeBuses = useMemo(
    () =>
      buses.filter((b) => b.status === 'En Route' || b.status === 'Active')
        .length,
    [buses]
  );
  const atSchoolBuses = useMemo(
    () => buses.filter((b) => b.status === 'At School').length,
    [buses]
  );
  const delayedOrOffline = useMemo(
    () =>
      buses.filter((b) => b.status === 'Delayed' || b.status === 'Offline')
        .length,
    [buses]
  );

  // Filtered bus list
  const filteredBuses = useMemo(() => {
    if (filter === 'All') return buses;
    return buses.filter((b) => b.status === filter);
  }, [buses, filter]);

  // Actions
  const handlePing = (bus: GateBus) => {
    pingConductor(bus.id);
    Alert.alert(
      'Conductor Pinged',
      `Location ping sent to ${bus.conductorName} (${bus.conductorPhone}) on bus ${bus.busNumber}.`
    );
  };

  const handleMarkAtSchool = (bus: GateBus) => {
    Alert.alert(
      'Confirm Bus Arrival',
      `Mark bus ${bus.busNumber} (${bus.routeName}) as arrived at school?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark At School',
          onPress: () => markBusAtSchool(bus.id),
        },
      ]
    );
  };

  const handleForceOffline = (bus: GateBus) => {
    Alert.alert(
      'Force Bus Offline',
      `Are you sure you want to mark ${bus.busNumber} offline? Real-time tracking will be paused.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Offline',
          style: 'destructive',
          onPress: () => forceBusOffline(bus.id),
        },
      ]
    );
  };

  return (
    <MeshBackground>
      {/* Decorative Orbs — bubbly floating effect behind content */}
      <View
        style={[
          styles.orb,
          {
            top: -40,
            right: -30,
            width: 220,
            height: 220,
            backgroundColor: glass.orb1,
            opacity: 0.65,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.orb,
          {
            bottom: 140,
            left: -60,
            width: 260,
            height: 260,
            backgroundColor: glass.orb2,
            opacity: 0.55,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.orb,
          {
            top: '40%',
            right: -70,
            width: 170,
            height: 170,
            backgroundColor: glass.orb3,
            opacity: 0.45,
          },
        ]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Fixed Header (outside ScrollView) */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Fleet & Routes</Text>
            <Text style={styles.subtitle}>
              Bus management & route monitoring
            </Text>
          </View>
          <NotificationBell />
        </View>

        {/* Section 1: Fleet Status Summary Strip */}
        <View style={styles.summaryWrap}>
          <GlassCard style={[shadows.sm, styles.summaryCard]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryVal}>{totalBuses}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryChip}>
                <Text style={[styles.summaryVal, { color: colors.success }]}>
                  {activeBuses}
                </Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryChip}>
                <Text style={[styles.summaryVal, { color: colors.info }]}>
                  {atSchoolBuses}
                </Text>
                <Text style={styles.summaryLabel}>At School</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryChip}>
                <Text
                  style={[
                    styles.summaryVal,
                    {
                      color:
                        delayedOrOffline > 0 ? colors.warning : colors.textMuted,
                    },
                  ]}
                >
                  {delayedOrOffline}
                </Text>
                <Text style={styles.summaryLabel}>Delay/Off</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Section 2: Filter Pills (horizontal ScrollView, not nested in main content ScrollView) */}
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_OPTIONS.map((option) => {
              const isSelected = filter === option;
              const count =
                option === 'All'
                  ? buses.length
                  : buses.filter((b) => b.status === option).length;

              return (
                <AnimatedPressable
                  key={option}
                  haptic="selection"
                  onPress={() => setFilter(option)}
                  style={[
                    styles.filterPill,
                    isSelected
                      ? styles.filterPillActive
                      : styles.filterPillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected
                        ? styles.filterPillTextActive
                        : styles.filterPillTextInactive,
                    ]}
                  >
                    {option}
                  </Text>
                  <View
                    style={[
                      styles.filterCountBadge,
                      isSelected
                        ? styles.filterCountBadgeActive
                        : styles.filterCountBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        isSelected
                          ? styles.filterCountTextActive
                          : styles.filterCountTextInactive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Content ScrollView */}
        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 3: Bus Cards */}
          <View style={styles.busesSection}>
            {filteredBuses.length === 0 ? (
              <GlassCard style={[shadows.sm, styles.emptyCard]}>
                <BusIcon color={colors.textMuted} size={32} />
                <Text style={styles.emptyTitle}>No buses found</Text>
                <Text style={styles.emptySub}>
                  There are currently no buses with status &quot;{filter}&quot;.
                </Text>
                <AnimatedPressable
                  haptic="selection"
                  onPress={() => setFilter('All')}
                  style={styles.emptyResetBtn}
                >
                  <Text style={styles.emptyResetText}>View All Buses</Text>
                </AnimatedPressable>
              </GlassCard>
            ) : (
              filteredBuses.map((bus) => (
                <BusCard
                  key={bus.id}
                  bus={bus}
                  students={students}
                  isExpanded={!!expanded[bus.id]}
                  onToggleExpand={() => toggleExpanded(bus.id)}
                  onPing={handlePing}
                  onMarkAtSchool={handleMarkAtSchool}
                  onForceOffline={handleForceOffline}
                />
              ))
            )}
          </View>

          {/* Section 4: Map View (react-native-maps) */}
          <View style={styles.mapSection}>
            <View style={styles.mapSectionHeader}>
              <View style={styles.mapTitleRow}>
                <BusIcon color={portalAccents.gateman.from} size={18} />
                <Text style={styles.mapSectionTitle}>Live Fleet Map</Text>
              </View>
              <View style={styles.mapBadge}>
                <Text style={styles.mapBadgeText}>
                  {buses.length} Buses Tracked
                </Text>
              </View>
            </View>
            <GlassCard padded={false} style={[shadows.md, styles.mapCard]}>
              <SafeFleetMap buses={buses} />
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Section 1: Summary Strip
  summaryWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  summaryCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },

  // Section 2: Filter Pills
  filterWrap: {
    marginVertical: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: colors.warningBg,
    borderColor: portalAccents.gateman.from,
  },
  filterPillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  filterPillText: {
    fontSize: 12,
  },
  filterPillTextActive: {
    fontWeight: '700',
    color: portalAccents.gateman.from,
  },
  filterPillTextInactive: {
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountBadgeActive: {
    backgroundColor: portalAccents.gateman.from,
  },
  filterCountBadgeInactive: {
    backgroundColor: colors.borderStrong,
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  filterCountTextActive: {
    color: palette.white,
  },
  filterCountTextInactive: {
    color: colors.textSecondary,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140, // Strict rule: contentContainerStyle={{ paddingBottom: 140 }}
    gap: spacing.md,
  },

  // Section 3: Bus Cards
  busesSection: {
    gap: spacing.md,
  },
  busCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },

  // Dead Phone Alert
  deadPhoneAlert: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  deadPhoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deadPhoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.amber,
    flex: 1,
  },
  deadPhoneBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  deadPhoneBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.ink100,
  },

  // Card Header Row
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  busNumberWrap: {
    flex: 1,
  },
  busNumber: {
    ...typography.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  departureMeta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card Route
  routeName: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Route Progress Bar
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricKey: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricGridDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.divider,
    alignSelf: 'center',
  },

  // Conductor Row
  conductorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  conductorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  conductorInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  conductorInfo: {
    flex: 1,
  },
  conductorName: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  conductorPhone: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.white,
  },

  // Last Ping
  pingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pingText: {
    fontSize: 11,
    color: colors.textMuted,
  },

  // Expand Toggle
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  expandToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: portalAccents.gateman.from,
  },

  // Expanded Content
  expandedContent: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  manifestTitle: {
    ...typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  manifestSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyManifest: {
    paddingVertical: spacing.sm,
  },
  emptyManifestText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  manifestList: {
    gap: 2,
    marginBottom: spacing.sm,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  studentDetails: {
    flex: 1,
    marginRight: spacing.sm,
  },
  studentName: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  studentMeta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  studentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  actionBtnPing: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  actionBtnSchool: {
    backgroundColor: colors.infoBg,
    borderColor: colors.info,
  },
  actionBtnOffline: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 16,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  emptySub: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyResetBtn: {
    marginTop: spacing.md,
    backgroundColor: portalAccents.gateman.from,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  emptyResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.white,
  },

  // Section 4: Map Section
  mapSection: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapSectionTitle: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  mapBadge: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  mapBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  mapCard: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  mapView: {
    width: '100%',
    height: 220,
  },
  mapFallback: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  mapFallbackSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
