import { UserRole } from '@minaker/shared-types';
import { ProvisionedLoginScreen } from '@/components/auth/ProvisionedLoginScreen';

export default function GatemanLoginScreen() {
  return (
    <ProvisionedLoginScreen
      role={UserRole.GATEKEEPER}
      title="Gateman Login"
      idLabel="Gateman ID"
      idPlaceholder="Your staff ID"
      setPasswordHref="/(auth)/gateman/set-password"
      forgotPasswordHref="/(auth)/gateman/forgot-password"
    />
  );
}
