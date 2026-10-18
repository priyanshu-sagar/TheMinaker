import { UserRole } from '@minaker/shared-types';
import { Redirect } from 'expo-router';
import { ProvisionedLoginScreen } from '@/components/auth/ProvisionedLoginScreen';
import { useAuthStore } from '@/store/auth.store';

export default function ConductorLoginScreen() {
  const signedIn = useAuthStore((state) => state.isSignedIn);
  const role = useAuthStore((state) => state.role);
  if (signedIn && role === UserRole.CONDUCTOR) return <Redirect href="/(conductor)" />;
  return (
    <ProvisionedLoginScreen
      role={UserRole.CONDUCTOR}
      title="Conductor Login"
      idLabel="Employee ID or phone"
      idPlaceholder="EMP-2847"
      setPasswordHref="/(auth)/conductor/set-password"
      forgotPasswordHref="/(auth)/conductor/forgot-password"
    />
  );
}
