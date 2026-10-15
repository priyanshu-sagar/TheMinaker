import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import {
  useGatemanStore,
  type LogAction,
  type ShiftLogEntry,
} from '@/store/gateman.store';
import { useAuthStore } from '@/store/auth.store';
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

function actionColor(a: LogAction): string {
  const m: Record<LogAction, string> = {
    APPROVED: colors.success,
    AUTHORIZED: colors.info,
    ALERT_RESOLVED: colors.success,
    REJECTED: colors.error,
    DENIED: colors.error,
    SOS_SENT: colors.error,
    BUS_OFFLINE: colors.textMuted,
    OVERRIDE: colors.warning,
  };
  return m[a] ?? colors.textMuted;
}

function actionIcon(a: LogAction): string {
  const m: Record<LogAction, string> = {
    APPROVED: '✓',
    AUTHORIZED: '🛡',
    ALERT_RESOLVED: '✓',
    REJECTED: '✕',
    DENIED: '✕',
    SOS_SENT: '🚨',
    BUS_OFFLINE: '⚠',
    OVERRIDE: '⚡',
  };
  return m[a] ?? '•';
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ShiftLogsScreen() {
  const authStore = useAuthStore();
  const userName =
    authStore.user?.fullName ??
    (authStore as any).name ??
    (authStore as any).phone ??
    'Gateman';

  const userInitials = useMemo(() => {
    return (
      userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('') || 'GM'
    );
  }, [userName]);

  // Store state
  const shiftLog = useGatemanStore((s) => s.shiftLog);
  const buses = useGatemanStore((s) => s.buses);
  const students = useGatemanStore((s) => s.students);
  const earlyPickups = useGatemanStore((s) => s.earlyPickups);
  const routingRequests = useGatemanStore((s) => s.routingRequests);
  const gateLockedDown = useGatemanStore((s) => s.gateLockedDown);
  const addShiftLog = useGatemanStore((s) => s.addShiftLog);

  // Shift duration counter: started at 07:00 AM today
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const shiftStart = useMemo(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    if (d.getTime() > now) {
      d.setDate(d.getDate() - 1);
    }
    return d;
  }, [now]);

  const shiftElapsedMs = Math.max(0, now - shiftStart.getTime());
  const shiftHours = Math.floor(shiftElapsedMs / 3600000);
  const shiftMins = Math.floor((shiftElapsedMs % 3600000) / 60000);
  const shiftDuration = `${shiftHours}h ${shiftMins}m`;

  // Shift stats
  const approvalsToday = useMemo(
    () => shiftLog.filter((e) => e.action === 'APPROVED').length,
    [shiftLog]
  );
  const pickupsVerified = useMemo(
    () => shiftLog.filter((e) => e.action === 'AUTHORIZED').length,
    [shiftLog]
  );
  const gateEvents = useMemo(
    () =>
      shiftLog.filter((e) =>
        ['OVERRIDE', 'BUS_OFFLINE', 'SOS_SENT'].includes(e.action)
      ).length,
    [shiftLog]
  );

  // Operations 2x2 grid stats
  const activeFleet = useMemo(
    () => buses.filter((b) => b.status !== 'Offline').length,
    [buses]
  );
  const studentsTracked = students.length;
  const pendingActions = useMemo(
    () =>
      earlyPickups.filter((p) => p.status === 'Pending').length +
      routingRequests.filter((r) => r.status === 'Pending').length,
    [earlyPickups, routingRequests]
  );
  const resolvedToday = useMemo(
    () =>
      shiftLog.filter((e) =>
        ['APPROVED', 'AUTHORIZED', 'ALERT_RESOLVED'].includes(e.action)
      ).length,
    [shiftLog]
  );

  // Handover notes
  const [handoverNote, setHandoverNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = () => {
    const trimmed = handoverNote.trim();
    if (!trimmed) return;
    addShiftLog({
      action: 'OVERRIDE',
      description: `Handover Note: ${trimmed}`,
    });
    setNoteSaved(true);
  };

  // Pagination for audit log
  const [showCount, setShowCount] = useState(15);
  const sortedLog = useMemo(() => {
    return [...shiftLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [shiftLog]);
  const displayedLog = useMemo(
    () => sortedLog.slice(0, showCount),
    [sortedLog, showCount]
  );

  // Export summary
  const handleExport = () => {
    const summary = [
      `═══════════════════════════════════`,
      `   THE MINAKER — SHIFT REPORT`,
      `═══════════════════════════════════`,
      `Date: ${new Date().toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`,
      `Gateman: ${userName}`,
      `Duration: ${shiftDuration} (since 7:00 AM)`,
      `Gate Status: ${gateLockedDown ? 'Closed / Lockdown' : 'Open / Monitoring'}`,
      `───────────────────────────────────`,
      `Total Log Entries: ${shiftLog.length}`,
      `Approvals Today: ${approvalsToday}`,
      `Authorized Pickups: ${pickupsVerified}`,
      `Gate & Safety Events: ${gateEvents}`,
      `Active Fleet: ${activeFleet} of ${buses.length} buses`,
      `Students Tracked: ${studentsTracked}`,
      `Pending Actions: ${pendingActions}`,
      `───────────────────────────────────`,
      handoverNote.trim()
        ? `Handover Note:\n"${handoverNote.trim()}"`
        : `Handover Note: (None entered)`,
      `═══════════════════════════════════`,
    ].join('\n');

    Alert.alert('Shift Summary Export', summary, [{ text: 'Close' }]);
  };

  const handleSignOut = () => {
    Alert.alert(
      'End Shift?',
      'This will sign you out of the gateman portal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authStore.signOut();
            router.replace('/(auth)/onboarding');
          },
        },
      ]
    );
  };

  return (
    <MeshBackground>
      {/* Decorative floating orbs behind content */}
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
          top: 340,
          left: -70,
          width: 270,
          height: 270,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          right: -50,
          width: 210,
          height: 210,
          borderRadius: radius.full,
          backgroundColor: glass.orb4,
          opacity: 0.45,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.headerTitle}>Shift & Logs</Text>
              <Text style={styles.headerSubtitle}>
                Duty management & accountability
              </Text>
            </View>
            <NotificationBell />
          </View>

          {/* Section 1: Gateman Profile + Shift Card */}
          <GlassCard style={[shadows.md, styles.profileCard]}>
            <View style={styles.profileTopRow}>
              <LinearGradient
                colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                style={styles.avatarCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{userInitials}</Text>
              </LinearGradient>

              <View style={styles.profileInfo}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.userRoleText}>Gate Security Officer</Text>
                <View style={styles.onDutyPill}>
                  <View style={styles.onDutyDot} />
                  <Text style={styles.onDutyText}>On Duty</Text>
                </View>
              </View>

              <View style={styles.shiftDurationBox}>
                <Text style={styles.shiftDurationLabel}>Shift</Text>
                <Text style={styles.shiftDurationValue}>{shiftDuration}</Text>
                <Text style={styles.shiftSinceText}>since 7:00 AM</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.profileStatsRow}>
              <View style={styles.profileStatCol}>
                <Text style={styles.profileStatNumber}>{approvalsToday}</Text>
                <Text style={styles.profileStatLabel}>Approvals Today</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.profileStatCol}>
                <Text style={styles.profileStatNumber}>{pickupsVerified}</Text>
                <Text style={styles.profileStatLabel}>Pickups Verified</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.profileStatCol}>
                <Text style={styles.profileStatNumber}>{gateEvents}</Text>
                <Text style={styles.profileStatLabel}>Gate Events</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <AnimatedPressable
              onPress={handleSignOut}
              style={styles.signOutBtn}
              haptic="medium"
            >
              <Text style={styles.signOutBtnText}>🚪 End Shift & Sign Out</Text>
            </AnimatedPressable>
          </GlassCard>

          {/* Section 2: Shift Summary Stats */}
          <GlassCard style={[shadows.md, styles.sectionCard]}>
            <View style={styles.summaryHeaderRow}>
              <Text style={styles.sectionOverline}>DAILY OPERATIONS SUMMARY</Text>
              <View
                style={[
                  styles.gateStatusPill,
                  {
                    backgroundColor: gateLockedDown
                      ? colors.errorBg
                      : colors.successBg,
                    borderColor: gateLockedDown
                      ? colors.dangerBorder
                      : colors.borderStrong,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.gateStatusText,
                    {
                      color: gateLockedDown ? colors.error : colors.success,
                    },
                  ]}
                >
                  {gateLockedDown ? '🔒 Gate Closed' : '🔓 Gate Open'}
                </Text>
              </View>
            </View>

            <View style={styles.grid2x2}>
              <View style={styles.gridRow}>
                <View
                  style={[
                    styles.gridTile,
                    {
                      backgroundColor: colors.infoBg,
                      borderColor: colors.infoBorder,
                    },
                  ]}
                >
                  <View style={styles.gridTileTop}>
                    <Text style={styles.gridTileIcon}>🚌</Text>
                    <Text style={[styles.gridTileValue, { color: colors.info }]}>
                      {activeFleet}
                    </Text>
                  </View>
                  <Text style={styles.gridTileLabel}>Active Fleet</Text>
                  <Text style={styles.gridTileSub}>
                    {buses.length} total buses registered
                  </Text>
                </View>

                <View
                  style={[
                    styles.gridTile,
                    {
                      backgroundColor: colors.boardedBg,
                      borderColor: colors.borderStrong,
                    },
                  ]}
                >
                  <View style={styles.gridTileTop}>
                    <Text style={styles.gridTileIcon}>🎒</Text>
                    <Text
                      style={[
                        styles.gridTileValue,
                        { color: palette.brand },
                      ]}
                    >
                      {studentsTracked}
                    </Text>
                  </View>
                  <Text style={styles.gridTileLabel}>Students Tracked</Text>
                  <Text style={styles.gridTileSub}>Active roster cohort</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View
                  style={[
                    styles.gridTile,
                    {
                      backgroundColor: colors.warningBg,
                      borderColor: colors.warningBorder,
                    },
                  ]}
                >
                  <View style={styles.gridTileTop}>
                    <Text style={styles.gridTileIcon}>⏳</Text>
                    <Text
                      style={[
                        styles.gridTileValue,
                        { color: colors.warning },
                      ]}
                    >
                      {pendingActions}
                    </Text>
                  </View>
                  <Text style={styles.gridTileLabel}>Pending Actions</Text>
                  <Text style={styles.gridTileSub}>
                    Early pickups & transfers
                  </Text>
                </View>

                <View
                  style={[
                    styles.gridTile,
                    {
                      backgroundColor: colors.successBg,
                      borderColor: colors.borderStrong,
                    },
                  ]}
                >
                  <View style={styles.gridTileTop}>
                    <Text style={styles.gridTileIcon}>✅</Text>
                    <Text
                      style={[
                        styles.gridTileValue,
                        { color: colors.success },
                      ]}
                    >
                      {resolvedToday}
                    </Text>
                  </View>
                  <Text style={styles.gridTileLabel}>Resolved Today</Text>
                  <Text style={styles.gridTileSub}>
                    Logged approvals & permits
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Section 3: Shift Handover Notes */}
          <GlassCard style={[shadows.sm, styles.sectionCard]}>
            <View style={styles.handoverHeader}>
              <Text style={styles.handoverTitle}>Shift Handover Notes</Text>
              <Text style={styles.handoverSubtitle}>
                Add observations and instructions for the incoming security officer
              </Text>
            </View>

            <AppTextInput
              value={handoverNote}
              onChangeText={(text) => {
                setHandoverNote(text);
                if (noteSaved) setNoteSaved(false);
              }}
              placeholder="Add notes for the next gateman (e.g. Bus 5 in maintenance depot, parent arriving 11:30 AM)..."
              placeholderTextColor={colors.textPlaceholder}
              multiline
              numberOfLines={4}
              style={styles.handoverInput}
            />

            <View style={styles.handoverFooter}>
              {noteSaved ? (
                <View style={styles.savedBadge}>
                  <Text style={styles.savedBadgeText}>✓ Note saved to audit log</Text>
                </View>
              ) : (
                <Text style={styles.handoverHint}>
                  Auto-timestamps into shift log
                </Text>
              )}

              <AnimatedPressable
                haptic="medium"
                disabled={!handoverNote.trim()}
                onPress={handleSaveNote}
                style={[
                  styles.saveBtnWrapper,
                  !handoverNote.trim() && styles.saveBtnDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    handoverNote.trim()
                      ? [portalAccents.gateman.from, portalAccents.gateman.to]
                      : [palette.ink20, palette.ink20]
                  }
                  style={styles.saveBtnInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text
                    style={[
                      styles.saveBtnText,
                      !handoverNote.trim() && { color: colors.textPlaceholder },
                    ]}
                  >
                    Save Note
                  </Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </GlassCard>

          {/* Section 4: Full Audit Log Timeline */}
          <View style={styles.auditHeader}>
            <View style={styles.auditHeaderLeft}>
              <Text style={styles.auditTitle}>Shift Audit Log</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{shiftLog.length}</Text>
              </View>
            </View>
            <Text style={styles.auditDate}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>

          <View style={styles.timelineList}>
            {displayedLog.map((entry: ShiftLogEntry, i: number) => {
              const isLast = i === displayedLog.length - 1;
              const dotColor = actionColor(entry.action);
              const icon = actionIcon(entry.action);

              return (
                <View key={entry.id} style={styles.logEntry}>
                  {/* Timeline Left Connector */}
                  <View style={styles.timelineLeft}>
                    <View
                      style={[styles.logDot, { backgroundColor: dotColor }]}
                    >
                      <Text style={styles.logIcon}>{icon}</Text>
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Content Glass Card */}
                  <GlassCard style={[shadows.sm, styles.logCard]}>
                    <View style={styles.logCardHeader}>
                      <View
                        style={[
                          styles.actionChip,
                          {
                            backgroundColor: dotColor + '18',
                            borderColor: dotColor + '40',
                          },
                        ]}
                      >
                        <Text
                          style={[styles.actionChipText, { color: dotColor }]}
                        >
                          {entry.action.replace('_', ' ')}
                        </Text>
                      </View>
                      <Text style={styles.logTime}>
                        {formatTime(entry.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.logDescription}>
                      {entry.description}
                    </Text>
                  </GlassCard>
                </View>
              );
            })}
          </View>

          {showCount < sortedLog.length && (
            <AnimatedPressable
              onPress={() => setShowCount((c) => c + 15)}
              haptic="light"
              style={styles.loadMorePressable}
            >
              <View style={styles.loadMoreBtn}>
                <Text style={styles.loadMoreText}>
                  Load More ({sortedLog.length - showCount} remaining)
                </Text>
              </View>
            </AnimatedPressable>
          )}

          {/* Section 5: Quick Export Note */}
          <AnimatedPressable
            onPress={handleExport}
            haptic="light"
            style={styles.exportPressable}
          >
            <View style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>
                📋 Export Shift Summary
              </Text>
            </View>
          </AnimatedPressable>
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 140,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTextGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Section 1: Profile Card
  profileCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.bodyBold,
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userNameText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  userRoleText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  onDutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  onDutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  onDutyText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    lineHeight: 12,
  },
  shiftDurationBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  shiftDurationLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shiftDurationValue: {
    ...typography.title,
    color: portalAccents.gateman.from,
    fontWeight: '800',
    marginVertical: 1,
  },
  shiftSinceText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },

  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  profileStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatNumber: {
    ...typography.heading,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  profileStatLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
  },

  signOutBtn: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnText: {
    ...typography.bodyBold,
    color: colors.error,
  },

  // Section 2: Summary Stats Card
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionOverline: {
    ...typography.overline,
    color: colors.textMuted,
  },
  gateStatusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  gateStatusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  grid2x2: {
    gap: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gridTile: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  gridTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridTileIcon: {
    fontSize: 18,
  },
  gridTileValue: {
    ...typography.heading,
    fontWeight: '800',
  },
  gridTileLabel: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  gridTileSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Section 3: Handover Notes
  handoverHeader: {
    marginBottom: spacing.sm,
  },
  handoverTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  handoverSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  handoverInput: {
    ...typography.body,
    minHeight: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
    padding: spacing.md,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  handoverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  savedBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
  },
  handoverHint: {
    ...typography.caption,
    color: colors.textPlaceholder,
  },
  saveBtnWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: palette.white,
  },

  // Section 4: Audit Log
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  auditHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  auditTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  countPill: {
    backgroundColor: portalAccents.gateman.from + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  countPillText: {
    ...typography.caption,
    fontWeight: '700',
    color: portalAccents.gateman.from,
  },
  auditDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timelineList: {
    marginBottom: spacing.sm,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing.sm,
    alignSelf: 'stretch',
  },
  logDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  logIcon: {
    fontSize: 12,
    color: palette.white,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: 4,
    marginBottom: 2,
  },
  logCard: {
    flex: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  actionChipText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logTime: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  logDescription: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  loadMorePressable: {
    marginVertical: spacing.sm,
    alignSelf: 'center',
  },
  loadMoreBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  loadMoreText: {
    ...typography.caption,
    fontWeight: '600',
    color: portalAccents.gateman.from,
  },

  // Section 5: Export Button
  exportPressable: {
    marginTop: spacing.md,
    alignSelf: 'center',
    width: '100%',
  },
  exportBtn: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: portalAccents.gateman.from + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    ...typography.bodyBold,
    color: portalAccents.gateman.from,
  },
});
