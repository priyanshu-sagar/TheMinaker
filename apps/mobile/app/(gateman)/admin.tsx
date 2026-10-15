import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  AdminContact,
  LogAction,
  ShiftLogEntry,
  useGatemanStore,
} from '@/store/gateman.store';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
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

const INCIDENT_PRESETS = [
  'Bus Accident',
  'Medical Emergency',
  'Parent Dispute',
  'Unauthorized Entry',
  'Traffic Delay',
] as const;

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '08:00 AM';
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name.slice(0, 2) || 'GT').toUpperCase();
}

function getActionColor(action: LogAction): string {
  switch (action) {
    case 'APPROVED':
    case 'ALERT_RESOLVED':
      return colors.success;
    case 'REJECTED':
    case 'DENIED':
    case 'SOS_SENT':
      return colors.error;
    case 'AUTHORIZED':
      return colors.info;
    case 'OVERRIDE':
      return palette.orange;
    case 'BUS_OFFLINE':
      return palette.slateLight;
    default:
      return colors.primary;
  }
}

function getActionGlyph(action: LogAction): string {
  switch (action) {
    case 'APPROVED':
    case 'ALERT_RESOLVED':
      return '✓';
    case 'REJECTED':
      return '✕';
    case 'AUTHORIZED':
      return '🛡';
    case 'DENIED':
      return '🚫';
    case 'SOS_SENT':
      return '🚨';
    case 'OVERRIDE':
      return '⚡';
    case 'BUS_OFFLINE':
      return '⚠️';
    default:
      return '•';
  }
}

function PhoneIcon({ color = colors.primary }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke={colors.error}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17l5-5-5-5"
        stroke={colors.error}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12H9"
        stroke={colors.error}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={colors.textMuted} strokeWidth="2" />
      <Path
        d="M12 6v6l4 2"
        stroke={colors.textMuted}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function AdminScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const contacts = useGatemanStore((s) => s.contacts);
  const shiftLog = useGatemanStore((s) => s.shiftLog);
  const addShiftLog = useGatemanStore((s) => s.addShiftLog);
  const buses = useGatemanStore((s) => s.buses);

  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null);
  const [incidentDetails, setIncidentDetails] = useState('');
  const [logDisplayCount, setLogDisplayCount] = useState(10);

  // Reanimated pulse animation for Emergency SOS indicator
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 750 }),
        withTiming(1, { duration: 750 })
      ),
      -1,
      true
    );
  }, [pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 0.8 - (pulseAnim.value - 1) * 0.9,
  }));

  // Calculate shift duration from 7:00 AM of current day
  const shiftDuration = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
    const diffMs = now.getTime() - start.getTime();
    if (diffMs <= 0 || now.getHours() < 7) {
      return '2h 45m';
    }
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  }, []);

  const todayDateLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }, []);

  // Filter contacts by groups
  const adminContacts = useMemo(() => {
    return contacts.filter(
      (c) =>
        c.role === 'Principal' ||
        c.role === 'School Admin' ||
        c.role === 'Transport Office'
    );
  }, [contacts]);

  const conductorContacts = useMemo(() => {
    return contacts.filter((c) => c.role === 'Conductor');
  }, [contacts]);

  const handleSosBroadcast = () => {
    Alert.alert(
      '🚨 Send SOS?',
      'This will immediately alert ALL conductors and the admin office.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SOS',
          style: 'destructive',
          onPress: () => {
            addShiftLog({
              action: 'SOS_SENT',
              description: 'SOS broadcast sent to all conductors and admin',
            });
            Alert.alert('✅ SOS Sent', 'All conductors and the admin have been notified.');
          },
        },
      ]
    );
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert('Call Contact', `Dial ${name} at ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => {
          Linking.openURL('tel:' + phone).catch(() => {
            Alert.alert('Error', 'Unable to initiate phone call on this device.');
          });
        },
      },
    ]);
  };

  const handleSubmitIncident = () => {
    if (!selectedIncidentType) {
      Alert.alert('Select Incident Type', 'Please tap one of the incident preset chips above.');
      return;
    }
    const description = incidentDetails.trim()
      ? `Incident: ${selectedIncidentType} — ${incidentDetails.trim()}`
      : `Incident: ${selectedIncidentType} recorded at campus gate`;

    addShiftLog({
      action: 'OVERRIDE',
      description,
    });

    setSelectedIncidentType(null);
    setIncidentDetails('');
    Alert.alert('Logged', 'Incident added to shift log.');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to exit the Gateman portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/onboarding');
        },
      },
    ]);
  };

  const gatemanName = user?.fullName || (user as any)?.name || 'Rajesh Sharma';
  const visibleLogs = shiftLog.slice(0, logDisplayCount);

  return (
    <MeshBackground>
      {/* 3 Decorative Orbs for bubbly floating depth */}
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
          bottom: 120,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          top: 380,
          right: -50,
          width: 180,
          height: 180,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.4,
        }}
        pointerEvents="none"
      />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={typography.title}>Admin Link</Text>
            <Text style={styles.headerSubtitle}>Directory & Shift Accountability</Text>
          </View>
          <NotificationBell />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 5: Gateman Profile Card */}
          <GlassCard style={[styles.profileCard, shadows.md]}>
            <View style={styles.profileRow}>
              <LinearGradient
                colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileAvatar}
              >
                <Text style={styles.profileInitials}>{getInitials(gatemanName)}</Text>
              </LinearGradient>

              <View style={styles.profileInfo}>
                <View style={styles.profileBadgeWrap}>
                  <View style={styles.activeDot} />
                  <Text style={styles.profileRoleLabel}>Gateman On Duty</Text>
                </View>
                <Text style={typography.bodyBold}>{gatemanName}</Text>
                <View style={styles.shiftTimerRow}>
                  <ClockIcon />
                  <Text style={styles.shiftTimerText}>Shift: {shiftDuration}</Text>
                </View>
              </View>

              <AnimatedPressable
                onPress={handleSignOut}
                haptic="light"
                style={[styles.signOutBtn, shadows.sm]}
              >
                <LogoutIcon />
                <Text style={styles.signOutText}>Exit</Text>
              </AnimatedPressable>
            </View>
          </GlassCard>

          {/* Section 1: SOS Broadcast (Autonomous Feature #1) */}
          <GlassCard
            style={[
              styles.sosCard,
              { borderColor: colors.error, borderWidth: 1.5 },
              shadows.lg,
            ]}
          >
            <View style={styles.sosTopRow}>
              <View style={styles.sosIndicatorWrap}>
                <View style={styles.sosPulseAnchor}>
                  <Animated.View style={[styles.sosPulseRing, pulseStyle]} />
                  <View style={styles.sosPulseCore} />
                </View>
                <View>
                  <Text style={styles.sosHeading}>⚠ Emergency SOS</Text>
                  <Text style={styles.sosStatusBadge}>High Priority Broadcast</Text>
                </View>
              </View>

              <AnimatedPressable
                onPress={handleSosBroadcast}
                haptic="medium"
                style={[styles.sosButton, shadows.sm]}
              >
                <LinearGradient
                  colors={[colors.error, '#FB7185']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sosButtonInner}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10h2v4h-2zm0 6h2v2h-2z"
                      fill={colors.surfaceStrong}
                    />
                  </Svg>
                  <Text style={styles.sosButtonText}>BROADCAST SOS TO ALL</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>

            <Text style={styles.sosSubtitle}>
              Sends immediate alert to all {buses?.length || 6} conductors + transport office
            </Text>
          </GlassCard>

          {/* Section 2: Fast Directory (iOS-style grouped contact list) */}
          <View style={styles.directorySection}>
            <Text style={styles.sectionHeader}>SCHOOL ADMINISTRATION</Text>
            <GlassCard style={[styles.directoryCard, shadows.sm]} padded={false}>
              {adminContacts.map((contact, i) => {
                const isTransport = contact.role === 'Transport Office';
                const avatarColors = isTransport
                  ? [palette.blue, palette.blueLight]
                  : [palette.violet, palette.violetLight];

                return (
                  <React.Fragment key={contact.id}>
                    <AnimatedPressable
                      onPress={() => handleCall(contact.phone, contact.name)}
                      haptic="medium"
                    >
                      <View style={styles.contactRow}>
                        <LinearGradient
                          colors={avatarColors as [string, string]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.contactAvatar}
                        >
                          <Text style={styles.avatarInitials}>
                            {getInitials(contact.name)}
                          </Text>
                        </LinearGradient>

                        <View style={styles.contactInfo}>
                          <Text style={typography.bodyBold}>{contact.name}</Text>
                          <Text style={styles.contactRoleText}>{contact.role}</Text>
                        </View>

                        <View style={styles.contactRightCol}>
                          <View style={styles.availabilityRow}>
                            <View
                              style={[
                                styles.availabilityDot,
                                {
                                  backgroundColor: contact.available
                                    ? colors.success
                                    : colors.error,
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.availabilityText,
                                {
                                  color: contact.available
                                    ? colors.success
                                    : colors.textMuted,
                                },
                              ]}
                            >
                              {contact.available ? 'Available' : 'Unavailable'}
                            </Text>
                          </View>
                          <Text style={styles.contactPhone}>{contact.phone}</Text>
                        </View>

                        <AnimatedPressable
                          onPress={() => handleCall(contact.phone, contact.name)}
                          haptic="light"
                          style={[styles.phoneIconBtn, shadows.sm]}
                        >
                          <PhoneIcon color={colors.primary} />
                        </AnimatedPressable>
                      </View>
                    </AnimatedPressable>
                    {i < adminContacts.length - 1 && <View style={styles.rowDivider} />}
                  </React.Fragment>
                );
              })}
            </GlassCard>

            <Text style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
              ACTIVE CONDUCTORS
            </Text>
            <GlassCard style={[styles.directoryCard, shadows.sm]} padded={false}>
              {conductorContacts.map((contact, i) => (
                <React.Fragment key={contact.id}>
                  <AnimatedPressable
                    onPress={() => handleCall(contact.phone, contact.name)}
                    haptic="medium"
                  >
                    <View style={styles.contactRow}>
                      <LinearGradient
                        colors={[palette.orange, palette.orangeLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.contactAvatar}
                      >
                        <Text style={styles.avatarInitials}>
                          {getInitials(contact.name)}
                        </Text>
                      </LinearGradient>

                      <View style={styles.contactInfo}>
                        <Text style={typography.bodyBold}>{contact.name}</Text>
                        <Text style={styles.contactRoleText}>{contact.role}</Text>
                      </View>

                      <View style={styles.contactRightCol}>
                        <View style={styles.availabilityRow}>
                          <View
                            style={[
                              styles.availabilityDot,
                              {
                                backgroundColor: contact.available
                                  ? colors.success
                                  : colors.error,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.availabilityText,
                              {
                                color: contact.available
                                  ? colors.success
                                  : colors.textMuted,
                              },
                            ]}
                          >
                            {contact.available ? 'Available' : 'Unavailable'}
                          </Text>
                        </View>
                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                      </View>

                      <AnimatedPressable
                        onPress={() => handleCall(contact.phone, contact.name)}
                        haptic="light"
                        style={[styles.phoneIconBtn, shadows.sm]}
                      >
                        <PhoneIcon color={palette.orange} />
                      </AnimatedPressable>
                    </View>
                  </AnimatedPressable>
                  {i < conductorContacts.length - 1 && <View style={styles.rowDivider} />}
                </React.Fragment>
              ))}
            </GlassCard>
          </View>

          {/* Section 3: Incident Report (Autonomous Feature #2) */}
          <View style={styles.sectionWrap}>
            <GlassCard style={[styles.incidentCard, shadows.md]}>
              <View style={styles.incidentHeader}>
                <View>
                  <Text style={typography.label}>Quick Incident Report</Text>
                  <Text style={styles.incidentSubtitle}>
                    Log disturbances, gate delays, or emergency overrides
                  </Text>
                </View>
                <View style={styles.incidentPill}>
                  <Text style={styles.incidentPillText}>Instant Sync</Text>
                </View>
              </View>

              {/* Horizontal chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {INCIDENT_PRESETS.map((type) => {
                  const isSelected = selectedIncidentType === type;
                  return (
                    <AnimatedPressable
                      key={type}
                      onPress={() =>
                        setSelectedIncidentType(isSelected ? null : type)
                      }
                      haptic="selection"
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </ScrollView>

              {/* TextInput */}
              <TextInput
                placeholder="Additional details (involved bus, student ID, resolution)..."
                placeholderTextColor={colors.textPlaceholder}
                multiline
                numberOfLines={3}
                value={incidentDetails}
                onChangeText={setIncidentDetails}
                style={styles.detailsInput}
              />

              {/* Submit button */}
              <AnimatedPressable
                onPress={handleSubmitIncident}
                haptic="medium"
                style={[styles.submitBtn, shadows.sm]}
              >
                <LinearGradient
                  colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnInner}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 20h9"
                      stroke={colors.surfaceStrong}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <Path
                      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                      stroke={colors.surfaceStrong}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.submitBtnText}>Log Incident</Text>
                </LinearGradient>
              </AnimatedPressable>
            </GlassCard>
          </View>

          {/* Section 4: Shift Activity Log (Read-only) */}
          <View style={styles.sectionWrap}>
            <View style={styles.logSectionHeaderRow}>
              <View style={styles.logTitleWithDate}>
                <Text style={typography.label}>Shift Log</Text>
                <Text style={styles.logDateLabel}>• {todayDateLabel}</Text>
              </View>
              <View style={styles.logCountBadge}>
                <Text style={styles.logCountText}>{shiftLog.length} entries</Text>
              </View>
            </View>

            <GlassCard style={[styles.logCard, shadows.md]} padded={false}>
              {visibleLogs.length === 0 ? (
                <View style={styles.emptyLogBox}>
                  <Text style={styles.emptyLogText}>No shift activity recorded yet.</Text>
                </View>
              ) : (
                visibleLogs.map((entry: ShiftLogEntry, index: number) => {
                  const actionColor = getActionColor(entry.action);
                  const glyph = getActionGlyph(entry.action);

                  return (
                    <React.Fragment key={entry.id}>
                      <View style={styles.logRow}>
                        {/* Action glyph icon */}
                        <View
                          style={[
                            styles.actionIconBox,
                            { backgroundColor: `${actionColor}18` },
                          ]}
                        >
                          <Text style={[styles.actionGlyph, { color: actionColor }]}>
                            {glyph}
                          </Text>
                        </View>

                        {/* Description & metadata */}
                        <View style={styles.logCenter}>
                          <View style={styles.logActionMeta}>
                            <Text
                              style={[
                                styles.actionTag,
                                { color: actionColor },
                              ]}
                            >
                              {entry.action.replace('_', ' ')}
                            </Text>
                            <Text style={styles.logRelativeTime}>
                              {relativeTime(entry.timestamp)}
                            </Text>
                          </View>
                          <Text style={styles.logDescText}>{entry.description}</Text>
                        </View>

                        {/* Exact formatted time */}
                        <View style={styles.logTimeCol}>
                          <Text style={styles.logTimeText}>
                            {formatTime(entry.timestamp)}
                          </Text>
                        </View>
                      </View>
                      {index < visibleLogs.length - 1 && (
                        <View style={styles.logDivider} />
                      )}
                    </React.Fragment>
                  );
                })
              )}

              {shiftLog.length > logDisplayCount && (
                <AnimatedPressable
                  onPress={() => setLogDisplayCount((prev) => prev + 10)}
                  haptic="light"
                  style={styles.loadMoreBtn}
                >
                  <Text style={styles.loadMoreText}>
                    Load More ({shiftLog.length - logDisplayCount} remaining)
                  </Text>
                </AnimatedPressable>
              )}
            </GlassCard>
          </View>

          {/* Bottom spacing for frosted tab bar */}
          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  /* Gateman Profile Card */
  profileCard: {
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surfaceStrong,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  profileRoleLabel: {
    ...typography.overline,
    color: palette.orange,
    fontSize: 10,
  },
  shiftTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  shiftTimerText: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 4,
    fontSize: 12,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
  },
  signOutText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 4,
  },

  /* SOS Card */
  sosCard: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 241, 242, 0.65)',
  },
  sosTopRow: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  sosIndicatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosPulseAnchor: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sosPulseRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(244,63,94,0.3)',
  },
  sosPulseCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  sosHeading: {
    ...typography.label,
    color: colors.error,
    fontWeight: '700',
    fontSize: 15,
  },
  sosStatusBadge: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  sosButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  sosButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  sosButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.surfaceStrong,
    letterSpacing: 0.5,
  },
  sosSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  /* Fast Directory */
  directorySection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  directoryCard: {
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surfaceStrong,
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactRoleText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  contactRightCol: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contactPhone: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  phoneIconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: glass.border,
    marginLeft: 56,
  },

  /* Incident Report */
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  incidentCard: {
    gap: spacing.md,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  incidentSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  incidentPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.25)',
  },
  incidentPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.orange,
  },
  chipsScroll: {
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: glass.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(249,115,22,0.14)',
    borderColor: palette.orange,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: palette.orange,
    fontWeight: '700',
  },
  detailsInput: {
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: colors.surfaceStrong,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: spacing.sm,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surfaceStrong,
  },

  /* Shift Activity Log */
  logSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  logTitleWithDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDateLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 6,
  },
  logCountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(79,70,229,0.08)',
  },
  logCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  logCard: {
    overflow: 'hidden',
  },
  emptyLogBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyLogText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGlyph: {
    fontSize: 14,
    fontWeight: '800',
  },
  logCenter: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  logActionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  actionTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  logRelativeTime: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  logDescText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  logTimeCol: {
    alignItems: 'flex-end',
  },
  logTimeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logDivider: {
    height: 1,
    backgroundColor: glass.border,
    marginLeft: 48,
  },
  loadMoreBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopWidth: 1,
    borderTopColor: glass.border,
  },
  loadMoreText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
});
