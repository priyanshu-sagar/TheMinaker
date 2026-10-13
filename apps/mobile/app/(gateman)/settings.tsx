import { ReactNode, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, glass, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { RequestModificationModal } from '@/components/shared/RequestModificationModal';
import { useAuthStore } from '@/store/auth.store';
import { DirectoryContact, useGatemanStore } from '@/store/gateman.store';

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  danger,
  chevron = true,
}: {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
}) {
  return (
    <AnimatedPressable onPress={onPress} haptic="light">
      <View style={rowStyles.row}>
        <View style={[rowStyles.iconWrap, danger && { backgroundColor: colors.errorBg }]}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={[rowStyles.label, danger && { color: colors.error }]}>{label}</Text>
          {sublabel ? <Text style={rowStyles.sublabel}>{sublabel}</Text> : null}
        </View>
        {chevron && (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18l6-6-6-6"
              stroke={colors.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
    </AnimatedPressable>
  );
}

function RowDivider() {
  return <View style={{ height: 1, backgroundColor: glass.border, marginLeft: 56 }} />;
}

function UserIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={colors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke={colors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PencilIcon({ color = colors.primary }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20h9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={colors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
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

export default function SettingsDirectoryScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const directory = useGatemanStore((state) => state.directory);
  const submitModificationRequest = useGatemanStore((state) => state.submitModificationRequest);
  const [modalOpen, setModalOpen] = useState(false);

  const conductors = useMemo(
    () => directory.filter((contact: DirectoryContact) => contact.role === 'Conductor'),
    [directory],
  );

  const admins = useMemo(
    () => directory.filter((contact: DirectoryContact) => contact.role === 'School Admin'),
    [directory],
  );

  const handleLogout = () => {
    (useGatemanStore.getState() as any).reset?.();
    useAuthStore.getState().signOut();
    router.replace('/(auth)/onboarding');
  };

  return (
    <MeshBackground>
      {/* Decorative orbs — always behind content */}
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
      <View
        style={{
          position: 'absolute',
          top: 320,
          right: -60,
          width: 160,
          height: 160,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.4,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* 1. Profile Header Card */}
          <FadeInRow index={0}>
            <GlassCard style={[styles.profileCard, shadows.md]}>
              <View style={styles.profileHeader}>
                <LinearGradient
                  colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {(user?.fullName ?? 'Gateman').charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <Text style={styles.profileName}>{user?.fullName ?? 'Gateman Guard'}</Text>
                <Text style={styles.profileRole}>Gateman</Text>
                <Text style={styles.profileSchool}>
                  {(user as any)?.schoolName ?? 'Delhi Public School, Sector 45'}
                </Text>
                <AnimatedPressable
                  onPress={() => setModalOpen(true)}
                  haptic="light"
                  style={[styles.pillBtn, shadows.sm]}
                >
                  <LinearGradient
                    colors={[portalAccents.gateman.from, portalAccents.gateman.to]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pillBtnInner}
                  >
                    <PencilIcon color="#ffffff" />
                    <Text style={styles.pillBtnText}>Request Modification</Text>
                  </LinearGradient>
                </AnimatedPressable>
              </View>
            </GlassCard>
          </FadeInRow>

          {/* 2. Section: Account */}
          <FadeInRow index={1}>
            <Text style={styles.sectionHeader}>ACCOUNT</Text>
            <GlassCard padded={false} style={[styles.sectionCard, shadows.sm]}>
              <SettingsRow
                icon={<UserIcon />}
                label="Profile Info"
                sublabel={`${user?.fullName ?? 'Gateman Guard'} • ${user?.phone ?? '+91 98100 22334'}`}
                onPress={() => setModalOpen(true)}
              />
              <RowDivider />
              <SettingsRow
                icon={<PencilIcon />}
                label="Request Modification"
                sublabel="Submit details change to school admin"
                onPress={() => setModalOpen(true)}
              />
            </GlassCard>
          </FadeInRow>

          {/* 3. Section: Directory */}
          <FadeInRow index={2}>
            <Text style={styles.sectionHeader}>DIRECTORY</Text>
            <GlassCard padded={false} style={[styles.sectionCard, shadows.sm]}>
              <View style={styles.cardSubheader}>
                <Text style={styles.cardSubheaderText}>Conductors</Text>
              </View>
              {conductors.map((conductor, i) => (
                <View key={conductor.id}>
                  <SettingsRow
                    icon={<PhoneIcon />}
                    label={conductor.name}
                    sublabel={conductor.phone}
                    onPress={() => Linking.openURL(`tel:${conductor.phone}`)}
                  />
                  {i < conductors.length - 1 && <RowDivider />}
                </View>
              ))}

              <View style={styles.cardInnerDivider} />

              <View style={styles.cardSubheader}>
                <Text style={styles.cardSubheaderText}>Administrators</Text>
              </View>
              {admins.map((admin, i) => (
                <View key={admin.id}>
                  <SettingsRow
                    icon={<PhoneIcon />}
                    label={admin.name}
                    sublabel={admin.phone}
                    onPress={() => Linking.openURL(`tel:${admin.phone}`)}
                  />
                  {i < admins.length - 1 && <RowDivider />}
                </View>
              ))}
            </GlassCard>
          </FadeInRow>

          {/* 4. Section: System */}
          <FadeInRow index={3}>
            <Text style={styles.sectionHeader}>SYSTEM</Text>
            <GlassCard padded={false} style={[styles.sectionCard, shadows.sm]}>
              <SettingsRow
                icon={<LogoutIcon />}
                label="Log Out"
                sublabel="Sign out of Gateman Portal"
                danger
                chevron={false}
                onPress={handleLogout}
              />
            </GlassCard>
          </FadeInRow>
        </ScrollView>
      </SafeAreaView>

      <RequestModificationModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModificationRequest}
      />
    </MeshBackground>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    minHeight: 52,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sublabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileName: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  profileRole: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  profileSchool: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  pillBtn: {
    marginTop: spacing.md,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  pillBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  pillBtnText: {
    ...typography.label,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionHeader: {
    ...typography.overline,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  sectionCard: {
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  cardSubheader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  cardSubheaderText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  cardInnerDivider: {
    height: 1,
    backgroundColor: glass.border,
    marginVertical: spacing.xs,
  },
});
