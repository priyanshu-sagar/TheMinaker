import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

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
import { RequestStatus, RoutingRequest, useGatemanStore } from '@/store/gateman.store';

const FILTERS = ['All', 'Stop Change', 'Bus Transfer', 'Resolved'] as const;
type FilterType = (typeof FILTERS)[number];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return '';
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface RequestCardProps {
  request: RoutingRequest;
  selected?: boolean;
  selectMode?: boolean;
  onSelect?: (id: string) => void;
  onApprove: (id: string, studentName: string) => void;
  onReject: (id: string, studentName: string) => void;
}

const RequestCard = memo(function RequestCard({
  request,
  selected = false,
  selectMode = false,
  onSelect,
  onApprove,
  onReject,
}: RequestCardProps) {
  const isStopChange = request.requestType === 'Stop Change';

  return (
    <GlassCard
      style={[
        shadows.md,
        styles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: isStopChange ? portalAccents.gateman.from : colors.info,
        },
        selected ? { borderWidth: 2, borderColor: portalAccents.gateman.from } : {},
      ]}
    >
      {/* Top Row: checkbox (in select mode) + initials + name + grade pill | status pill */}
      <View style={styles.cardHeaderRow}>
        {selectMode && request.status === 'Pending' && (
          <Pressable
            onPress={() => onSelect?.(request.id)}
            style={[styles.checkbox, selected ? styles.checkboxSelected : styles.checkboxUnselected]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {selected ? <Text style={styles.checkMark}>✓</Text> : null}
          </Pressable>
        )}

        <View style={styles.studentInfoGroup}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{getInitials(request.studentName)}</Text>
          </View>
          <View style={styles.studentNameCol}>
            <Text style={styles.studentNameText} numberOfLines={1}>
              {request.studentName}
            </Text>
            <View style={styles.gradePill}>
              <Text style={styles.gradePillText}>{request.grade}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            request.status === 'Approved'
              ? styles.statusApproved
              : request.status === 'Rejected'
                ? styles.statusRejected
                : styles.statusPending,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              request.status === 'Approved'
                ? styles.statusTextApproved
                : request.status === 'Rejected'
                  ? styles.statusTextRejected
                  : styles.statusTextPending,
            ]}
          >
            {request.status}
          </Text>
        </View>
      </View>

      {/* Request type badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>
          {isStopChange ? '📍 Stop Change' : '🚌 Bus Transfer'}
        </Text>
      </View>

      {/* Content: Stop Change */}
      {isStopChange && (
        <View style={styles.stopChangeBlock}>
          <View style={styles.diffBox}>
            <View style={styles.diffRow}>
              <View style={[styles.dotCircle, { backgroundColor: colors.error }]} />
              <Text style={styles.diffLabel}>FROM: </Text>
              <Text style={styles.diffValue} numberOfLines={1}>
                {request.oldStop || 'Current Stop'}
              </Text>
            </View>

            <View style={styles.diffConnectorRow}>
              <Svg width="20" height="28">
                <Line
                  x1="10"
                  y1="0"
                  x2="10"
                  y2="28"
                  stroke={colors.textMuted}
                  strokeDasharray="4,3"
                  strokeWidth={2}
                />
              </Svg>
            </View>

            <View style={styles.diffRow}>
              <View style={[styles.dotCircle, { backgroundColor: colors.success }]} />
              <Text style={styles.diffLabel}>TO: </Text>
              <Text style={styles.diffValue} numberOfLines={1}>
                {request.newStop || 'New Stop'}
              </Text>
            </View>
          </View>

          {/* Map diff SVG - horizontal strip showing two pins connected by dashed line */}
          <View style={styles.mapDiffContainer}>
            <Svg width="240" height="40">
              <Circle cx={20} cy={20} r={8} fill={colors.error} />
              <Line
                x1={28}
                y1={20}
                x2={212}
                y2={20}
                stroke={colors.textMuted}
                strokeDasharray="6,4"
                strokeWidth={2}
              />
              <Circle cx={220} cy={20} r={8} fill={colors.success} />
              <SvgText x={20} y={38} textAnchor="middle" fill={colors.textMuted} fontSize={9}>
                OLD
              </SvgText>
              <SvgText x={220} y={38} textAnchor="middle" fill={colors.textMuted} fontSize={9}>
                NEW
              </SvgText>
            </Svg>
          </View>
        </View>
      )}

      {/* Content: Bus Transfer */}
      {!isStopChange && (
        <View style={styles.transferRow}>
          <View style={styles.transferBusBox}>
            <Text style={styles.transferBusRole}>CURRENT</Text>
            <Text style={styles.fromBusNumber}>{request.fromBusNumber || 'Bus A'}</Text>
          </View>
          <Text style={styles.transferArrow}>→</Text>
          <View style={styles.transferBusBox}>
            <Text style={styles.transferBusRole}>TARGET</Text>
            <Text style={styles.toBusNumber}>{request.toBusNumber || 'Bus B'}</Text>
          </View>
        </View>
      )}

      {/* Reason */}
      <View style={styles.reasonBox}>
        <Text style={styles.reasonText}>"{request.reason}"</Text>
      </View>

      {/* Meta Row: Parent name + tappable phone | time ago */}
      <View style={styles.metaRow}>
        <View style={styles.parentGroup}>
          <Text style={styles.parentNameText}>{request.parentName}</Text>
          {request.parentPhone ? (
            <AnimatedPressable
              haptic="selection"
              onPress={() => {
                Linking.openURL(`tel:${request.parentPhone}`).catch(() => {});
              }}
              style={styles.phoneChip}
            >
              <Text style={styles.phoneChipText}>📞 {request.parentPhone}</Text>
            </AnimatedPressable>
          ) : null}
        </View>
        <Text style={styles.timeAgoText}>{formatTimeAgo(request.submittedAt)}</Text>
      </View>

      {/* Actions */}
      {request.status === 'Pending' && !selectMode && (
        <View style={styles.cardActionsRow}>
          <AnimatedPressable
            haptic="medium"
            onPress={() => onApprove(request.id, request.studentName)}
            style={[styles.actionBtn, styles.approveBtn3D]}
          >
            <LinearGradient
              colors={[palette.emerald, palette.emeraldLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtnInner}
            >
              <Text style={styles.actionBtnText}>✓ Approve</Text>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable
            haptic="medium"
            onPress={() => onReject(request.id, request.studentName)}
            style={[styles.actionBtn, styles.rejectBtn3D]}
          >
            <LinearGradient
              colors={[palette.rose, palette.roseLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtnInner}
            >
              <Text style={styles.actionBtnText}>✗ Reject</Text>
            </LinearGradient>
          </AnimatedPressable>
        </View>
      )}

      {request.status === 'Approved' && (
        <View style={styles.approvedBanner}>
          <Text style={styles.approvedBannerText}>✓ Approved — Route updated</Text>
        </View>
      )}

      {request.status === 'Rejected' && (
        <View style={styles.rejectedBanner}>
          <Text style={styles.rejectedBannerText}>✗ Request rejected</Text>
        </View>
      )}
    </GlassCard>
  );
});

export default function ApprovalsScreen() {
  const routingRequests = useGatemanStore((state) => state.routingRequests);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);

  const [filter, setFilter] = useState<FilterType>('All');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pendingCount = useMemo(
    () => routingRequests.filter((r) => r.status === 'Pending').length,
    [routingRequests]
  );

  const filtered = useMemo(() => {
    return routingRequests
      .filter((r) => {
        if (filter === 'All') return true;
        if (filter === 'Stop Change') return r.requestType === 'Stop Change' && r.status === 'Pending';
        if (filter === 'Bus Transfer') return r.requestType === 'Bus Transfer' && r.status === 'Pending';
        if (filter === 'Resolved') return r.status !== 'Pending';
        return true;
      })
      .sort((a, b) => {
        // Pending first, then by date descending
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }, [routingRequests, filter]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleApprove = useCallback(
    (id: string, studentName: string) => {
      Alert.alert(
        'Approve Request',
        `Approve routing change for ${studentName}? Route and student records will update immediately.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            style: 'default',
            onPress: () => approveRequest(id),
          },
        ]
      );
    },
    [approveRequest]
  );

  const handleReject = useCallback(
    (id: string, studentName: string) => {
      Alert.alert(
        'Reject Request',
        `Are you sure you want to reject this routing request for ${studentName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: () => rejectRequest(id),
          },
        ]
      );
    },
    [rejectRequest]
  );

  const handleBulkApprove = useCallback(() => {
    if (selected.size === 0) return;
    Alert.alert(
      'Bulk Approve',
      `Approve ${selected.size} selected request${selected.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          style: 'default',
          onPress: () => {
            selected.forEach((id) => approveRequest(id));
            setSelected(new Set());
            setSelectMode(false);
          },
        },
      ]
    );
  }, [selected, approveRequest]);

  const handleBulkReject = useCallback(() => {
    if (selected.size === 0) return;
    Alert.alert(
      'Bulk Reject',
      `Reject ${selected.size} selected request${selected.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject All',
          style: 'destructive',
          onPress: () => {
            selected.forEach((id) => rejectRequest(id));
            setSelected(new Set());
            setSelectMode(false);
          },
        },
      ]
    );
  }, [selected, rejectRequest]);

  return (
    <MeshBackground>
      {/* Decorative background orbs */}
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
          bottom: 100,
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
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>Approvals</Text>
              {pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>Parent routing requests</Text>
          </View>
          <NotificationBell />
        </View>

        {/* Filter Tabs & Bulk Select Bar */}
        <View style={styles.stickyFilterContainer}>
          <View style={styles.filterPillsRow}>
            {FILTERS.map((f) => {
              const isSelected = filter === f;
              return (
                <AnimatedPressable
                  key={f}
                  haptic="selection"
                  onPress={() => setFilter(f)}
                  style={[styles.filterPill, isSelected ? styles.filterPillActive : styles.filterPillInactive]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                    ]}
                  >
                    {f}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          {pendingCount >= 2 && (
            <View style={styles.bulkToggleRow}>
              <AnimatedPressable
                haptic="selection"
                onPress={() => {
                  setSelectMode((prev) => !prev);
                  setSelected(new Set());
                }}
                style={[styles.bulkToggleBtn, selectMode && styles.bulkToggleBtnActive]}
              >
                <Text style={[styles.bulkToggleBtnText, selectMode && styles.bulkToggleBtnTextActive]}>
                  {selectMode ? 'Cancel Select' : 'Select Multiple'}
                </Text>
              </AnimatedPressable>
            </View>
          )}
        </View>

        {/* Scrollable Request Cards */}
        <ScrollView
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <GlassCard style={[styles.emptyCard, shadows.sm]}>
              <Svg width={48} height={48} viewBox="0 0 24 24">
                <Path
                  d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                  fill={colors.success}
                />
              </Svg>
              <Text style={[typography.bodyBold, { marginTop: spacing.md }]}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                No {filter !== 'All' ? filter : ''} requests pending.
              </Text>
            </GlassCard>
          ) : (
            filtered.map((item) => (
              <RequestCard
                key={item.id}
                request={item}
                selected={selected.has(item.id)}
                selectMode={selectMode}
                onSelect={toggleSelect}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Bulk Select Mode Bottom Dock */}
      {selectMode && (
        <View style={styles.bulkDockContainer}>
          <BlurView intensity={80} tint="light" style={styles.bulkDockBlur}>
            <View style={styles.bulkDockRow}>
              <Text style={styles.bulkDockCount}>{selected.size} selected</Text>
              <View style={styles.bulkDockActions}>
                <AnimatedPressable
                  haptic="medium"
                  disabled={selected.size === 0}
                  onPress={handleBulkApprove}
                  style={[
                    styles.bulkDockBtn,
                    styles.bulkDockApprove,
                    selected.size === 0 && styles.bulkDockDisabled,
                  ]}
                >
                  <Text style={styles.bulkDockBtnText}>Approve All</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  haptic="medium"
                  disabled={selected.size === 0}
                  onPress={handleBulkReject}
                  style={[
                    styles.bulkDockBtn,
                    styles.bulkDockReject,
                    selected.size === 0 && styles.bulkDockDisabled,
                  ]}
                >
                  <Text style={styles.bulkDockBtnText}>Reject All</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  haptic="selection"
                  onPress={() => {
                    setSelectMode(false);
                    setSelected(new Set());
                  }}
                  style={styles.bulkDockCancel}
                >
                  <Text style={styles.bulkDockCancelText}>Cancel</Text>
                </AnimatedPressable>
              </View>
            </View>
          </BlurView>
        </View>
      )}
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pendingBadge: {
    backgroundColor: portalAccents.gateman.from,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pendingBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  stickyFilterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  filterPillInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
  },
  filterPillText: {
    ...typography.caption,
    fontSize: 12,
  },
  filterPillTextActive: {
    color: palette.white,
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  bulkToggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  bulkToggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  bulkToggleBtnActive: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  bulkToggleBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: portalAccents.gateman.from,
  },
  bulkToggleBtnTextActive: {
    color: palette.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 140,
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  checkboxSelected: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  checkboxUnselected: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
  },
  checkMark: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  studentInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  initialsCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: portalAccents.gateman.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: palette.white,
    fontWeight: '800',
    fontSize: 13,
  },
  studentNameCol: {
    flex: 1,
    justifyContent: 'center',
  },
  studentNameText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  gradePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  gradePillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusPending: {
    backgroundColor: colors.warningBg,
  },
  statusApproved: {
    backgroundColor: colors.successBg,
  },
  statusRejected: {
    backgroundColor: colors.errorBg,
  },
  statusPillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextApproved: {
    color: colors.success,
  },
  statusTextRejected: {
    color: colors.error,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginVertical: spacing.xs,
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stopChangeBlock: {
    marginVertical: spacing.xs,
  },
  diffBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  diffLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  diffValue: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  diffConnectorRow: {
    paddingLeft: 3,
    height: 28,
    justifyContent: 'center',
  },
  mapDiffContainer: {
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: radius.md,
    marginVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
  },
  transferBusBox: {
    alignItems: 'center',
    flex: 1,
  },
  transferBusRole: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  fromBusNumber: {
    fontWeight: '700',
    color: colors.error,
    fontSize: 14,
  },
  toBusNumber: {
    fontWeight: '700',
    color: colors.success,
    fontSize: 14,
  },
  transferArrow: {
    color: colors.textMuted,
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  reasonBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    marginVertical: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: colors.borderStrong,
  },
  reasonText: {
    fontStyle: 'italic',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  parentGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    flexWrap: 'wrap',
  },
  parentNameText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phoneChip: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  phoneChipText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  timeAgoText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.full,
  },
  approveBtn3D: {
    elevation: 5,
    shadowColor: palette.emerald,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  rejectBtn3D: {
    elevation: 5,
    shadowColor: palette.rose,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  actionBtnInner: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: palette.white,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  approvedBanner: {
    marginTop: spacing.md,
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  approvedBannerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
    fontSize: 13,
  },
  rejectedBanner: {
    marginTop: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  rejectedBannerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.error,
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    marginVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bulkDockContainer: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
  },
  bulkDockBlur: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderTopColor: glass.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: glass.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  bulkDockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bulkDockCount: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  bulkDockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  bulkDockBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  bulkDockApprove: {
    backgroundColor: palette.emerald,
  },
  bulkDockReject: {
    backgroundColor: palette.rose,
  },
  bulkDockDisabled: {
    opacity: 0.4,
  },
  bulkDockBtnText: {
    color: palette.white,
    fontWeight: '700',
    fontSize: 12,
  },
  bulkDockCancel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  bulkDockCancelText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
