import { ProvisionedForgotPasswordScreen } from '@/components/auth/ProvisionedForgotPasswordScreen';
import { portalAccents } from '@/design/tokens';

export default function GatemanForgotPasswordScreen() {
  return <ProvisionedForgotPasswordScreen loginHref="/(auth)/gateman/login" color={portalAccents.gateman.from} />;
}
