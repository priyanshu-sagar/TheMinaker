import { Redirect } from 'expo-router';
import { UserRole } from '@minaker/shared-types';
import { useAuthStore } from '@/store/auth.store';

/**
 * Root index. Signed-in Gateman and Teacher users go to their own portals,
 * the only two built so far. Every other signed-in role lands on the
 * generic hard-stop screen until its own portal is built in a later,
 * isolated pass. Signed-out users start at onboarding.
 */
export default function Index() {
  const { isSignedIn, role } = useAuthStore();

  if (isSignedIn) {
    if (role === UserRole.GATEKEEPER) {
      return <Redirect href={'/(gateman)' as never} />;
    }
    if (role === UserRole.TEACHER) {
      return <Redirect href={'/(teacher)' as never} />;
    }
    return <Redirect href="/(auth)/signed-in" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}
