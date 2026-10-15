import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
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
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { StatusPill } from '@/components/shared/StatusPill';
import {
  RequestStatus,
  RoutingRequest,
  useGatemanStore,
} from '@/store/gateman.store';

// ─── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || 'ST').toUpperCase();
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.round(diffMs / 60000));
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    }
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
    }
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } catch {
    return 'Recently';
  }
}

// ─── Request Card Component ───────────────────────────────────────────────

interface RequestCardProps {
  request: RoutingRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  selectionMode?: boolean;
}

const RequestCard = memo(function RequestCard({
  request,
  onApprove,
  onReject,
  selected = false,
  onSelect,
  selectionMode = false,
}: RequestCardProps) {
  const isStopChange = request.requestType === 'Stop Change';
  const isPending = request.status === 'Pending';
  const isApproved = request.status === 'Approved';
  const isRejected = request.status === 'Rejected';

  const accentColor = isStopChange ? portalAccents.gateman.from : colors.info;

  const handleApprove = useCallback(() => {
    Alert.alert(
      'Confirm Approval',
      'Approve this request? This will update the student route.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => onApprove(request.id),
        },
      ],
    );
  }, [onApprove, request.id]);

  const handleReject = useCallback(() => {
    Alert.alert(
      'Confirm Rejection',
      'Reject this routing request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => onReject(request.id),
        },
      ],
    );
  }, [onReject, request.id]);

  const handleCall = useCallback(() => {
    const cleanPhone = request.parentPhone.replace(/\s+/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Phone Call', `Unable to initiate call to ${request.parentPhone}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Unable to initiate call to ${request.parentPhone}`);
      });
  }, [request.parentPhone]);

  const handleCardPress = useCallback(() => {
    if (selectionMode && isPending && onSelect) {
      onSelect(request.id);
    }
  }, [selectionMode, isPending, onSelect, request.id]);

  return (
    <AnimatedPressable
      haptic="selection"
      disabled={!selectionMode || !isPending}
      onPress={handleCardPress}
      style={styles.cardPressable}
    >
      <GlassCard
        style={[
          styles.requestCard,
          shadows.md,
          {
            borderLeftColor: accentColor,
            borderLeftWidth: 4,
          },
          selected && styles.cardSelected,
        ]}
      >
        {/* Top Row: Avatar / Checkbox + Name / Grade + Status Pill */}
        <View style={styles.cardHeaderRow}>
          {selectionMode && isPending && (
            <AnimatedPressable
              haptic="selection"
              onPress={() => onSelect && onSelect(request.id)}
              style={styles.checkboxTouch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={[
                  styles.checkboxCircle,
                  selected && styles.checkboxCircleSelected,
                ]}
              >
                {selected && (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17L4 12"
                      stroke="#FFFFFF"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
            </AnimatedPressable>
          )}

          {/* Student Initials Avatar */}
          <LinearGradient
            colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>{getInitials(request.studentName)}</Text>
          </LinearGradient>

          {/* Student Info */}
          <View style={styles.studentInfoCol}>
            <Text style={styles.studentName} numberOfLines={1}>
              {request.studentName}
            </Text>
            <View style={styles.studentMetaRow}>
              <View style={styles.gradePill}>
                <Text style={styles.gradeText}>Grade {request.grade}</Text>
              </View>
              <Text style={styles.studentIdText}>#{request.studentId}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <StatusPill
            variant={
              isPending ? 'warning' : isApproved ? 'success' : 'error'
            }
            label={request.status}
            showDot
          />
        </View>

        {/* Request Type Badge */}
        <View style={styles.typeBadgeRow}>
          <View
            style={[
              styles.typeBadge,
              isStopChange ? styles.typeBadgeStop : styles.typeBadgeBus,
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                isStopChange ? styles.typeBadgeTextStop : styles.typeBadgeTextBus,
              ]}
            >
              {isStopChange ? '🔀 Stop Change' : '🚌 Bus Transfer'}
            </Text>
          </View>
        </View>

        {/* Content Section: Stop Change vs Bus Transfer */}
        {isStopChange ? (
          <View style={styles.diffSection}>
            {/* Diff Rows */}
            <View style={styles.diffRow}>
              <View style={styles.diffTagOld}>
                <Text style={styles.diffTagTextOld}>📍 Old</Text>
              </View>
              <Text
                style={[
                  styles.diffStopText,
                  (isApproved || isRejected) && styles.diffStrikethrough,
                ]}
                numberOfLines={1}
              >
                {request.oldStop || 'Assigned Origin Stop'}
              </Text>
            </View>

            <View style={styles.diffRow}>
              <View style={styles.diffTagNew}>
                <Text style={styles.diffTagTextNew}>📍 New</Text>
              </View>
              <Text style={[styles.diffStopText, styles.diffStopNewText]} numberOfLines={1}>
                {request.newStop || 'Requested Pickup Stop'}
              </Text>
            </View>

            {/* Mini SVG Static Map Diff */}
            <View style={styles.mapSnippetBox}>
              <Svg width="100%" height={48} viewBox="0 0 300 48">
                {/* Connecting Dashed Line */}
                <Line
                  x1={36}
                  y1={16}
                  x2={264}
                  y2={16}
                  stroke={palette.ink20}
                  strokeWidth={2}
                  strokeDasharray="5,4"
                />

                {/* Old Stop (Red circle at left) */}
                <Circle cx={36} cy={16} r={5} fill={palette.rose} />
                <Circle cx={36} cy={16} r={2} fill="#FFFFFF" />
                <SvgText
                  x={36}
                  y={36}
                  fontSize={10}
                  fontWeight="600"
                  fill={colors.textMuted}
                  textAnchor="middle"
                >
                  Old Stop
                </SvgText>

                {/* New Stop (Green circle at right) */}
                <Circle cx={264} cy={16} r={5} fill={palette.emerald} />
                <Circle cx={264} cy={16} r={2} fill="#FFFFFF" />
                <SvgText
                  x={264}
                  y={36}
                  fontSize={10}
                  fontWeight="700"
                  fill={palette.emerald}
                  textAnchor="middle"
                >
                  New Stop
                </SvgText>
              </Svg>
            </View>
          </View>
        ) : (
          <View style={styles.busTransferSection}>
            <View style={styles.busTransferRow}>
              <View style={styles.busPill}>
                <Text style={styles.busPillLabel}>From Bus</Text>
                <Text style={styles.busPillNumber} numberOfLines={1}>
                  {request.fromBusNumber || 'Current Bus'}
                </Text>
              </View>
              <View style={styles.transferArrowWrap}>
                <Text style={styles.transferArrowText}>➡️</Text>
              </View>
              <View style={[styles.busPill, styles.busPillTarget]}>
                <Text style={[styles.busPillLabel, styles.busPillTargetLabel]}>To Bus</Text>
                <Text style={[styles.busPillNumber, styles.busPillTargetNumber]} numberOfLines={1}>
                  {request.toBusNumber || 'Target Bus'}
                </Text>
              </View>
            </View>
            <Text style={styles.busTransferSubtitle}>
              Requested for earlier departure
            </Text>
          </View>
        )}

        {/* Reason Section */}
        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>"{request.reason}"</Text>
        </View>

        {/* Submitter & Time Row */}
        <View style={styles.submitterRow}>
          <View style={styles.submitterInfo}>
            <Text style={styles.parentNameText}>{request.parentName}</Text>
            <AnimatedPressable
              haptic="selection"
              onPress={handleCall}
              style={styles.phoneChip}
            >
              <Text style={styles.phoneIcon}>📞</Text>
              <Text style={styles.phoneText}>{request.parentPhone}</Text>
            </AnimatedPressable>
          </View>
          <Text style={styles.timeAgoText}>
            Submitted {formatTimeAgo(request.submittedAt)}
          </Text>
        </View>

        {/* Action Buttons Row or Resolved Status Banner */}
        {isPending ? (
          <View style={styles.actionsRow}>
            <AnimatedPressable
              haptic="medium"
              onPress={handleApprove}
              style={[styles.actionBtn, styles.approveBtn3D]}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                <Text style={styles.actionBtnText}>✓ Approve</Text>
              </LinearGradient>
            </AnimatedPressable>

            <AnimatedPressable
              haptic="medium"
              onPress={handleReject}
              style={[styles.actionBtn, styles.rejectBtn3D]}
            >
              <LinearGradient
                colors={['#F43F5E', '#FB7185']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                <Text style={styles.actionBtnText}>✗ Reject</Text>
              </LinearGradient>
            </AnimatedPressable>
          </View>
        ) : isApproved ? (
          <View style={styles.approvedStatusRow}>
            <Text style={styles.approvedStatusText}>✓ Approved — Route updated</Text>
          </View>
        ) : (
          <View style={styles.rejectedStatusRow}>
            <Text style={styles.rejectedStatusText}>✗ Request rejected</Text>
          </View>
        )}
      </GlassCard>
    </AnimatedPressable>
  );
});

// ─── Filter Segmented Control ─────────────────────────────────────────────

type FilterTab = 'All' | 'Stop Change' | 'Bus Transfer';

interface FilterSegmentProps {
  filter: FilterTab;
  counts: Record<FilterTab, number>;
  onChange: (tab: FilterTab) => void;
}

function FilterSegmentedControl({ filter, counts, onChange }: FilterSegmentProps) {
  const tabs: FilterTab[] = ['All', 'Stop Change', 'Bus Transfer'];

  return (
    <BlurView intensity={30} tint="light" style={styles.segmentTrack}>
      {tabs.map((tab) => {
        const isActive = filter === tab;
        return (
          <AnimatedPressable
            key={tab}
            haptic="selection"
            onPress={() => onChange(tab)}
            style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
              {tab}
            </Text>
            {counts[tab] > 0 && (
              <View
                style={[
                  styles.segmentBadge,
                  isActive && styles.segmentBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentBadgeText,
                    isActive && styles.segmentBadgeTextActive,
                  ]}
                >
                  {counts[tab]}
                </Text>
              </View>
            )}
          </AnimatedPressable>
        );
      })}
    </BlurView>
  );
}

// ─── Main Screen Component ────────────────────────────────────────────────

export default function RequestMatrixScreen() {
  const routingRequests = useGatemanStore((state) => state.routingRequests ?? []);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);

  const [filter, setFilter] = useState<FilterTab>('All');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pending count for subtitle badge
  const pendingCount = useMemo(
    () => routingRequests.filter((r) => r.status === 'Pending').length,
    [routingRequests],
  );

  // Tab counts for segment indicators
  const filterCounts = useMemo<Record<FilterTab, number>>(() => {
    return {
      All: routingRequests.length,
      'Stop Change': routingRequests.filter((r) => r.requestType === 'Stop Change').length,
      'Bus Transfer': routingRequests.filter((r) => r.requestType === 'Bus Transfer').length,
    };
  }, [routingRequests]);

  // Sort: Pending first, then Approved, then Rejected. Newer first within same group.
  const sortedRequests = useMemo(() => {
    const filtered = routingRequests.filter((req) => {
      if (filter === 'All') return true;
      return req.requestType === filter;
    });

    const STATUS_WEIGHT: Record<RequestStatus, number> = {
      Pending: 0,
      Approved: 1,
      Rejected: 2,
    };

    return [...filtered].sort((a, b) => {
      const priorityDiff = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [routingRequests, filter]);

  // Pending items in the current view that can be selected
  const viewPendingRequests = useMemo(
    () => sortedRequests.filter((r) => r.status === 'Pending'),
    [sortedRequests],
  );

  // Handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === viewPendingRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(viewPendingRequests.map((r) => r.id)));
    }
  }, [selectedIds.size, viewPendingRequests]);

  const handleBulkApprove = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Bulk Approval',
      `Approve ${selectedIds.size} routing request${selectedIds.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          style: 'default',
          onPress: () => {
            selectedIds.forEach((id) => approveRequest(id));
            setSelectedIds(new Set());
            setSelectionMode(false);
          },
        },
      ],
    );
  }, [selectedIds, approveRequest]);

  const handleBulkReject = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Bulk Rejection',
      `Reject ${selectedIds.size} routing request${selectedIds.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject All',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => rejectRequest(id));
            setSelectedIds(new Set());
            setSelectionMode(false);
          },
        },
      ],
    );
  }, [selectedIds, rejectRequest]);

  const handleSingleApprove = useCallback(
    (id: string) => {
      approveRequest(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [approveRequest],
  );

  const handleSingleReject = useCallback(
    (id: string) => {
      rejectRequest(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [rejectRequest],
  );

  return (
    <MeshBackground>
      {/* Decorative Orbs — Bubbly background floating decoration */}
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={typography.title}>Request Matrix</Text>
            <View style={styles.subtitleRow}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Parent routing requests
              </Text>
              {pendingCount > 0 && (
                <View style={styles.headerPendingBadge}>
                  <Text style={styles.headerPendingText}>{pendingCount} pending</Text>
                </View>
              )}
            </View>
          </View>
          <NotificationBell />
        </View>

        {/* Filter Segmented Control */}
        <View style={styles.filterWrap}>
          <FilterSegmentedControl
            filter={filter}
            counts={filterCounts}
            onChange={setFilter}
          />
        </View>

        {/* Scrollable Request Cards List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            // Extra bottom padding when bulk actions floating bar is active
            (selectionMode || viewPendingRequests.length >= 2) && { paddingBottom: 130 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sortedRequests.length === 0 ? (
            /* Empty State */
            <FadeInRow index={0}>
              <GlassCard style={[styles.emptyCard, shadows.sm]}>
                <View style={styles.emptyIconCircle}>
                  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17L4 12"
                      stroke={palette.emerald}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={typography.heading}>All caught up!</Text>
                <Text style={[typography.caption, styles.emptySubtitle]}>
                  No {filter === 'All' ? '' : filter.toLowerCase()} routing requests in this
                  view.
                </Text>
              </GlassCard>
            </FadeInRow>
          ) : (
            sortedRequests.map((req, idx) => (
              <FadeInRow key={req.id} index={idx}>
                <RequestCard
                  request={req}
                  onApprove={handleSingleApprove}
                  onReject={handleSingleReject}
                  selected={selectedIds.has(req.id)}
                  onSelect={handleToggleSelect}
                  selectionMode={selectionMode}
                />
              </FadeInRow>
            ))
          )}
        </ScrollView>

        {/* Autonomous Feature: Bulk Actions Bar */}
        {viewPendingRequests.length >= 2 && !selectionMode && (
          <View style={styles.floatingBarWrap} pointerEvents="box-none">
            <AnimatedPressable
              haptic="medium"
              onPress={() => {
                setSelectionMode(true);
                setSelectedIds(new Set());
              }}
              style={[styles.floatingSelectBtn, shadows.lg]}
            >
              <LinearGradient
                colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.floatingSelectGradient}
              >
                <Text style={styles.floatingSelectIcon}>☑️</Text>
                <Text style={styles.floatingSelectText}>Select Multiple</Text>
                <View style={styles.floatingBadge}>
                  <Text style={styles.floatingBadgeText}>{viewPendingRequests.length}</Text>
                </View>
              </LinearGradient>
            </AnimatedPressable>
          </View>
        )}

        {/* Selection Mode Docked Bottom Bar */}
        {selectionMode && (
          <View style={styles.selectionDockWrap}>
            <BlurView intensity={55} tint="light" style={styles.selectionDockBlur}>
              <View style={styles.selectionHeaderRow}>
                <Text style={styles.selectionCountText}>
                  {selectedIds.size} of {viewPendingRequests.length} selected
                </Text>

                <View style={styles.selectionActionsRow}>
                  <AnimatedPressable
                    haptic="selection"
                    onPress={handleSelectAll}
                    style={styles.selectionSmallBtn}
                  >
                    <Text style={styles.selectionSmallBtnText}>
                      {selectedIds.size === viewPendingRequests.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    haptic="selection"
                    onPress={() => {
                      setSelectionMode(false);
                      setSelectedIds(new Set());
                    }}
                    style={styles.selectionCancelBtn}
                  >
                    <Text style={styles.selectionCancelBtnText}>Cancel</Text>
                  </AnimatedPressable>
                </View>
              </View>

              {/* Action Buttons in Selection Mode */}
              <View style={styles.selectionButtonsRow}>
                <AnimatedPressable
                  haptic="medium"
                  disabled={selectedIds.size === 0}
                  onPress={handleBulkApprove}
                  style={[
                    styles.selectionActionBtn,
                    selectedIds.size === 0 && styles.selectionActionBtnDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      selectedIds.size > 0
                        ? ['#10B981', '#34D399']
                        : ['#94A3B8', '#CBD5E1']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.selectionActionGradient}
                  >
                    <Text style={styles.selectionActionText}>
                      ✓ Approve All ({selectedIds.size})
                    </Text>
                  </LinearGradient>
                </AnimatedPressable>

                <AnimatedPressable
                  haptic="medium"
                  disabled={selectedIds.size === 0}
                  onPress={handleBulkReject}
                  style={[
                    styles.selectionActionBtn,
                    selectedIds.size === 0 && styles.selectionActionBtnDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      selectedIds.size > 0
                        ? ['#F43F5E', '#FB7185']
                        : ['#94A3B8', '#CBD5E1']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.selectionActionGradient}
                  >
                    <Text style={styles.selectionActionText}>
                      ✗ Reject All ({selectedIds.size})
                    </Text>
                  </LinearGradient>
                </AnimatedPressable>
              </View>
            </BlurView>
          </View>
        )}
      </SafeAreaView>
    </MeshBackground>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerPendingBadge: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  headerPendingText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 11,
  },
  filterWrap: {
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.border,
    marginBottom: spacing.xs,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: radius.full,
    padding: 3,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },
  segmentLabel: {
    ...typography.label,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  segmentBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentBadgeActive: {
    backgroundColor: portalAccents.gateman.from,
  },
  segmentBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 10,
  },
  segmentBadgeTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  cardPressable: {
    borderRadius: radius.lg,
  },
  requestCard: {
    backgroundColor: glass.cardBgStrong,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardSelected: {
    borderColor: portalAccents.gateman.from,
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxTouch: {
    paddingRight: 2,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  checkboxCircleSelected: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: portalAccents.gateman.from,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  studentInfoCol: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  studentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gradePill: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  gradeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  studentIdText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  typeBadgeRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
  },
  typeBadgeStop: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  typeBadgeBus: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  typeBadgeTextStop: {
    color: portalAccents.gateman.from,
  },
  typeBadgeTextBus: {
    color: colors.info,
  },
  diffSection: {
    marginTop: spacing.xs,
    gap: 6,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diffTagOld: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diffTagTextOld: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  diffTagNew: {
    backgroundColor: colors.successBg,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diffTagTextNew: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  diffStopText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  diffStopNewText: {
    fontWeight: '600',
    color: colors.success,
  },
  diffStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  mapSnippetBox: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
    paddingVertical: 2,
  },
  busTransferSection: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  busTransferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: glass.border,
  },
  busPill: {
    flex: 1,
    gap: 2,
  },
  busPillTarget: {
    alignItems: 'flex-end',
  },
  busPillLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  busPillTargetLabel: {
    color: colors.info,
  },
  busPillNumber: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  busPillTargetNumber: {
    color: colors.info,
  },
  transferArrowWrap: {
    paddingHorizontal: spacing.sm,
  },
  transferArrowText: {
    fontSize: 18,
  },
  busTransferSubtitle: {
    ...typography.caption,
    fontStyle: 'italic',
    color: colors.textMuted,
  },
  reasonBox: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderLeftWidth: 2,
    borderLeftColor: colors.borderStrong,
  },
  reasonText: {
    ...typography.body,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitterRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  parentNameText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  phoneIcon: {
    fontSize: 10,
  },
  phoneText: {
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.full,
  },
  approveBtn3D: {
    elevation: 6,
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  rejectBtn3D: {
    elevation: 6,
    shadowColor: '#F43F5E',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  actionBtnGradient: {
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  approvedStatusRow: {
    marginTop: spacing.md,
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  approvedStatusText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
    fontSize: 13,
  },
  rejectedStatusRow: {
    marginTop: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  rejectedStatusText: {
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
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  floatingBarWrap: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  floatingSelectBtn: {
    borderRadius: radius.full,
  },
  floatingSelectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  floatingSelectIcon: {
    fontSize: 14,
  },
  floatingSelectText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  floatingBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
    marginLeft: 2,
  },
  floatingBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  selectionDockWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectionDockBlur: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderTopColor: glass.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: 'rgba(255,255,255,0.85)',
    gap: spacing.sm,
    shadowColor: glass.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  selectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionCountText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  selectionActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectionSmallBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectionSmallBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: portalAccents.gateman.from,
  },
  selectionCancelBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  selectionCancelBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  selectionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectionActionBtn: {
    flex: 1,
    borderRadius: radius.full,
  },
  selectionActionBtnDisabled: {
    opacity: 0.6,
  },
  selectionActionGradient: {
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  selectionActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
