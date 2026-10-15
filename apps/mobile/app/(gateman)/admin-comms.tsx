import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { GlassCard } from '@/components/glass/GlassCard';
import { MeshBackground } from '@/components/glass/MeshBackground';
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
import { useAuthStore } from '@/store/auth.store';
import { AdminContact, GateNotification, LogAction, useGatemanStore } from '@/store/gateman.store';

const INCIDENT_TYPES = [
  'Bus Accident',
  'Medical Emergency',
  'Parent Dispute',
  'Unauthorized Entry',
  'Traffic Delay',
];

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function relativeTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function roleGradient(role: string): [string, string] {
  if (role === 'Principal') return [palette.violet, palette.violetLight];
  if (role === 'Transport Office') return [palette.blue, palette.blueLight];
  if (role === 'School Admin') return [palette.slate, palette.slateLight];
  return [portalAccents.gateman.from, portalAccents.gateman.to];
}

export default function AdminCommsScreen() {
  const user = useAuthStore((state) => state.user);
  const contacts = useGatemanStore((state) => state.contacts);
  const notifications = useGatemanStore((state) => state.notifications);
  const addShiftLog = useGatemanStore((state) => state.addShiftLog);

  // Section 1: Emergency SOS pulsing animation
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 900 }),
        withTiming(1.0, { duration: 900 })
      ),
      -1,
      false
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  function handleSOS() {
    Alert.alert(
      '⚠️ Send Emergency SOS?',
      'This will immediately alert ALL 6 conductors and the Transport Office. Only use in a genuine emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SOS',
          style: 'destructive',
          onPress: () => {
            addShiftLog({
              action: 'SOS_SENT',
              description: 'Emergency SOS broadcast to all conductors and admin',
            });
            Alert.alert('✅ SOS Sent', 'All conductors and admin have been notified.');
          },
        },
      ]
    );
  }

  // Section 2: Admin Broadcasts
  const adminNotifs = notifications.filter((n) => n.category === 'admin');

  // Section 3: Directory grouping
  const adminContacts = contacts.filter((c) =>
    ['Principal', 'School Admin', 'Transport Office'].includes(c.role)
  );
  const conductorContacts = contacts.filter((c) => c.role === 'Conductor');

  // Section 4: Incident Report state
  const [incType, setIncType] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  function handleIncidentSubmit() {
    if (!incType) {
      Alert.alert('Select an incident type first.');
      return;
    }
    addShiftLog({
      action: 'OVERRIDE',
      description: `Incident: ${incType}${details ? ' — ' + details : ''}`,
    });
    setIncType(null);
    setDetails('');
    Alert.alert('✅ Logged', 'Incident added to shift log.');
  }

  return (
    <MeshBackground>
      {/* Decorative Orbs */}
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
          left: -70,
          width: 260,
          height: 260,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Admin & Comms</Text>
            <Text style={styles.headerSubtitle}>
              School uplink & emergency coordination
            </Text>
          </View>
          <NotificationBell />
        </View>

        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SECTION 1: Emergency SOS Panel */}
          <GlassCard style={[styles.sosCard, shadows.lg]}>
            <View style={styles.sosRow}>
              <Animated.View style={[styles.pulseOrbWrapper, pulseStyle]}>
                <View style={styles.pulseOrb} />
              </Animated.View>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
            </View>
            <Text style={styles.sosSubtitle}>
              Broadcasts immediately to all conductors + transport office
            </Text>

            <AnimatedPressable
              onPress={handleSOS}
              haptic="medium"
              style={{ marginTop: spacing.md }}
            >
              <LinearGradient
                colors={[colors.error, palette.roseLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sosButton}
              >
                <Text style={styles.sosButtonText}>🚨 BROADCAST SOS TO ALL</Text>
              </LinearGradient>
            </AnimatedPressable>
          </GlassCard>

          {/* SECTION 2: Admin Broadcasts */}
          <View style={styles.sectionHeadingWrap}>
            <Text style={styles.sectionHeader}>ADMIN BROADCASTS</Text>
            {adminNotifs.length > 0 && (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{adminNotifs.length}</Text>
              </View>
            )}
          </View>

          {adminNotifs.length === 0 ? (
            <GlassCard style={shadows.sm}>
              <Text style={styles.emptyText}>No admin broadcasts at this time.</Text>
            </GlassCard>
          ) : (
            adminNotifs.map((notif) => (
              <GlassCard
                key={notif.id}
                style={[
                  styles.broadcastCard,
                  shadows.sm,
                  { borderLeftWidth: 3, borderLeftColor: colors.success },
                ]}
              >
                <Text style={typography.bodyBold}>{notif.title}</Text>
                <Text style={styles.broadcastBody}>{notif.body}</Text>
                <Text style={styles.broadcastTime}>{relativeTime(notif.timestamp)}</Text>
              </GlassCard>
            ))
          )}

          {/* SECTION 3: Quick Dial Directory (iOS-style grouped) */}
          <View style={styles.sectionHeadingWrap}>
            <Text style={styles.sectionHeader}>SCHOOL ADMINISTRATION</Text>
          </View>
          <GlassCard style={shadows.sm} padded={false}>
            {adminContacts.map((c, i) => (
              <View key={c.id}>
                <AnimatedPressable
                  onPress={() => Linking.openURL(`tel:${c.phone}`)}
                  haptic="medium"
                >
                  <View style={styles.contactRow}>
                    <LinearGradient
                      colors={roleGradient(c.role)}
                      style={styles.avatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.avatarText}>{initials(c.name)}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.bodyBold}>{c.name}</Text>
                      <Text style={styles.contactRole}>{c.role}</Text>
                    </View>
                    <View style={styles.availCol}>
                      <View
                        style={[
                          styles.availDot,
                          { backgroundColor: c.available ? colors.success : colors.error },
                        ]}
                      />
                      <Text style={styles.availText}>
                        {c.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                    <AnimatedPressable
                      onPress={() => Linking.openURL(`tel:${c.phone}`)}
                      haptic="light"
                      style={styles.callBtn}
                    >
                      <Svg width={18} height={18} viewBox="0 0 24 24">
                        <Path
                          d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                          fill={portalAccents.gateman.from}
                        />
                      </Svg>
                    </AnimatedPressable>
                  </View>
                </AnimatedPressable>
                {i < adminContacts.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </GlassCard>

          <View style={styles.sectionHeadingWrap}>
            <Text style={styles.sectionHeader}>BUS CONDUCTORS</Text>
          </View>
          <GlassCard style={shadows.sm} padded={false}>
            {conductorContacts.map((c, i) => (
              <View key={c.id}>
                <AnimatedPressable
                  onPress={() => Linking.openURL(`tel:${c.phone}`)}
                  haptic="medium"
                >
                  <View style={styles.contactRow}>
                    <LinearGradient
                      colors={roleGradient(c.role)}
                      style={styles.avatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.avatarText}>{initials(c.name)}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.bodyBold}>{c.name}</Text>
                      <Text style={styles.contactRole}>{c.role}</Text>
                    </View>
                    <View style={styles.availCol}>
                      <View
                        style={[
                          styles.availDot,
                          { backgroundColor: c.available ? colors.success : colors.error },
                        ]}
                      />
                      <Text style={styles.availText}>
                        {c.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                    <AnimatedPressable
                      onPress={() => Linking.openURL(`tel:${c.phone}`)}
                      haptic="light"
                      style={styles.callBtn}
                    >
                      <Svg width={18} height={18} viewBox="0 0 24 24">
                        <Path
                          d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                          fill={portalAccents.gateman.from}
                        />
                      </Svg>
                    </AnimatedPressable>
                  </View>
                </AnimatedPressable>
                {i < conductorContacts.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </GlassCard>

          {/* SECTION 4: Incident Report (Autonomous Feature) */}
          <View style={styles.sectionHeadingWrap}>
            <Text style={styles.sectionHeader}>INCIDENT REPORT</Text>
          </View>
          <GlassCard style={shadows.md}>
            <Text style={[typography.label, { marginBottom: spacing.sm }]}>
              Quick Incident Report
            </Text>

            {/* Horizontal chip selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              {INCIDENT_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setIncType(t === incType ? null : t)}
                  style={[styles.incChip, incType === t && styles.incChipSelected]}
                >
                  <Text
                    style={{
                      color: incType === t ? palette.white : colors.textMuted,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <AppTextInput
              placeholder="Additional details..."
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={3}
              style={styles.detailsInput}
              placeholderTextColor={colors.textPlaceholder}
            />

            <AnimatedPressable onPress={handleIncidentSubmit} haptic="medium">
              <LinearGradient
                colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>Log Incident</Text>
              </LinearGradient>
            </AnimatedPressable>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    fontWeight: '700',
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

  // SOS Panel
  sosCard: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  sosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pulseOrbWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOrb: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  sosTitle: {
    ...typography.heading,
    color: colors.error,
    fontWeight: '700',
  },
  sosSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sosButton: {
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonText: {
    color: palette.white,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
    backgroundColor: 'transparent',
  },

  // Broadcasts
  sectionHeadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionHeader: {
    ...typography.overline,
    color: colors.textMuted,
  },
  badgeWrap: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  broadcastCard: {
    marginBottom: 0,
  },
  broadcastBody: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  broadcastTime: {
    ...typography.caption,
    color: colors.textPlaceholder,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },

  // Directory
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: palette.white,
    backgroundColor: 'transparent',
  },
  contactRole: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  availCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  availText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 42 + spacing.md * 2,
  },

  // Incident Report
  chipScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  incChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  incChipSelected: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  detailsInput: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.fontWeight,
    marginTop: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: spacing.md,
    minHeight: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    ...typography.bodyBold,
    color: palette.white,
    backgroundColor: 'transparent',
  },
});
