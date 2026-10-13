import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { PrimaryButton, LinkButton } from '@/components/auth/Buttons';
import { colors, glass, radius, shadows, spacing, typography } from '@/design/tokens';
import { useAuthStore } from '@/store/auth.store';

/**
 * Hard stop for this phase — execution halts here once the auth payload is
 * in the store. Portal dashboards are built in later, isolated passes.
 */
export default function SignedInScreen() {
  const { user, role, signOut } = useAuthStore();

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/onboarding');
  }

  return (
    <MeshBackground>
      {/* Decorative ambient orbs */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <LinearGradient
            colors={[colors.success, '#34D399']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>✓</Text>
          </LinearGradient>

          <Text style={styles.title}>You're signed in</Text>
          <Text style={styles.subtitle}>
            The authentication payload is now in the app state. Portal screens for this role are
            built in a later step.
          </Text>

          <GlassCard style={shadows.lg}>
            <View style={styles.cardContent}>
              <Row label="Role" value={String(role)} />
              <Row label="Name" value={user?.fullName ?? '—'} />
              {user?.email ? <Row label="Email" value={user.email} /> : null}
              {user?.phone ? <Row label="Phone" value={user.phone} /> : null}
              {user?.employeeId ? <Row label="ID" value={user.employeeId} /> : null}
            </View>
          </GlassCard>

          <PrimaryButton label="Sign Out" onPress={onSignOut} />
          <LinkButton label="Back to portal selection" onPress={() => router.replace('/(auth)/portal-select')} />
        </View>
      </SafeAreaView>
    </MeshBackground>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badgeText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '700',
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subtitle,
    textAlign: 'center',
  },
  cardContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  orb: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  orb1: {
    width: 220,
    height: 220,
    top: 60,
    right: -60,
    backgroundColor: glass.orb4,
    opacity: 0.5,
  },
  orb2: {
    width: 260,
    height: 260,
    bottom: 80,
    left: -80,
    backgroundColor: glass.orb1,
    opacity: 0.45,
  },
});
