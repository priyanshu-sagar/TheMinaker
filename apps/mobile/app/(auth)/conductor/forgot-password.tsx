import { ProvisionedForgotPasswordScreen } from '@/components/auth/ProvisionedForgotPasswordScreen';
import { portalAccents } from '@/design/tokens';

export default function ConductorForgotPasswordScreen() {
  return <ProvisionedForgotPasswordScreen loginHref="/(auth)/conductor/login" color={portalAccents.conductor.from} />;
}
