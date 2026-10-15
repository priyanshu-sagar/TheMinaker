import React, { useState, useMemo, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import MapView, { Marker, UrlTile } from 'react-native-maps';

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
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { useGatemanStore, GateBus, GateStudent } from '@/store/gateman.store';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const MAP_H = 200;

// Delhi-NCR Region coordinates
const NCR_MAP_REGION = {
  latitude: 28.5,
  longitude: 77.2,
  latitudeDelta: 0.8,
  longitudeDelta: 0.8,
};

// ─── Color Helpers ──────────────────────────────────────────

function getBusStatusColor(status: GateBus['status']): string {
  switch (status) {
    case 'Active':
    case 'En Route':
      return colors.success;
    case 'Delayed':
      return colors.warning;
    case 'At School':
      return colors.info;
    case 'Offline':
      return colors.error;
    default:
      return colors.textMuted;
  }
}

function getBusStatusBg(status: GateBus['status']): string {
  switch (status) {
    case 'Active':
    case 'En Route':
      return colors.successBg;
    case 'Delayed':
      return colors.warningBg;
    case 'At School':
      return colors.infoBg;
    case 'Offline':
      return colors.errorBg;
    default:
      return colors.neutralBg;
  }
}

function getStudentStatusColor(status: GateStudent['currentStatus']): { color: string; bg: string } {
  switch (status) {
    case 'On Bus':
      return { color: colors.success, bg: colors.successBg };
    case 'At School':
      return { color: colors.info, bg: colors.infoBg };
    case 'Picked Up':
      return { color: colors.warning, bg: colors.warningBg };
    case 'Absent':
      return { color: colors.error, bg: colors.errorBg };
    case 'In Transit':
      return { color: portalAccents.gateman.from, bg: 'rgba(249,115,22,0.12)' };
    default:
      return { color: colors.textMuted, bg: colors.neutralBg };
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name[0] ?? 'C').toUpperCase();
}

function getShiftDuration(): string {
  const now = new Date();
  const shiftStart = new Date();
  shiftStart.setHours(7, 0, 0, 0);
  const diffMs = Math.max(0, now.getTime() - shiftStart.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

// ─── Bus Widget Component (React.memo) ───────────────────────

interface BusWidgetProps {
  bus: GateBus;
  onPress: () => void;
}

const BusWidget = React.memo(({ bus, onPress }: BusWidgetProps) => {
  const statusColor = getBusStatusColor(bus.status);
  const statusBg = getBusStatusBg(bus.status);
  const progressRatio =
    bus.totalStudents > 0
      ? Math.min(1, Math.max(0, bus.boardedCount / bus.totalStudents))
      : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const conductorShort = useMemo(() => {
    const parts = bus.conductorName.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return bus.conductorName;
  }, [bus.conductorName]);

  return (
    <AnimatedPressable onPress={onPress} haptic="selection" style={styles.busWidgetWrap}>
      <GlassCard padded={false} style={[shadows.sm, styles.busWidgetCard]}>
        <View style={styles.busWidgetInner}>
          {/* Status Badge + ETA */}
          <View style={styles.busWidgetHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {bus.status}
              </Text>
            </View>
            <Text style={styles.busWidgetEta}>
              {bus.etaMinutes > 0 ? `${bus.etaMinutes}m ETA` : 'At Stop'}
            </Text>
          </View>

          {/* Bus Number */}
          <Text style={styles.busWidgetNumber} numberOfLines={1}>
            {bus.busNumber}
          </Text>

          {/* Route Name (2 lines) */}
          <Text style={styles.busWidgetRoute} numberOfLines={2}>
            {bus.routeName}
          </Text>

          {/* Boarding Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Boarded</Text>
              <Text style={styles.progressValue}>
                {bus.boardedCount}/{bus.totalStudents} ({progressPercent}%)
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>

          {/* Departure & Conductor Footer */}
          <View style={styles.busWidgetFooter}>
            <Text style={styles.busWidgetDep}>Dep: {bus.departureTime}</Text>
            <Text style={styles.busWidgetConductor} numberOfLines={1}>
              👨‍✈️ {conductorShort}
            </Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
});

// ─── Main Screen Component ───────────────────────────────────

export default function GatemanCommandHubScreen() {
  const buses = useGatemanStore((state) => state.buses);
  const students = useGatemanStore((state) => state.students);
  const forceBusOffline = useGatemanStore((state) => state.forceBusOffline);
  const pingConductor = useGatemanStore((state) => state.pingConductor);

  // Local state
  const [query, setQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState<GateBus | null>(null);
  const [showManifest, setShowManifest] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Fleet summary stats
  const activeCount = useMemo(
    () => buses.filter((b) => b.status !== 'Offline').length,
    [buses],
  );
  const offlineCount = useMemo(
    () => buses.filter((b) => b.status === 'Offline').length,
    [buses],
  );
  const delayedCount = useMemo(
    () => buses.filter((b) => b.status === 'Delayed').length,
    [buses],
  );
  const totalStudentsCount = useMemo(
    () => buses.reduce((acc, b) => acc + b.totalStudents, 0),
    [buses],
  );

  // Filter students for Section 1: Student Quick-Track
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students.filter((s) => s.name.toLowerCase().includes(q));
  }, [students, query]);

  // Students on the currently inspected bus
  const selectedBusStudents = useMemo(() => {
    if (!selectedBus) return [];
    return students.filter((s) => s.busId === selectedBus.id);
  }, [students, selectedBus]);

  // Press handlers
  const handleOpenBus = useCallback((bus: GateBus) => {
    setSelectedBus(bus);
    setShowManifest(false);
  }, []);

  const handleCloseBusModal = useCallback(() => {
    setSelectedBus(null);
    setShowManifest(false);
  }, []);

  const handlePingConductor = useCallback(() => {
    if (!selectedBus) return;
    pingConductor(selectedBus.id);
    Alert.alert(
      'Ping Dispatched',
      `High-priority operational ping sent to conductor ${selectedBus.conductorName} (${selectedBus.conductorPhone}).`,
    );
  }, [selectedBus, pingConductor]);

  const handleForceOffline = useCallback(() => {
    if (!selectedBus) return;
    Alert.alert(
      'Force Bus Offline',
      `Are you sure you want to take ${selectedBus.busNumber} offline? This will flag maintenance and notify transport admins.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Offline',
          style: 'destructive',
          onPress: () => {
            forceBusOffline(selectedBus.id);
            setSelectedBus((prev) =>
              prev
                ? { ...prev, status: 'Offline', speedKmh: 0, etaMinutes: 0 }
                : null,
            );
          },
        },
      ],
    );
  }, [selectedBus, forceBusOffline]);

  const handleStudentPress = useCallback(
    (student: GateStudent) => {
      const bus = buses.find((b) => b.id === student.busId);
      Alert.alert(
        student.name,
        `Grade: ${student.grade}\nStatus: ${student.currentStatus}\nAssigned Bus: ${bus ? `${bus.busNumber} (${bus.routeName})` : 'No Bus Assigned'}\nPickup Stop: ${student.assignedStop}\nParent: ${student.parentName} (${student.parentPhone})`,
        [{ text: 'OK' }],
      );
    },
    [buses],
  );

  return (
    <MeshBackground>
      {/* Decorative Orbs for bubbly floating depth */}
      <View
        style={{
          position: 'absolute',
          top: -50,
          right: -40,
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
          top: 320,
          left: -70,
          width: 240,
          height: 240,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 110,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.45,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Command Hub</Text>
            <Text style={styles.headerSubtitle}>Live Operations</Text>
          </View>
          <NotificationBell />
        </View>

        {/* Scroll Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Autonomous Feature 1: Shift Pulse Card */}
          <GlassCard style={[shadows.md, styles.shiftCard]} padded={false}>
            <View style={styles.shiftCardInner}>
              <View style={styles.shiftHeaderRow}>
                <View style={styles.shiftLivePill}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.shiftLiveText}>SHIFT ACTIVE</Text>
                </View>
                <Text style={styles.shiftElapsedText}>
                  Elapsed: {getShiftDuration()}
                </Text>
              </View>

              <View style={styles.shiftMetricsRow}>
                <View style={styles.shiftMetricItem}>
                  <Text style={styles.shiftMetricLabel}>Start</Text>
                  <Text style={styles.shiftMetricVal}>7:00 AM</Text>
                </View>
                <View style={styles.shiftDivider} />
                <View style={styles.shiftMetricItem}>
                  <Text style={styles.shiftMetricLabel}>Active Fleet</Text>
                  <Text style={[styles.shiftMetricVal, { color: colors.success }]}>
                    {activeCount}/{buses.length}
                  </Text>
                </View>
                <View style={styles.shiftDivider} />
                <View style={styles.shiftMetricItem}>
                  <Text style={styles.shiftMetricLabel}>Students Tracked</Text>
                  <Text style={[styles.shiftMetricVal, { color: portalAccents.gateman.from }]}>
                    {totalStudentsCount}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Section 1: Student Quick-Track (Search) */}
          <View style={styles.searchSection}>
            <GlassCard padded={false} style={[shadows.sm, styles.searchCard]}>
              <View style={styles.searchInner}>
                <Svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.textMuted}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Circle cx="11" cy="11" r="8" />
                  <Path d="m21 21-4.35-4.35" />
                </Svg>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Quick-Track student by name..."
                  placeholderTextColor={colors.textPlaceholder}
                  style={styles.searchInput}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
                {query.length > 0 && (
                  <AnimatedPressable
                    onPress={() => setQuery('')}
                    haptic="light"
                    style={styles.clearSearchBtn}
                  >
                    <Text style={styles.clearSearchText}>✕</Text>
                  </AnimatedPressable>
                )}
              </View>
            </GlassCard>

            {/* Results list below search bar */}
            {query.trim().length > 0 && (
              <View style={styles.searchResultsWrap}>
                {filteredStudents.length === 0 ? (
                  <GlassCard style={shadows.sm}>
                    <Text style={styles.noResultsText}>
                      No students found matching &quot;{query}&quot;
                    </Text>
                  </GlassCard>
                ) : (
                  filteredStudents.map((stu) => {
                    const statusInfo = getStudentStatusColor(stu.currentStatus);
                    const bus = buses.find((b) => b.id === stu.busId);
                    return (
                      <AnimatedPressable
                        key={stu.id}
                        onPress={() => handleStudentPress(stu)}
                        haptic="light"
                        style={styles.studentResultCardWrap}
                      >
                        <GlassCard padded={false} style={[shadows.sm, styles.studentResultCard]}>
                          <View style={styles.studentResultInner}>
                            <View style={styles.studentResultLeft}>
                              <View style={styles.studentNameRow}>
                                <Text style={styles.studentResultName}>{stu.name}</Text>
                                <View style={styles.gradeBadge}>
                                  <Text style={styles.gradeBadgeText}>{stu.grade}</Text>
                                </View>
                              </View>
                              <Text style={styles.studentResultMeta}>
                                🚌 {bus ? bus.busNumber : 'No Bus'} · 📍 {stu.assignedStop}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.studentStatusBadge,
                                { backgroundColor: statusInfo.bg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.studentStatusText,
                                  { color: statusInfo.color },
                                ]}
                              >
                                {stu.currentStatus}
                              </Text>
                            </View>
                          </View>
                        </GlassCard>
                      </AnimatedPressable>
                    );
                  })
                )}
              </View>
            )}
          </View>

          {/* Section 2: Live Fleet Summary Row */}
          <GlassCard style={[shadows.sm, styles.summaryCard]} padded={false}>
            <View style={styles.summaryRow}>
              <AnimatedPressable haptic="light" style={styles.summaryChip}>
                <View style={[styles.chipDot, { backgroundColor: colors.success }]} />
                <Text style={styles.chipNumber}>{activeCount}</Text>
                <Text style={styles.chipLabel}>Active</Text>
              </AnimatedPressable>

              <View style={styles.summaryChipDivider} />

              <AnimatedPressable haptic="light" style={styles.summaryChip}>
                <View style={[styles.chipDot, { backgroundColor: colors.error }]} />
                <Text style={styles.chipNumber}>{offlineCount}</Text>
                <Text style={styles.chipLabel}>Offline</Text>
              </AnimatedPressable>

              <View style={styles.summaryChipDivider} />

              <AnimatedPressable haptic="light" style={styles.summaryChip}>
                <View style={[styles.chipDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.chipNumber}>{delayedCount}</Text>
                <Text style={styles.chipLabel}>Delayed</Text>
              </AnimatedPressable>
            </View>
          </GlassCard>

          {/* Autonomous Feature 3: Bus Status Legend */}
          <GlassCard style={[shadows.sm, styles.legendCard]} padded={false}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendLabel}>Active</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.legendLabel}>Delayed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
                <Text style={styles.legendLabel}>At School</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.legendLabel}>Offline</Text>
              </View>
            </View>
          </GlassCard>

          {/* Section 3: Bus Widget Grid (3x2 grid) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Fleet Grid</Text>
            <Text style={styles.sectionSubtitle}>{buses.length} Vehicles Tracked</Text>
          </View>

          <View style={styles.busGridContainer}>
            {buses.slice(0, 6).map((bus) => (
              <BusWidget key={bus.id} bus={bus} onPress={() => handleOpenBus(bus)} />
            ))}
          </View>

          {/* Section 4: Map Card (react-native-maps) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Live Fleet Map</Text>
            <AnimatedPressable
              onPress={() => setIsMapExpanded(true)}
              haptic="light"
              style={styles.expandHeaderBtn}
            >
              <Svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke={portalAccents.gateman.from}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </Svg>
              <Text style={styles.expandHeaderText}>Expand Map</Text>
            </AnimatedPressable>
          </View>

          <GlassCard padded={false} style={[shadows.md, styles.mapCardWrapper]}>
            <MapView
              style={styles.mapView}
              provider={undefined}
              initialRegion={NCR_MAP_REGION}
            >
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              {buses.map((bus) => {
                const markerColor = getBusStatusColor(bus.status);
                return (
                  <Marker
                    key={bus.id}
                    coordinate={{
                      latitude: bus.coordinates.lat,
                      longitude: bus.coordinates.lng,
                    }}
                    title={bus.busNumber}
                    description={`${bus.routeName} · ${bus.conductorName}`}
                    onCalloutPress={() => handleOpenBus(bus)}
                  >
                    <View style={[styles.mapMarkerBadge, { borderColor: markerColor }]}>
                      <View
                        style={[styles.mapMarkerDot, { backgroundColor: markerColor }]}
                      />
                      <Text style={styles.mapMarkerText}>
                        {bus.busNumber.slice(-4)}
                      </Text>
                    </View>
                  </Marker>
                );
              })}
            </MapView>

            <AnimatedPressable
              style={[styles.floatingExpandBtn, shadows.sm]}
              onPress={() => setIsMapExpanded(true)}
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
        </ScrollView>
      </SafeAreaView>

      {/* ─── Bus Quick-Action Modal ─────────────────────────────── */}
      <Modal
        visible={!!selectedBus}
        transparent
        animationType="slide"
        onRequestClose={handleCloseBusModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseBusModal}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>

          <View style={styles.modalSheetContainer}>
            {Platform.OS === 'android' ? (
              <View style={styles.modalSheetInner}>{renderBusModalContent()}</View>
            ) : (
              <BlurView intensity={55} tint="light" style={styles.modalSheetInner}>
                {renderBusModalContent()}
              </BlurView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── Expanded Full Screen Map Modal ─────────────────────── */}
      <Modal
        visible={isMapExpanded}
        animationType="slide"
        onRequestClose={() => setIsMapExpanded(false)}
      >
        <SafeAreaView style={styles.fullMapSafe} edges={['top', 'bottom']}>
          <View style={styles.fullMapHeader}>
            <View>
              <Text style={styles.fullMapTitle}>Full Fleet Map</Text>
              <Text style={styles.fullMapSubtitle}>Delhi-NCR Region</Text>
            </View>
            <AnimatedPressable
              style={[styles.fullMapCloseBtn, shadows.sm]}
              onPress={() => setIsMapExpanded(false)}
              haptic="light"
            >
              <Text style={styles.fullMapCloseText}>Close</Text>
            </AnimatedPressable>
          </View>

          <MapView
            style={styles.fullMapView}
            provider={undefined}
            initialRegion={NCR_MAP_REGION}
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
            />
            {buses.map((bus) => {
              const markerColor = getBusStatusColor(bus.status);
              return (
                <Marker
                  key={bus.id}
                  coordinate={{
                    latitude: bus.coordinates.lat,
                    longitude: bus.coordinates.lng,
                  }}
                  title={bus.busNumber}
                  description={`${bus.routeName} · ${bus.conductorName}`}
                  onCalloutPress={() => {
                    setIsMapExpanded(false);
                    handleOpenBus(bus);
                  }}
                >
                  <View style={[styles.mapMarkerBadge, { borderColor: markerColor }]}>
                    <View
                      style={[styles.mapMarkerDot, { backgroundColor: markerColor }]}
                    />
                    <Text style={styles.mapMarkerText}>
                      {bus.busNumber.slice(-4)}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        </SafeAreaView>
      </Modal>
    </MeshBackground>
  );

  // ─── Modal Content Renderer ────────────────────────────────
  function renderBusModalContent() {
    if (!selectedBus) return null;
    const busColor = getBusStatusColor(selectedBus.status);
    const busBg = getBusStatusBg(selectedBus.status);
    const initials = getInitials(selectedBus.conductorName);

    return (
      <View style={styles.modalSheetBody}>
        {/* Header Row */}
        <View style={styles.modalHeaderRow}>
          <View style={styles.modalHeaderTitles}>
            <View style={styles.modalBusTitleRow}>
              <Text style={styles.modalBusNumber}>{selectedBus.busNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: busBg }]}>
                <View style={[styles.statusDot, { backgroundColor: busColor }]} />
                <Text style={[styles.statusBadgeText, { color: busColor }]}>
                  {selectedBus.status}
                </Text>
              </View>
            </View>
            <Text style={styles.modalRouteName} numberOfLines={2}>
              {selectedBus.routeName}
            </Text>
          </View>
          <AnimatedPressable
            onPress={handleCloseBusModal}
            haptic="light"
            style={styles.modalCloseBtn}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </AnimatedPressable>
        </View>

        {/* Conductor Profile Bar */}
        <GlassCard padded={false} style={[shadows.sm, styles.modalConductorCard]}>
          <View style={styles.modalConductorInner}>
            <LinearGradient
              colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalAvatar}
            >
              <Text style={styles.modalAvatarText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.modalConductorMeta}>
              <Text style={styles.modalConductorName}>
                {selectedBus.conductorName}
              </Text>
              <Text style={styles.modalConductorPhone}>
                📞 {selectedBus.conductorPhone}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Live Metrics Row */}
        <View style={styles.modalMetricsRow}>
          <GlassCard padded={false} style={[shadows.sm, styles.modalMetricCard]}>
            <View style={styles.modalMetricInner}>
              <Text style={styles.modalMetricLabel}>Speed</Text>
              <Text style={styles.modalMetricVal}>
                {selectedBus.speedKmh} <Text style={styles.modalMetricUnit}>km/h</Text>
              </Text>
            </View>
          </GlassCard>

          <GlassCard padded={false} style={[shadows.sm, styles.modalMetricCard]}>
            <View style={styles.modalMetricInner}>
              <Text style={styles.modalMetricLabel}>ETA</Text>
              <Text style={styles.modalMetricVal}>
                {selectedBus.etaMinutes > 0
                  ? `${selectedBus.etaMinutes} min`
                  : 'At Stop'}
              </Text>
            </View>
          </GlassCard>

          <GlassCard padded={false} style={[shadows.sm, styles.modalMetricCard]}>
            <View style={styles.modalMetricInner}>
              <Text style={styles.modalMetricLabel}>Boarded</Text>
              <Text style={styles.modalMetricVal}>
                {selectedBus.boardedCount}/{selectedBus.totalStudents}
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* 3 Action Buttons */}
        <View style={styles.modalActionsStack}>
          {/* Action 1: Ping Conductor */}
          <AnimatedPressable
            onPress={handlePingConductor}
            haptic="medium"
            style={[styles.modalActionBtn, shadows.sm]}
          >
            <LinearGradient
              colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalActionGradient}
            >
              <Svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke={palette.white}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </Svg>
              <Text style={styles.modalActionTextWhite}>Ping Conductor</Text>
            </LinearGradient>
          </AnimatedPressable>

          {/* Action 2: Force Offline */}
          <AnimatedPressable
            onPress={handleForceOffline}
            haptic="medium"
            style={[styles.modalActionBtn, shadows.sm]}
          >
            <View style={styles.modalActionForceOffline}>
              <Svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.error}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Circle cx="12" cy="12" r="10" />
                <Path d="m4.93 4.93 14.14 14.14" />
              </Svg>
              <Text style={styles.modalActionTextError}>Force Bus Offline</Text>
            </View>
          </AnimatedPressable>

          {/* Action 3: View Manifest Toggle */}
          <AnimatedPressable
            onPress={() => setShowManifest((prev) => !prev)}
            haptic="light"
            style={[styles.modalActionBtn, shadows.sm]}
          >
            <View style={styles.modalActionSecondary}>
              <Svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <Path d="M9 12h6M9 16h6" />
              </Svg>
              <Text style={styles.modalActionTextPrimary}>
                {showManifest
                  ? 'Hide Student Manifest'
                  : `View Manifest (${selectedBusStudents.length} Students)`}
              </Text>
            </View>
          </AnimatedPressable>
        </View>

        {/* Student Manifest ScrollView inside Modal */}
        {showManifest && (
          <View style={styles.modalManifestWrap}>
            <Text style={styles.modalManifestTitle}>Roster Manifest</Text>
            <ScrollView
              style={styles.modalManifestScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {selectedBusStudents.length === 0 ? (
                <Text style={styles.modalManifestEmpty}>
                  No students currently assigned to this route.
                </Text>
              ) : (
                selectedBusStudents.map((st) => {
                  const stColor = getStudentStatusColor(st.currentStatus);
                  return (
                    <View key={st.id} style={styles.manifestRow}>
                      <View style={styles.manifestRowLeft}>
                        <Text style={styles.manifestRowName}>{st.name}</Text>
                        <Text style={styles.manifestRowSub}>
                          Grade {st.grade} · 📍 {st.assignedStop}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.studentStatusBadge,
                          { backgroundColor: stColor.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.studentStatusText,
                            { color: stColor.color },
                          ]}
                        >
                          {st.currentStatus}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.border,
  },
  headerTitleWrap: {
    gap: spacing.xxs,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },

  // Shift Pulse Card
  shiftCard: {
    borderRadius: radius.lg,
  },
  shiftCardInner: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  shiftLiveText: {
    ...typography.overline,
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  shiftElapsedText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  shiftMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
  },
  shiftMetricItem: {
    alignItems: 'center',
    gap: 2,
  },
  shiftMetricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  shiftMetricVal: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  shiftDivider: {
    width: 1,
    height: 24,
    backgroundColor: glass.border,
  },

  // Section 1: Student Quick-Track
  searchSection: {
    gap: spacing.xs,
  },
  searchCard: {
    borderRadius: radius.lg,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  searchResultsWrap: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  noResultsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  studentResultCardWrap: {
    width: '100%',
  },
  studentResultCard: {
    borderRadius: radius.md,
  },
  studentResultInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  studentResultLeft: {
    flex: 1,
    gap: 2,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  studentResultName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: palette.ink10,
  },
  gradeBadgeText: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'none',
  },
  studentResultMeta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  studentStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  studentStatusText: {
    ...typography.overline,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'none',
  },

  // Section 2: Fleet Summary Row
  summaryCard: {
    borderRadius: radius.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  chipNumber: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  summaryChipDivider: {
    width: 1,
    height: 20,
    backgroundColor: glass.border,
  },

  // Status Legend
  legendCard: {
    borderRadius: radius.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  legendLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 17,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  expandHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  expandHeaderText: {
    ...typography.caption,
    fontWeight: '700',
    color: portalAccents.gateman.from,
  },

  // Bus Grid (3x2)
  busGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  busWidgetWrap: {
    width: '48.5%',
  },
  busWidgetCard: {
    borderRadius: radius.md,
  },
  busWidgetInner: {
    padding: spacing.sm,
    gap: 6,
  },
  busWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    ...typography.overline,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'none',
  },
  busWidgetEta: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  busWidgetNumber: {
    ...typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  busWidgetRoute: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textMuted,
    minHeight: 26,
  },
  progressContainer: {
    gap: 3,
    marginTop: 2,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  progressValue: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 5,
    borderRadius: radius.full,
    backgroundColor: palette.ink10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
  busWidgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: glass.border,
  },
  busWidgetDep: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  busWidgetConductor: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
    maxWidth: '55%',
  },

  // Map Card
  mapCardWrapper: {
    height: MAP_H,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  mapView: {
    flex: 1,
    borderRadius: radius.lg,
  },
  mapMarkerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 2,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...shadows.sm,
  },
  mapMarkerDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  mapMarkerText: {
    ...typography.overline,
    fontSize: 9,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  floatingExpandBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bus Quick-Action Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheetContainer: {
    maxHeight: Math.round(SCREEN_H * 0.78),
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.lg,
  },
  modalSheetInner: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  modalSheetBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    gap: spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalHeaderTitles: {
    flex: 1,
    gap: 3,
  },
  modalBusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalBusNumber: {
    ...typography.title,
    color: colors.textPrimary,
  },
  modalRouteName: {
    ...typography.caption,
    color: colors.textMuted,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glass.border,
  },
  modalCloseText: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },

  // Conductor Profile in Modal
  modalConductorCard: {
    borderRadius: radius.md,
  },
  modalConductorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: {
    ...typography.label,
    color: palette.white,
    fontWeight: '800',
  },
  modalConductorMeta: {
    gap: 2,
  },
  modalConductorName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  modalConductorPhone: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Modal Metrics Row
  modalMetricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalMetricCard: {
    flex: 1,
    borderRadius: radius.md,
  },
  modalMetricInner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  modalMetricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  modalMetricVal: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalMetricUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textMuted,
  },

  // Modal Actions Stack
  modalActionsStack: {
    gap: spacing.sm,
  },
  modalActionBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  modalActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  modalActionTextWhite: {
    ...typography.label,
    color: palette.white,
    fontWeight: '700',
  },
  modalActionForceOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
  },
  modalActionTextError: {
    ...typography.label,
    color: colors.error,
    fontWeight: '700',
  },
  modalActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.3)',
  },
  modalActionTextPrimary: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },

  // Manifest Scroll inside modal
  modalManifestWrap: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  modalManifestTitle: {
    ...typography.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  modalManifestScroll: {
    maxHeight: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.xs,
    backgroundColor: colors.surface,
  },
  modalManifestEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  manifestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.border,
  },
  manifestRowLeft: {
    flex: 1,
    gap: 1,
  },
  manifestRowName: {
    ...typography.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  manifestRowSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Full Screen Map Modal
  fullMapSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.border,
    backgroundColor: colors.surfaceStrong,
  },
  fullMapTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  fullMapSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  fullMapCloseBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: glass.border,
  },
  fullMapCloseText: {
    ...typography.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  fullMapView: {
    flex: 1,
  },
});
