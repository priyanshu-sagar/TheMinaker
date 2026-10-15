import React, { memo, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { SlideToConfirm } from '@/components/gateman/SlideToConfirm';

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
  EarlyPickup,
  EntryMethod,
  GateEntry,
  useGatemanStore,
} from '@/store/gateman.store';

// ─── Helpers ──────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m ago`;
}

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'ST';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getMethodVisuals(type: 'Arrival' | 'Departure', method: EntryMethod) {
  if (method === 'Self') {
    return {
      bg: colors.infoBg,
      fg: colors.info,
      label: 'Self Walk-in',
    };
  }
  if (method === 'Parent Pickup') {
    return {
      bg: colors.warningBg,
      fg: colors.warning,
      label: 'Parent Pickup',
    };
  }
  // Bus
  return {
    bg: colors.successBg,
    fg: colors.success,
    label: 'School Bus',
  };
}

// ─── Sub-Component: PickupCard ────────────────────────────────────────

interface PickupCardProps {
  pickup: EarlyPickup;
  onVerify: (id: string) => void;
  onDeny: (id: string) => void;
}

const PickupCard = memo(function PickupCard({ pickup, onVerify, onDeny }: PickupCardProps) {
  const isPending = pickup.status === 'Pending';
  const isVerified = pickup.status === 'Verified';
  const isDenied = pickup.status === 'Denied';

  const borderColor = isPending ? colors.warning : isVerified ? colors.success : colors.error;

  const handleCallParent = () => {
    if (!pickup.parentPhone) return;
    Linking.openURL(`tel:${pickup.parentPhone}`).catch(() => {
      Alert.alert('Phone Call', `Unable to place call to ${pickup.parentPhone}`);
    });
  };

  return (
    <GlassCard
      style={[
        shadows.md,
        styles.pickupCard,
        {
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
        },
      ]}
    >
      {/* Header Row: Initials Avatar + Student Name + Grade + Status */}
      <View style={styles.cardHeaderRow}>
        <LinearGradient
          colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
          style={styles.avatarCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{getInitials(pickup.studentName)}</Text>
        </LinearGradient>

        <View style={styles.headerInfo}>
          <View style={styles.nameGradeRow}>
            <Text style={styles.studentName} numberOfLines={1}>
              {pickup.studentName}
            </Text>
            <View style={styles.gradePill}>
              <Text style={styles.gradeText}>{pickup.grade}</Text>
            </View>
          </View>
          <Text style={styles.studentIdText}>ID: {pickup.studentId}</Text>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isPending
                ? colors.warningBg
                : isVerified
                ? colors.successBg
                : colors.errorBg,
            },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              {
                color: isPending ? colors.warning : isVerified ? colors.success : colors.error,
              },
            ]}
          >
            {pickup.status}
          </Text>
        </View>
      </View>

      {/* Parent Contact Row */}
      <View style={styles.parentRow}>
        <Text style={styles.parentLabel}>Parent:</Text>
        <Text style={styles.parentName}>{pickup.parentName}</Text>
        <AnimatedPressable onPress={handleCallParent} haptic="selection" style={styles.callPressable}>
          <View style={styles.callRow}>
            <Svg width={13} height={13} viewBox="0 0 24 24">
              <Path
                d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                fill={colors.primary}
              />
            </Svg>
            <Text style={styles.phoneText}>{pickup.parentPhone}</Text>
          </View>
        </AnimatedPressable>
      </View>

      {/* Reason Box */}
      <View style={styles.reasonBox}>
        <Text style={styles.reasonText}>"{pickup.reason}"</Text>
      </View>

      {/* Time Meta */}
      <Text style={styles.timeMeta}>Requested {relativeTime(pickup.requestedAt)}</Text>

      {/* Action Area */}
      {isPending && (
        <View style={styles.actionContainer}>
          <SlideToConfirm
            label="Slide to Verify & Authorize Entry"
            onConfirm={() => onVerify(pickup.id)}
            accentColor={colors.success}
          />
          <AnimatedPressable onPress={() => onDeny(pickup.id)} haptic="heavy">
            <View style={styles.denyBtn}>
              <Text style={styles.denyBtnText}>✕ Deny Entry</Text>
            </View>
          </AnimatedPressable>
        </View>
      )}

      {isVerified && (
        <View style={styles.successRow}>
          <Text style={styles.successText}>
            ✓ Entry Authorized — departed {relativeTime(pickup.verifiedAt ?? pickup.requestedAt)}
          </Text>
        </View>
      )}

      {isDenied && (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>✕ Entry Denied by Gate Control</Text>
        </View>
      )}
    </GlassCard>
  );
});

// ─── Main Screen Component ────────────────────────────────────────────

export default function GateAccessScreen() {
  const earlyPickups = useGatemanStore((state) => state.earlyPickups);
  const gateEntries = useGatemanStore((state) => state.gateEntries);
  const gateLockedDown = useGatemanStore((state) => state.gateLockedDown);
  const verifyPickup = useGatemanStore((state) => state.verifyPickup);
  const denyPickup = useGatemanStore((state) => state.denyPickup);
  const openGate = useGatemanStore((state) => state.openGate);
  const closeGate = useGatemanStore((state) => state.closeGate);
  const addShiftLog = useGatemanStore((state) => state.addShiftLog);

  const gateOpen = !gateLockedDown;

  // Manual visitor form state
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');

  // Counts & sorted entries
  const pendingCount = useMemo(
    () => earlyPickups.filter((p) => p.status === 'Pending').length,
    [earlyPickups],
  );

  const sortedEntries = useMemo(() => {
    return [...gateEntries].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [gateEntries]);

  // Handlers
  function handleVerify(id: string) {
    Alert.alert('Confirm Authorization', 'Verify parent identity and authorize student release?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Authorize', onPress: () => verifyPickup(id) },
    ]);
  }

  function handleDeny(id: string) {
    Alert.alert('Deny Entry', 'Are you sure you want to deny this pickup request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deny', style: 'destructive', onPress: () => denyPickup(id) },
    ]);
  }

  function handleToggleGate() {
    if (gateOpen) {
      Alert.alert(
        'Lock Campus Gate',
        'Close campus gate and pause all entry & exit activities?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Lock Gate', style: 'destructive', onPress: () => closeGate() },
        ],
      );
    } else {
      Alert.alert('Open Campus Gate', 'Reopen campus gate and resume normal operations?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Gate', onPress: () => openGate() },
      ]);
    }
  }

  function handleLogVisitor() {
    if (!visitorName.trim()) {
      Alert.alert('Required Field', 'Please enter visitor or contractor name.');
      return;
    }
    const description = `Manual entry logged: ${visitorName.trim()} — ${
      visitorPurpose.trim() || 'Purpose not specified'
    }`;
    addShiftLog({
      action: 'OVERRIDE',
      description,
    });
    setVisitorName('');
    setVisitorPurpose('');
    setVisitorOpen(false);
    Alert.alert('Logged', 'Visitor entry recorded in shift log.');
  }

  return (
    <MeshBackground>
      {/* Decorative Orbs behind main content */}
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />
      <View style={styles.orb3} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Gate Access</Text>
            <Text style={styles.headerSubtitle}>Student Entry, Exit & Exceptions</Text>
          </View>
          <NotificationBell />
        </View>

        <ScrollView
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── SECTION 3: Gate Lock Control (Top Bar) ─────────────── */}
          <GlassCard style={[shadows.md, styles.lockCard]}>
            <View style={styles.lockRow}>
              <View style={styles.lockLeft}>
                <View
                  style={[
                    styles.shieldWrap,
                    {
                      backgroundColor: gateOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    },
                  ]}
                >
                  <Svg width={22} height={22} viewBox="0 0 24 24">
                    <Path
                      d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                      fill={gateOpen ? colors.success : colors.error}
                    />
                  </Svg>
                </View>
                <View style={styles.lockTextWrap}>
                  <Text style={styles.lockLabel}>Campus Gate Status</Text>
                  <Text style={styles.lockStatusNote}>
                    {gateOpen ? 'Open · Ingress & Egress Active' : 'Locked · Strict Access Lockdown'}
                  </Text>
                </View>
              </View>

              <AnimatedPressable
                onPress={handleToggleGate}
                haptic="heavy"
                style={[
                  styles.togglePill,
                  { backgroundColor: gateOpen ? colors.success : colors.error },
                ]}
              >
                <Text style={styles.togglePillText}>{gateOpen ? 'OPEN' : 'LOCKED'}</Text>
              </AnimatedPressable>
            </View>

            {!gateOpen && (
              <View style={styles.lockWarningBanner}>
                <Text style={styles.lockWarningText}>
                  ⚠️ Gate locked. No entries/exits until reopened.
                </Text>
              </View>
            )}
          </GlassCard>

          {/* ─── SECTION 1: Early Pickup Exceptions Queue ──────────── */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionHeading}>Early Pickup Requests</Text>
              {pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingCount} PENDING</Text>
                </View>
              )}
            </View>
          </View>

          {earlyPickups.length === 0 ? (
            <GlassCard style={[shadows.sm, styles.emptyCard]}>
              <Text style={styles.emptyCardText}>No early pickup requests on file today.</Text>
            </GlassCard>
          ) : (
            earlyPickups.map((pickup) => (
              <PickupCard
                key={pickup.id}
                pickup={pickup}
                onVerify={handleVerify}
                onDeny={handleDeny}
              />
            ))
          )}

          {/* ─── SECTION 4: Manual Visitor Entry ──────────────────── */}
          <GlassCard style={[shadows.md, styles.visitorCard]}>
            <View style={styles.visitorHeaderRow}>
              <View style={styles.visitorHeaderTextWrap}>
                <Text style={styles.visitorTitle}>Manual Visitor Entry</Text>
                <Text style={styles.visitorSubtitle}>Log contractor, visitor or guest arrival</Text>
              </View>
              <AnimatedPressable
                onPress={() => setVisitorOpen((prev) => !prev)}
                haptic="selection"
                style={styles.plusToggleBtn}
              >
                <Text style={styles.plusToggleText}>{visitorOpen ? '✕' : '+'}</Text>
              </AnimatedPressable>
            </View>

            {visitorOpen && (
              <View style={styles.visitorForm}>
                <TextInput
                  placeholder="Visitor / contractor name"
                  placeholderTextColor={colors.textPlaceholder}
                  value={visitorName}
                  onChangeText={setVisitorName}
                  style={styles.glassInput}
                />
                <TextInput
                  placeholder="Purpose of visit (e.g. Maintenance, Delivery)"
                  placeholderTextColor={colors.textPlaceholder}
                  value={visitorPurpose}
                  onChangeText={setVisitorPurpose}
                  style={styles.glassInput}
                />
                <AnimatedPressable
                  onPress={handleLogVisitor}
                  haptic="medium"
                  style={styles.submitPressable}
                >
                  <LinearGradient
                    colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                    style={styles.submitBtnInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitBtnText}>Log Entry</Text>
                  </LinearGradient>
                </AnimatedPressable>
              </View>
            )}
          </GlassCard>

          {/* ─── SECTION 2: Live Gate Roster ───────────────────────── */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionHeading}>Gate Activity Today</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{sortedEntries.length}</Text>
              </View>
            </View>
          </View>

          {sortedEntries.length === 0 ? (
            <GlassCard style={[shadows.sm, styles.emptyCard]}>
              <Text style={styles.emptyCardText}>No activity recorded yet today.</Text>
            </GlassCard>
          ) : (
            sortedEntries.map((entry) => {
              const visuals = getMethodVisuals(entry.type, entry.method);
              return (
                <GlassCard key={entry.id} style={[shadows.sm, styles.rosterCard]}>
                  <View style={styles.rosterRow}>
                    {/* Method Icon Circle */}
                    <View style={[styles.rosterIconCircle, { backgroundColor: visuals.bg }]}>
                      {entry.method === 'Self' ? (
                        <Svg width={18} height={18} viewBox="0 0 24 24">
                          <Path
                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                            fill={visuals.fg}
                          />
                        </Svg>
                      ) : entry.method === 'Parent Pickup' ? (
                        <Svg width={18} height={18} viewBox="0 0 24 24">
                          <Path
                            d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                            fill={visuals.fg}
                          />
                        </Svg>
                      ) : (
                        <Svg width={18} height={18} viewBox="0 0 24 24">
                          <Path
                            d="M4 16C4 16.88 4.39 17.67 5 18.22V20H8V19H16V20H19V18.22C19.61 17.67 20 16.88 20 16V6C20 2 16 2 12 2C8 2 4 2 4 6V16ZM6 10V6H18V10H6Z"
                            fill={visuals.fg}
                          />
                        </Svg>
                      )}
                    </View>

                    {/* Middle Column */}
                    <View style={styles.rosterMid}>
                      <View style={styles.rosterNameRow}>
                        <Text style={styles.rosterStudentName}>{entry.studentName}</Text>
                        <View
                          style={[
                            styles.rosterTypePill,
                            {
                              backgroundColor:
                                entry.type === 'Arrival' ? colors.successBg : colors.droppedBg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rosterTypePillText,
                              {
                                color: entry.type === 'Arrival' ? colors.success : colors.dropped,
                              },
                            ]}
                          >
                            {entry.type === 'Arrival' ? 'Arrived' : 'Departed'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rosterDetailRow}>
                        <View style={styles.methodPill}>
                          <Text style={styles.methodPillText}>{entry.method}</Text>
                        </View>
                        {entry.busNumber && (
                          <Text style={styles.rosterBusText}>🚌 {entry.busNumber}</Text>
                        )}
                        {entry.authorizedBy && (
                          <Text style={styles.rosterAuthText}>Auth: {entry.authorizedBy}</Text>
                        )}
                      </View>
                    </View>

                    {/* Right: Formatted Time */}
                    <View style={styles.rosterRight}>
                      <Text style={styles.rosterTime}>{formatTime(entry.time)}</Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  orb1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: glass.orb1,
    opacity: 0.6,
  },
  orb2: {
    position: 'absolute',
    top: 320,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: radius.full,
    backgroundColor: glass.orb2,
    opacity: 0.45,
  },
  orb3: {
    position: 'absolute',
    bottom: 120,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: radius.full,
    backgroundColor: glass.orb4,
    opacity: 0.35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...typography.title,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
    gap: spacing.md,
  },

  // Gate Lock Section
  lockCard: {
    borderRadius: radius.lg,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  shieldWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTextWrap: {
    flex: 1,
  },
  lockLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  lockStatusNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  togglePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
  },
  togglePillText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockWarningBanner: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  lockWarningText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },

  // Section Headers
  sectionHeaderRow: {
    marginTop: spacing.xs,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeading: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pendingBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  pendingBadgeText: {
    ...typography.overline,
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  countBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },

  // Early Pickup Card
  pickupCard: {
    gap: spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  nameGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  studentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  gradePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  gradeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
    color: colors.textSecondary,
  },
  studentIdText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusPillText: {
    ...typography.overline,
    fontSize: 10,
    fontWeight: '700',
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  parentLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  parentName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  callPressable: {
    marginLeft: spacing.xs,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  phoneText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  reasonBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  reasonText: {
    ...typography.caption,
    fontStyle: 'italic',
    color: palette.ink80,
  },
  timeMeta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  actionContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  denyBtn: {
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    backgroundColor: colors.errorBg,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyBtnText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
  },
  successRow: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  successText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  errorRow: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },

  // Manual Visitor Entry Section
  visitorCard: {
    gap: spacing.sm,
  },
  visitorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitorHeaderTextWrap: {
    flex: 1,
  },
  visitorTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  visitorSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  plusToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusToggleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 20,
  },
  visitorForm: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  glassInput: {
    fontSize: 14,
    fontWeight: '400',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  submitPressable: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  submitBtnInner: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  submitBtnText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '700',
  },

  // Roster Entry Card
  rosterCard: {
    paddingVertical: spacing.md,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rosterIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterMid: {
    flex: 1,
    gap: 3,
  },
  rosterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rosterStudentName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rosterTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  rosterTypePillText: {
    ...typography.overline,
    fontSize: 9,
    fontWeight: '700',
  },
  rosterDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  methodPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  methodPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rosterBusText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  rosterAuthText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  rosterRight: {
    alignItems: 'flex-end',
  },
  rosterTime: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyCardText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
