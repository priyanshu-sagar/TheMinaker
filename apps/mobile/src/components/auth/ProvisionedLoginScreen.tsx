import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { Banner } from './Banner';
import { LinkButton, PrimaryButton } from './Buttons';
import { FormField } from './FormField';
import { AuthScreen } from './Screen';
import { AuthMockError, ProvisionedRole, provisionedLogin } from '@/auth/mock-auth-api';
import { useAuthFlowStore } from '@/auth/auth-flow.store';
import { saveMockSession } from '@/auth/session';

/** Gateman and Teacher portals are built; every other role still lands on the generic hard stop. */
function postLoginHref(role: ProvisionedRole): string {
  if (role === UserRole.GATEKEEPER) return '/(gateman)';
  if (role === UserRole.TEACHER) return '/(teacher)';
  return '/(auth)/signed-in';
}

/**
 * Shared login screen for the four provisioned-access portals: teacher,
 * gateman, conductor, and school admin. Only labels and the post-login
 * route differ between them.
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
    <AuthScreen title={title} subtitle={schoolSubtitle}>
      <FormField label={idLabel} value={id} onChangeText={setId} placeholder={idPlaceholder} />
      <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      {error ? <Banner tone="error">{error}</Banner> : null}
      <PrimaryButton label="Log In" onPress={onLogin} loading={loading} />
      <LinkButton label="Forgot password?" onPress={() => router.push(forgotPasswordHref as never)} />
    </AuthScreen>
  );
}
