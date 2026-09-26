import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, LinkButton } from '@/components/auth/Buttons';
import { colors, radius, spacing, typography } from '@/design/theme';
import { useAuthStore } from '@/store/auth.store';

/**
 * Hard stop for this phase — execution halts here once the auth payload is
 * in the store. Portal dashboards are built in later, isolated passes.
 */
export default function SignedInScreen() {
  const { user, role, signOut } = useAuthStore();

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/portal-select');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
        <Text style={typography.title}>You're signed in</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          The authentication payload is now in the app state. Portal screens for this role are
          built in a later step.
        </Text>

        <View style={styles.card}>
          <Row label="Role" value={String(role)} />
          <Row label="Name" value={user?.fullName ?? '—'} />
          {user?.email ? <Row label="Email" value={user.email} /> : null}
          {user?.phone ? <Row label="Phone" value={user.phone} /> : null}
          {user?.employeeId ? <Row label="ID" value={user.employeeId} /> : null}
        </View>

        <PrimaryButton label="Sign Out" onPress={onSignOut} />
        <LinkButton label="Back to portal selection" onPress={() => router.replace('/(auth)/portal-select')} />
      </View>
    </SafeAreaView>
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
  safe: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e3f3ea',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  badgeText: { fontSize: 26, color: '#1f7a4d', fontWeight: '700' },
  subtitle: { textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
