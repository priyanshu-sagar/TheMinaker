import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Bus,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from 'lucide-react-native';

import {
  colors,
  glass,
  palette,
  portalAccents,
  radius,
  shadows,
  spacing,
  springs,
  typography,
} from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { GlassModal } from '@/components/glass/GlassModal';
import { StatusPill } from '@/components/shared/StatusPill';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import {
  EarlyPickup,
  GateEntry,
  useGatemanStore,
} from '@/store/gateman.store';

// ─── Formatters ────────────────────────────────────────────────────────────

function formatTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatMinutesAgo(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} min ago`;
    const hours = Math.floor(diffMins / 60);
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
}

// ─── Pickup Card Component (React.memo) ───────────────────────────────────

interface PickupCardProps {
  pickup: EarlyPickup;
  onVerify: (id: string, studentName: string, parentName: string) => void;
  onDeny: (id: string, studentName: string) => void;
}

const PickupCard = memo(function PickupCard({
  pickup,
  onVerify,
  onDeny,
}: PickupCardProps) {
  const handleVerify = useCallback(() => {
    onVerify(pickup.id, pickup.studentName, pickup.parentName);
  }, [onVerify, pickup.id, pickup.studentName, pickup.parentName]);

  const handleDeny = useCallback(() => {
    onDeny(pickup.id, pickup.studentName);
  }, [onDeny, pickup.id, pickup.studentName]);

  const handleCall = useCallback(() => {
    if (pickup.parentPhone) {
      Linking.openURL(`tel:${pickup.parentPhone}`).catch(() => undefined);
    }
  }, [pickup.parentPhone]);

  const pillVariant =
    pickup.status === 'Verified'
      ? 'success'
      : pickup.status === 'Denied'
      ? 'error'
      : 'warning';

  return (
    <GlassCard style={[shadows.md, styles.pickupCard]}>
      {/* Top row: Student name (bold) + Grade pill + Status pill */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.studentInfoRow}>
          <Text style={typography.heading}>{pickup.studentName}</Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>{pickup.grade}</Text>
          </View>
        </View>
        <StatusPill variant={pillVariant} label={pickup.status} size="sm" />
      </View>

      {/* Second row: Parent name + phone (tappable → Linking.openURL('tel:...')) */}
      <View style={styles.parentRow}>
        <Text style={[typography.bodyBold, styles.parentLabel]}>
          Parent: <Text style={styles.parentName}>{pickup.parentName}</Text>
        </Text>
        <AnimatedPressable
          onPress={handleCall}
          style={styles.phoneChip}
          accessibilityLabel={`Call ${pickup.parentName}`}
          accessibilityRole="button"
        >
          <Phone size={12} color={portalAccents.gateman.from} />
          <Text style={styles.phoneText}>{pickup.parentPhone}</Text>
        </AnimatedPressable>
      </View>

      {/* Reason text (italic, muted) */}
      <Text style={styles.reasonText}>"{pickup.reason}"</Text>

      {/* Time: "Requested X min ago" */}
      <View style={styles.timeRow}>
        <Clock size={12} color={colors.textMuted} />
        <Text style={styles.timeText}>Requested {formatMinutesAgo(pickup.requestedAt)}</Text>
      </View>

      {/* IF status === 'Pending': Two large action buttons row */}
      {pickup.status === 'Pending' && (
        <View style={styles.actionRow}>
          <AnimatedPressable
            onPress={handleVerify}
            style={[styles.verifyBtnWrap, shadows.sm]}
            accessibilityRole="button"
            accessibilityLabel="Verify and authorize pickup"
          >
            <LinearGradient
              colors={[palette.emerald, palette.emeraldLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyBtnInner}
            >
              <Check size={16} color={palette.white} strokeWidth={2.5} />
              <Text style={styles.verifyBtnText}>Verify & Authorize</Text>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleDeny}
            style={[styles.denyBtnWrap, shadows.sm]}
            accessibilityRole="button"
            accessibilityLabel="Deny early pickup entry"
          >
            <View style={styles.denyBtnInner}>
              <X size={15} color={colors.error} strokeWidth={2.2} />
              <Text style={styles.denyBtnText}>Deny Entry</Text>
            </View>
          </AnimatedPressable>
        </View>
      )}

      {/* IF status === 'Verified': Authorized green banner */}
      {pickup.status === 'Verified' && (
        <View style={styles.verifiedRow}>
          <CheckCircle2 size={16} color={colors.success} strokeWidth={2.2} />
          <Text style={styles.verifiedText}>
            ✓ Authorized — Departed at {formatTime(pickup.verifiedAt || pickup.requestedAt)}
          </Text>
        </View>
      )}

      {/* IF status === 'Denied': Entry Denied red banner */}
      {pickup.status === 'Denied' && (
        <View style={styles.deniedRow}>
          <XCircle size={16} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.deniedText}>✗ Entry Denied</Text>
        </View>
      )}
    </GlassCard>
  );
});

// ─── Main Screen Component ────────────────────────────────────────────────

export default function AccessScreen() {
  const gateEntries = useGatemanStore((s) => s.gateEntries);
  const earlyPickups = useGatemanStore((s) => s.earlyPickups);
  const gateLockedDown = useGatemanStore((s) => s.gateLockedDown);
  const shiftLog = useGatemanStore((s) => s.shiftLog);
  const verifyPickup = useGatemanStore((s) => s.verifyPickup);
  const denyPickup = useGatemanStore((s) => s.denyPickup);
  const toggleGateLock = useGatemanStore((s) => s.toggleGateLock);
  const addShiftLog = useGatemanStore((s) => s.addShiftLog);

  // Visitor log modal & inputs
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [manualCollapsed, setManualCollapsed] = useState(false);

  // Animated gate toggle dot
  const toggleProgress = useSharedValue(gateLockedDown ? 1 : 0);

  useEffect(() => {
    toggleProgress.value = withSpring(gateLockedDown ? 1 : 0, springs.snappy);
  }, [gateLockedDown, toggleProgress]);

  const animatedDotStyle = useAnimatedStyle(() => {
    const translateX = interpolate(toggleProgress.value, [0, 1], [2, 28]);
    return {
      transform: [{ translateX }],
      backgroundColor: gateLockedDown ? colors.error : colors.success,
    };
  });

  // Handlers
  const handleToggleGateLock = useCallback(() => {
    if (!gateLockedDown) {
      Alert.alert(
        'Confirm Lockdown',
        'Set gate to LOCKDOWN mode? All entry and exit will be halted immediately.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm Lockdown',
            style: 'destructive',
            onPress: () => {
              toggleGateLock();
              addShiftLog({
                action: 'OVERRIDE',
                description: 'Gate set to EMERGENCY LOCKDOWN by Gateman',
              });
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Lift Lockdown',
        'Return gate to normal OPEN operation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Lift Lockdown',
            onPress: () => {
              toggleGateLock();
              addShiftLog({
                action: 'ALERT_RESOLVED',
                description: 'Gate lockdown lifted by Gateman — operations resumed',
              });
            },
          },
        ],
      );
    }
  }, [gateLockedDown, toggleGateLock, addShiftLog]);

  const handleVerifyPickup = useCallback(
    (id: string, studentName: string, parentName: string) => {
      Alert.alert(
        'Verify & Authorize',
        `Authorize early departure for ${studentName} with parent ${parentName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Authorize',
            onPress: () => {
              verifyPickup(id);
            },
          },
        ],
      );
    },
    [verifyPickup],
  );

  const handleDenyPickup = useCallback(
    (id: string, studentName: string) => {
      Alert.alert(
        'Deny Early Pickup',
        `Deny early pickup entry request for ${studentName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deny Entry',
            style: 'destructive',
            onPress: () => {
              denyPickup(id);
            },
          },
        ],
      );
    },
    [denyPickup],
  );

  const handleOpenVisitorModal = useCallback(() => {
    setVisitorModalOpen(true);
  }, []);

  const handleCloseVisitorModal = useCallback(() => {
    setVisitorModalOpen(false);
  }, []);

  const handleSaveVisitor = useCallback(() => {
    if (!visitorName.trim()) {
      Alert.alert('Required', 'Please enter a visitor name.');
      return;
    }
    const description = `Manual Entry: ${visitorName.trim()}${
      visitorPurpose.trim() ? ` — ${visitorPurpose.trim()}` : ''
    }${visitorContact.trim() ? ` (Visiting: ${visitorContact.trim()})` : ''}`;

    addShiftLog({
      action: 'OVERRIDE',
      description,
    });

    setVisitorName('');
    setVisitorPurpose('');
    setVisitorContact('');
    setVisitorModalOpen(false);
    Alert.alert('Success', 'Manual entry logged to shift record.');
  }, [visitorName, visitorPurpose, visitorContact, addShiftLog]);

  const handleToggleManualSection = useCallback(() => {
    setManualCollapsed((prev) => !prev);
  }, []);

  // Sorted entries (newest first)
  const sortedEntries = useMemo(() => {
    return [...gateEntries].sort((a, b) => {
      const ta = new Date(a.time).getTime() || 0;
      const tb = new Date(b.time).getTime() || 0;
      return tb - ta;
    });
  }, [gateEntries]);

  // Pending pickups count
  const pendingCount = useMemo(() => {
    return earlyPickups.filter((p) => p.status === 'Pending').length;
  }, [earlyPickups]);

  // Last 2 manual override entries from shiftLog
  const manualOverrides = useMemo(() => {
    return shiftLog.filter((l) => l.action === 'OVERRIDE').slice(0, 2);
  }, [shiftLog]);

  return (
    <MeshBackground>
      {/* 2 decorative orbs (glass.orb1, glass.orb2) */}
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={typography.title}>Access & Security</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Gate Control & Clearances
            </Text>
          </View>
          <NotificationBell />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Gate Lock Control (Autonomous Feature #1) */}
          <View style={styles.sectionWrap}>
            <GlassCard style={shadows.md}>
              <AnimatedPressable
                onPress={handleToggleGateLock}
                style={styles.gateLockTouchArea}
                accessibilityRole="button"
                accessibilityLabel={`Gate status is currently ${
                  gateLockedDown ? 'LOCKED' : 'OPEN'
                }. Tap to toggle.`}
              >
                <View style={styles.gateLockRow}>
                  {/* Left: Shield icon (SVG) + "Gate Status" label */}
                  <View style={styles.gateStatusLeft}>
                    <View
                      style={[
                        styles.shieldIconWrap,
                        {
                          backgroundColor: gateLockedDown
                            ? colors.errorBg
                            : colors.successBg,
                        },
                      ]}
                    >
                      {gateLockedDown ? (
                        <ShieldAlert
                          size={24}
                          color={colors.error}
                          strokeWidth={2.2}
                        />
                      ) : (
                        <ShieldCheck
                          size={24}
                          color={colors.success}
                          strokeWidth={2.2}
                        />
                      )}
                    </View>
                    <View style={styles.gateStatusTextGroup}>
                      <Text style={typography.label}>Gate Status</Text>
                      <Text
                        style={[
                          typography.caption,
                          styles.gateStatusSubtext,
                          {
                            color: gateLockedDown
                              ? colors.error
                              : colors.success,
                          },
                        ]}
                      >
                        {gateLockedDown ? 'LOCKDOWN ACTIVE' : 'OPEN TO TRANSIT'}
                      </Text>
                    </View>
                  </View>

                  {/* Right: Large animated toggle pill */}
                  <View
                    style={[
                      styles.togglePill,
                      {
                        backgroundColor: gateLockedDown
                          ? colors.errorBg
                          : colors.successBg,
                        borderColor: gateLockedDown
                          ? colors.error
                          : colors.success,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleLabel,
                        {
                          color: gateLockedDown ? colors.error : colors.success,
                        },
                      ]}
                    >
                      {gateLockedDown ? 'LOCKED' : 'OPEN'}
                    </Text>
                    <View style={styles.toggleTrack}>
                      <Animated.View style={[styles.toggleDot, animatedDotStyle]} />
                    </View>
                  </View>
                </View>

                {/* Small warning text when locked */}
                {gateLockedDown && (
                  <View style={styles.lockWarningBanner}>
                    <Text style={styles.lockWarningText}>
                      ⚠️ No entries or exits permitted. Contact admin to lift lockdown.
                    </Text>
                  </View>
                )}
              </AnimatedPressable>
            </GlassCard>
          </View>

          {/* Section 2: Early Pickup Queue (Gate Exceptions) */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={typography.heading}>Early Pickup Requests</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  Authorized departures & guardian arrivals
                </Text>
              </View>
              {pendingCount > 0 ? (
                <View style={styles.badgePending}>
                  <Text style={styles.badgePendingText}>
                    {pendingCount} Pending
                  </Text>
                </View>
              ) : (
                <View style={styles.badgeCleared}>
                  <Text style={styles.badgeClearedText}>All Cleared</Text>
                </View>
              )}
            </View>

            {earlyPickups.length === 0 ? (
              <GlassCard style={shadows.sm}>
                <Text style={[typography.caption, styles.emptyText]}>
                  No early pickup requests logged today.
                </Text>
              </GlassCard>
            ) : (
              earlyPickups.map((pickup, index) => (
                <FadeInRow key={pickup.id} index={index}>
                  <PickupCard
                    pickup={pickup}
                    onVerify={handleVerifyPickup}
                    onDeny={handleDenyPickup}
                  />
                </FadeInRow>
              ))
            )}
          </View>

          {/* Section 3: Live Gate Activity Feed */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={typography.heading}>Gate Activity Today</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  Real-time entry & exit stream
                </Text>
              </View>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>
                  {sortedEntries.length} logs
                </Text>
              </View>
            </View>

            {sortedEntries.length === 0 ? (
              <GlassCard style={shadows.sm}>
                <Text style={[typography.caption, styles.emptyText]}>
                  No gate entries recorded yet today.
                </Text>
              </GlassCard>
            ) : (
              sortedEntries.map((entry, index) => (
                <FadeInRow key={entry.id} index={index}>
                  <GlassCard style={[shadows.sm, styles.entryCard]} padded={false}>
                    <View style={styles.entryRow}>
                      {/* Left: Colored circle icon */}
                      <View
                        style={[
                          styles.entryIconCircle,
                          { backgroundColor: getEntryBgColor(entry) },
                        ]}
                      >
                        {renderEntryIcon(entry)}
                      </View>

                      {/* Middle: Student name (bold) + entry type + method */}
                      <View style={styles.entryMiddle}>
                        <Text style={typography.label} numberOfLines={1}>
                          {entry.studentName}
                        </Text>
                        <View style={styles.entryDetailsRow}>
                          <Text
                            style={[
                              typography.caption,
                              {
                                color:
                                  entry.type === 'Arrival'
                                    ? colors.success
                                    : portalAccents.gateman.from,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            {entry.type}
                          </Text>
                          <Text style={styles.dotSeparator}>•</Text>
                          <Text style={typography.caption}>{entry.method}</Text>
                          {entry.authorizedBy ? (
                            <>
                              <Text style={styles.dotSeparator}>•</Text>
                              <Text
                                style={[
                                  typography.caption,
                                  { color: colors.textMuted },
                                ]}
                                numberOfLines={1}
                              >
                                {entry.authorizedBy}
                              </Text>
                            </>
                          ) : null}
                        </View>
                      </View>

                      {/* Right: Time + bus number if applicable */}
                      <View style={styles.entryRight}>
                        <Text style={styles.entryTimeText}>
                          {formatTime(entry.time)}
                        </Text>
                        {entry.busNumber ? (
                          <View style={styles.busBadge}>
                            <Text style={styles.busBadgeText}>
                              {entry.busNumber.split('-')[0]}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </GlassCard>
                </FadeInRow>
              ))
            )}
          </View>

          {/* Section 4: Visitor Log (Autonomous Feature #2 — Unknown Visitor) */}
          <View style={[styles.sectionWrap, styles.lastSection]}>
            <View style={styles.sectionHeaderRow}>
              <AnimatedPressable
                onPress={handleToggleManualSection}
                style={styles.manualHeaderBtn}
                accessibilityRole="button"
                accessibilityLabel="Toggle manual entry log"
              >
                <View style={styles.sectionHeaderLeft}>
                  <Text style={typography.heading}>Manual Entry & Visitors</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Ad-hoc visitors & manual overrides
                  </Text>
                </View>
                {manualCollapsed ? (
                  <ChevronDown size={18} color={colors.textMuted} />
                ) : (
                  <ChevronUp size={18} color={colors.textMuted} />
                )}
              </AnimatedPressable>

              <AnimatedPressable
                onPress={handleOpenVisitorModal}
                style={[styles.plusBtn, shadows.sm]}
                accessibilityRole="button"
                accessibilityLabel="Log new visitor entry"
              >
                <LinearGradient
                  colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.plusBtnInner}
                >
                  <Plus size={16} color={palette.white} strokeWidth={2.5} />
                  <Text style={styles.plusBtnText}>Log</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>

            {!manualCollapsed && (
              <View style={styles.manualEntriesContainer}>
                {manualOverrides.length === 0 ? (
                  <GlassCard style={shadows.sm}>
                    <Text style={[typography.caption, styles.emptyText]}>
                      No manual visitor or override entries logged yet.
                    </Text>
                  </GlassCard>
                ) : (
                  manualOverrides.map((logItem, idx) => (
                    <FadeInRow key={logItem.id} index={idx}>
                      <GlassCard style={[shadows.sm, styles.manualCard]}>
                        <View style={styles.manualCardHeader}>
                          <View style={styles.overrideTag}>
                            <Text style={styles.overrideTagText}>OVERRIDE</Text>
                          </View>
                          <Text style={typography.caption}>
                            {formatMinutesAgo(logItem.timestamp)}
                          </Text>
                        </View>
                        <Text style={[typography.bodyBold, styles.manualDesc]}>
                          {logItem.description}
                        </Text>
                      </GlassCard>
                    </FadeInRow>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Modal: Manual Entry / Unknown Visitor */}
        <GlassModal
          visible={visitorModalOpen}
          title="Manual Visitor Entry"
          maxHeight="78%"
          onClose={handleCloseVisitorModal}
        >
          <View style={styles.modalBody}>
            <Text style={[typography.caption, styles.modalDesc]}>
              Log an unknown visitor, contractor, delivery, or gate override into the shift log.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={typography.label}>Visitor / Contractor Name *</Text>
              <TextInput
                value={visitorName}
                onChangeText={setVisitorName}
                placeholder="e.g. Ramesh Chandra (Electrician)"
                placeholderTextColor={colors.textPlaceholder}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={typography.label}>Purpose of Visit</Text>
              <TextInput
                value={visitorPurpose}
                onChangeText={setVisitorPurpose}
                placeholder="e.g. Main switchboard repair"
                placeholderTextColor={colors.textPlaceholder}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={typography.label}>Person / Admin Contacted</Text>
              <TextInput
                value={visitorContact}
                onChangeText={setVisitorContact}
                placeholder="e.g. Principal Rao / Estate Manager"
                placeholderTextColor={colors.textPlaceholder}
                style={styles.textInput}
              />
            </View>

            <AnimatedPressable
              onPress={handleSaveVisitor}
              style={[
                styles.submitBtnWrap,
                shadows.sm,
                !visitorName.trim() && { opacity: 0.5 },
              ]}
              disabled={!visitorName.trim()}
              accessibilityRole="button"
              accessibilityLabel="Submit manual visitor entry"
            >
              <LinearGradient
                colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnInner}
              >
                <Plus size={18} color={palette.white} strokeWidth={2.4} />
                <Text style={styles.submitBtnText}>Record Entry</Text>
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </GlassModal>
      </SafeAreaView>
    </MeshBackground>
  );
}

// ─── Entry Icon Helpers ───────────────────────────────────────────────────

function getEntryBgColor(entry: GateEntry): string {
  if (entry.type === 'Arrival') {
    return entry.method === 'Bus' ? colors.successBg : colors.infoBg;
  }
  return entry.method === 'Parent Pickup'
    ? colors.warningBg
    : colors.successBg;
}

function renderEntryIcon(entry: GateEntry) {
  if (entry.type === 'Arrival') {
    if (entry.method === 'Bus') {
      return <Bus size={18} color={colors.success} strokeWidth={2.2} />;
    }
    return <UserRound size={18} color={colors.info} strokeWidth={2.2} />;
  }

  if (entry.method === 'Parent Pickup') {
    return <Car size={18} color={portalAccents.gateman.from} strokeWidth={2.2} />;
  }

  return <Bus size={18} color={colors.success} strokeWidth={2.2} />;
}

// ─── Stylesheet ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  orb1: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: glass.orb1,
    opacity: 0.6,
  },
  orb2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: radius.full,
    backgroundColor: glass.orb2,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitleWrap: {
    flex: 1,
    gap: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  sectionWrap: {
    gap: spacing.sm,
  },
  lastSection: {
    marginBottom: spacing.xl,
  },

  // Section 1: Gate Lock
  gateLockTouchArea: {
    gap: spacing.sm,
  },
  gateLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gateStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  shieldIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateStatusTextGroup: {
    gap: 2,
  },
  gateStatusSubtext: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  toggleLabel: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 11,
  },
  toggleTrack: {
    width: 52,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glass.border,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
  },
  lockWarningBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  lockWarningText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    gap: 2,
    flex: 1,
  },
  badgePending: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  badgePendingText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  badgeCleared: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeClearedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  activityBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  activityBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Section 2: Early Pickup Card
  pickupCard: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  gradeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.07)',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  gradeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  parentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parentLabel: {
    color: colors.textPrimary,
  },
  parentName: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  phoneText: {
    ...typography.caption,
    color: portalAccents.gateman.from,
    fontWeight: '700',
  },
  reasonText: {
    ...typography.caption,
    fontStyle: 'italic',
    color: colors.textMuted,
    lineHeight: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  verifyBtnWrap: {
    flex: 1,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  verifyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  verifyBtnText: {
    ...typography.label,
    color: palette.white,
    fontWeight: '700',
  },
  denyBtnWrap: {
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  denyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  denyBtnText: {
    ...typography.label,
    color: colors.error,
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  deniedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  deniedText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
  },

  // Section 3: Gate Activity Feed
  entryCard: {
    marginBottom: spacing.xs,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  entryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryMiddle: {
    flex: 1,
    gap: 2,
  },
  entryDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  dotSeparator: {
    ...typography.caption,
    color: colors.textMuted,
  },
  entryRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  entryTimeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  busBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  busBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },

  // Section 4: Manual Entry & Visitors
  manualHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  plusBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  plusBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  plusBtnText: {
    ...typography.caption,
    color: palette.white,
    fontWeight: '700',
  },
  manualEntriesContainer: {
    gap: spacing.xs,
  },
  manualCard: {
    padding: spacing.md,
    gap: 4,
  },
  manualCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overrideTag: {
    backgroundColor: 'rgba(249, 115, 22, 0.14)',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  overrideTagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: portalAccents.gateman.from,
    letterSpacing: 0.5,
  },
  manualDesc: {
    color: colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing.md,
    color: colors.textMuted,
  },

  // Modal
  modalBody: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  modalDesc: {
    color: colors.textMuted,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  textInput: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
  },
  submitBtnWrap: {
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  submitBtnText: {
    ...typography.label,
    color: palette.white,
    fontWeight: '700',
  },
});
