import { UserRole } from '@minaker/shared-types';
import { ProvisionedLoginScreen } from '@/components/auth/ProvisionedLoginScreen';

export default function ConductorLoginScreen() {
  return (
    <ProvisionedLoginScreen
      role={UserRole.CONDUCTOR}
      title="Conductor Login"
      idLabel="Conductor ID"
      idPlaceholder="Your staff ID"
      setPasswordHref="/(auth)/conductor/set-password"
      forgotPasswordHref="/(auth)/conductor/forgot-password"
    />
  );
}
