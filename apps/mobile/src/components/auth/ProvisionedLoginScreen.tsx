import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Banner } from './Banner';
import { LinkButton, PrimaryButton } from './Buttons';
import { FormField } from './FormField';
import { AuthScreen } from './Screen';
import { GlassCard } from '@/components/glass/GlassCard';
import { portalAccents, radius, shadows, spacing } from '@/design/tokens';
import { AuthMockError, ProvisionedRole, provisionedLogin } from '@/auth/mock-auth-api';
import { useAuthFlowStore } from '@/auth/auth-flow.store';
import { saveMockSession } from '@/auth/session';

const ROLE_TO_PORTAL: Record<ProvisionedRole, keyof typeof portalAccents> = {
  [UserRole.TEACHER]: 'teacher',
  [UserRole.GATEKEEPER]: 'gateman',
  [UserRole.CONDUCTOR]: 'conductor',
  [UserRole.SCHOOL_ADMIN]: 'schoolAdmin',
};

/** Gateman opens its portal. Teacher and every other role stop on the hold screen. */
function postLoginHref(role: ProvisionedRole): string {
  if (role === UserRole.GATEKEEPER) return '/(gateman)';
  return '/(auth)/signed-in';
}

/**
 * Shared login screen for the four provisioned-access portals: teacher,
 * gateman, conductor, and school admin.
 */
export function ProvisionedLoginScreen({
  role,
  title,
  idLabel,
  idPlaceholder,
  schoolSubtitle,
  setPasswordHref,
  forgotPasswordHref,
}: {
  role: ProvisionedRole;
  title: string;
  idLabel: string;
  idPlaceholder: string;
  schoolSubtitle?: string;
  setPasswordHref: string;
  forgotPasswordHref: string;
}) {
  const setPendingProvisioned = useAuthFlowStore((state) => state.setPendingProvisioned);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const portalKey = ROLE_TO_PORTAL[role];
  const accent = portalAccents[portalKey];

  async function onLogin() {
    setError(null);
    if (!id.trim() || !password.trim()) {
      setError(`Enter your ${idLabel.toLowerCase()} and password.`);
      return;
    }
    setLoading(true);
    try {
      const result = await provisionedLogin({ role, id: id.trim(), password });
      if (result.firstLogin) {
        setPendingProvisioned({ role, id: id.trim(), fullName: result.fullName });
        router.push(setPasswordHref as never);
        return;
      }
      await saveMockSession({ role, fullName: result.fullName, employeeId: id.trim() });
      router.replace(postLoginHref(role) as never);
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={title}
      subtitle={schoolSubtitle}
      headerIcon={
        <LinearGradient
          colors={[accent.from, accent.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Text style={styles.iconEmoji}>{accent.icon}</Text>
        </LinearGradient>
      }
    >
      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          <FormField label={idLabel} value={id} onChangeText={setId} placeholder={idPlaceholder} />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          {error ? <Banner tone="error">{error}</Banner> : null}
          <PrimaryButton label="Log In" onPress={onLogin} loading={loading} />
          <LinkButton label="Forgot password?" onPress={() => router.push(forgotPasswordHref as never)} />
        </View>
      </GlassCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  formContent: {
    gap: spacing.md,
  },
});
