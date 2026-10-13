import { Redirect } from 'expo-router';
import { UserRole } from '@minaker/shared-types';
import { useAuthStore } from '@/store/auth.store';

/**
 * Root index. Signed-in Gateman users open the gateman portal.
 * Teacher portal screens are held outside the router until that portal
 * is added back. Every other signed-in role lands on the hold screen.
 * Signed-out users start at onboarding.
 */
export default function Index() {
  const { isSignedIn, role } = useAuthStore();

  if (isSignedIn) {
    if (role === UserRole.GATEKEEPER) {
      return <Redirect href={'/(gateman)' as never} />;
    }
    return <Redirect href="/(auth)/signed-in" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}
