import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  colors,
  glass,
  portalAccents,
  radius,
  spacing,
  shadows,
  typography,
  palette,
} from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { GlassModal } from '@/components/glass/GlassModal';
import { SearchBar } from '@/components/glass/SearchBar';
import {
  useGatemanStore,
  AttendanceStatus,
  RosterEntry,
  getBusStats,
} from '@/store/gateman.store';

function formatTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * 3-button pill toggle row: Boarded | Dropped | Checked Out
 * Sunken-track container with tactile pill buttons.
 */
function AttendancePillToggle({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: AttendanceStatus;
  onStatusChange: (s: AttendanceStatus) => void;
}) {
  const OPTIONS: { status: AttendanceStatus; label: string; color: string; bg: string }[] = [
    { status: 'Boarded',     label: 'Boarded',     color: colors.success,  bg: colors.successBg },
    { status: 'Dropped',     label: 'Dropped',     color: colors.info,     bg: colors.infoBg },
    { status: 'Checked Out', label: 'Out',         color: colors.warning,  bg: colors.warningBg },
  ];

  return (
    <View style={pilStyles.track}>
      {OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.status;
        return (
          <AnimatedPressable
            key={opt.status}
            onPress={() => onStatusChange(opt.status)}
            haptic="medium"
            style={[
              pilStyles.btn,
              isActive && {
                backgroundColor: opt.bg,
                borderColor: opt.color,
                ...shadows.sm,
              },
            ]}
          >
            <Text
              style={[
                pilStyles.btnText,
                isActive && { color: opt.color, fontWeight: '700' },
              ]}
            >
              {opt.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const pilStyles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    marginTop: spacing.sm,
    padding: 3,
    gap: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.full,
  },
  btnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
});

/**
 * Premium GlassCard Student Card with initial avatar, roll info, Absent chip, and 3D pill toggle.
 */
const StudentAttendanceCard = React.memo(function StudentAttendanceCard({
  entry,
  onStatusChange,
}: {
  entry: RosterEntry;
  onStatusChange: (id: string, status: AttendanceStatus) => void;
}) {
  const initial = entry.studentName.charAt(0).toUpperCase();
  const rollNumber = `Roll #${entry.id.replace('roster-', '').padStart(2, '0')}`;
  const isAbsent = entry.attendanceStatus === 'Absent';

  return (
    <GlassCard style={shadows.md} padded={false}>
      <View style={cardStyles.inner}>
        <View
          style={{
            width: 3,
            backgroundColor: portalAccents.gateman.from,
            borderRadius: 2,
            marginRight: spacing.sm,
            alignSelf: 'stretch',
          }}
        />
        <LinearGradient
          colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyles.avatar}
        >
          <Text style={cardStyles.avatarText}>{initial}</Text>
        </LinearGradient>

        <View style={cardStyles.content}>
          <View style={cardStyles.headerRow}>
            <View style={{ flex: 1, marginRight: spacing.xs }}>
              <Text style={cardStyles.studentName} numberOfLines={1}>
                {entry.studentName}
              </Text>
              <View style={cardStyles.metaRow}>
                <Text style={cardStyles.rollText}>{rollNumber}</Text>
                {entry.statusUpdatedAt ? (
                  <Text style={cardStyles.timeText}>• {formatTime(entry.statusUpdatedAt)}</Text>
                ) : null}
              </View>
            </View>

            {isAbsent ? (
              <AnimatedPressable
                onPress={() => onStatusChange(entry.id, 'Pending')}
                haptic="selection"
                style={cardStyles.absentBadge}
              >
                <Text style={cardStyles.absentText}>✕ Absent</Text>
              </AnimatedPressable>
            ) : (
              <AnimatedPressable
                onPress={() => onStatusChange(entry.id, 'Absent')}
                haptic="selection"
                style={cardStyles.markAbsentBtn}
              >
                <Text style={cardStyles.markAbsentText}>Absent</Text>
              </AnimatedPressable>
            )}
          </View>

          <AttendancePillToggle
            currentStatus={entry.attendanceStatus}
            onStatusChange={(s) => onStatusChange(entry.id, s)}
          />
        </View>
      </View>
    </GlassCard>
  );
});

const cardStyles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.white,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  rollText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  absentBadge: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  absentText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 11,
  },
  markAbsentBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
    borderColor: colors.borderStrong,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  markAbsentText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '500',
    fontSize: 11,
  },
});

export default function MasterAttendanceScreen() {
  const fleet = useGatemanStore((state) => state.fleet);
  const roster = useGatemanStore((state) => state.roster);
  const updateAttendanceStatus = useGatemanStore((state) => state.updateAttendanceStatus);

  const [selectedBusId, setSelectedBusId] = useState(fleet[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [routeModalVisible, setRouteModalVisible] = useState(false);

  const selectedBus = useMemo(
    () => fleet.find((b) => b.id === selectedBusId) ?? fleet[0],
    [fleet, selectedBusId]
  );

  const stats = useMemo(() => getBusStats(roster, selectedBusId), [roster, selectedBusId]);

  const busRoster = useMemo(() => {
    const rows = roster.filter((entry) => entry.busId === selectedBusId);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((entry) => entry.studentName.toLowerCase().includes(q));
  }, [roster, selectedBusId, query]);

  const handleStatusChange = useCallback(
    (id: string, status: AttendanceStatus) => {
      updateAttendanceStatus(id, status);
    },
    [updateAttendanceStatus]
  );

  const openRouteSelector = useCallback(() => {
    setRouteModalVisible(true);
  }, []);

  return (
    <MeshBackground>
      {/* Decorative orbs — always behind content */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          top: '32%',
          left: -80,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.45,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 90,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.4,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Master Attendance</Text>
          <Text style={styles.subtitle}>Mark student boarding status by route</Text>
        </View>

        {/* Route Selector Dropdown Card */}
        <AnimatedPressable
          onPress={openRouteSelector}
          haptic="light"
          style={styles.routeSelectorWrap}
        >
          <GlassCard style={[shadows.md, { backgroundColor: 'rgba(255,255,255,0.65)' }]} padded={false}>
            <View style={styles.routeCardInner}>
              <View style={styles.busBadgeIcon}>
                <Text style={styles.busEmoji}>🚌</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.routeLabelRow}>
                  <Text style={styles.routeLabel}>SELECTED ROUTE</Text>
                  {selectedBus ? (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            selectedBus.status === 'Online' ? colors.onlineBg : colors.offlineBg,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              selectedBus.status === 'Online' ? colors.online : colors.offline,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              selectedBus.status === 'Online' ? colors.online : colors.offline,
                          },
                        ]}
                      >
                        {selectedBus.status}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={typography.bodyBold} numberOfLines={1}>
                  {selectedBus?.routeName ?? 'Select a route'}
                </Text>
                <Text style={styles.busMeta}>
                  {selectedBus
                    ? `${selectedBus.busNumber} • Conductor: ${selectedBus.conductorName}`
                    : 'Tap to choose route'}
                </Text>
              </View>
              <Text style={styles.iosChevron}>›</Text>
            </View>
          </GlassCard>
        </AnimatedPressable>

        {/* Live Route Stats Bar */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statName}>Total</Text>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: colors.successBg, borderColor: colors.success },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.boardedIn}
            </Text>
            <Text style={[styles.statName, { color: colors.success }]}>Boarded</Text>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: colors.infoBg, borderColor: colors.info },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.info }]}>
              {stats.droppedOut}
            </Text>
            <Text style={[styles.statName, { color: colors.info }]}>Dropped</Text>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: colors.errorBg, borderColor: colors.error },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.absent}</Text>
            <Text style={[styles.statName, { color: colors.error }]}>Absent</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search student by name"
          />
        </View>

        {/* Student Roster FlatList */}
        <FlatList
          data={busRoster}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptySubtitle}>
                {query
                  ? `No student matching "${query}"`
                  : 'No students assigned to this route'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <StudentAttendanceCard
                entry={item}
                onStatusChange={handleStatusChange}
              />
            </FadeInRow>
          )}
        />

        {/* Route Selector GlassModal */}
        <GlassModal
          visible={routeModalVisible}
          title="Select Bus Route"
          onClose={() => setRouteModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {fleet.map((bus) => {
              const isSelected = bus.id === selectedBusId;
              const isOnline = bus.status === 'Online';
              return (
                <AnimatedPressable
                  key={bus.id}
                  onPress={() => {
                    setSelectedBusId(bus.id);
                    setRouteModalVisible(false);
                  }}
                  haptic="selection"
                  style={[
                    styles.modalBusRow,
                    isSelected && styles.modalBusRowSelected,
                    shadows.sm,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.modalBusHeader}>
                      <Text
                        style={[
                          styles.modalBusNumber,
                          isSelected && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {bus.busNumber}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isOnline ? colors.onlineBg : colors.offlineBg,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: isOnline ? colors.online : colors.offline,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: isOnline ? colors.online : colors.offline },
                          ]}
                        >
                          {bus.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modalBusRoute} numberOfLines={1}>
                      {bus.routeName}
                    </Text>
                    <Text style={styles.modalBusMeta}>
                      {bus.conductorName} • {bus.conductorPhone}
                    </Text>
                  </View>

                  {isSelected ? (
                    <View style={styles.checkIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke={colors.primary}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  ) : null}
                </AnimatedPressable>
              );
            })}
          </View>
        </GlassModal>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.border,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  routeSelectorWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  routeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  busBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busEmoji: {
    fontSize: 22,
  },
  routeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  routeLabel: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  busMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  iosChevron: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statName: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalContent: {
    gap: spacing.sm,
  },
  modalBusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  modalBusRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  modalBusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  modalBusNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  modalBusRoute: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  modalBusMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  checkIcon: {
    marginLeft: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
