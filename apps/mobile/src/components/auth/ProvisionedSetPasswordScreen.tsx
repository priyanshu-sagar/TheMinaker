import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { Banner } from './Banner';
import { PrimaryButton } from './Buttons';
import { FormField } from './FormField';
import { AuthScreen } from './Screen';
import { GlassCard } from '@/components/glass/GlassCard';
import { shadows, spacing } from '@/design/tokens';
import { useAuthFlowStore } from '@/auth/auth-flow.store';
import { AuthMockError, ProvisionedRole, setNewPassword } from '@/auth/mock-auth-api';
import { saveMockSession } from '@/auth/session';

/** Gateman opens its portal. Teacher and every other role stop on the hold screen. */
function postLoginHref(role: ProvisionedRole): string {
  if (role === UserRole.GATEKEEPER) return '/(gateman)';
  return '/(auth)/signed-in';
}

/**
 * Shared mandatory first-login password screen for teacher, gateman,
 * conductor, and school admin. Hardware back is blocked on Android because
 * this step is required before the session is granted.
 */
export function ProvisionedSetPasswordScreen() {
  const pending = useAuthFlowStore((state) => state.pendingProvisioned);
  const setPendingProvisioned = useAuthFlowStore((state) => state.setPendingProvisioned);
  const [newPassword, setNewPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!pending) router.replace('/(auth)/portal-select');
  }, [pending]);

  if (!pending) return null;
  const current = pending;

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await setNewPassword({ newPassword, confirmPassword });
      await saveMockSession({ role: current.role, fullName: current.fullName, employeeId: current.id });
      setPendingProvisioned(null);
      router.replace(postLoginHref(current.role) as never);
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Set a New Password"
      subtitle="This is your first time signing in. Please set a new password to continue."
      showBack={false}
    >
      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          <FormField label="New Password" value={newPassword} onChangeText={setNewPasswordValue} placeholder="At least 8 characters" secureTextEntry />
          <FormField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" secureTextEntry />
          {error ? <Banner tone="error">{error}</Banner> : null}
          <PrimaryButton label="Set Password & Continue" onPress={onSubmit} loading={loading} />
        </View>
      </GlassCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  formContent: {
    gap: spacing.md,
  },
});
