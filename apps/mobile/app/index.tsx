import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@minaker/shared-types';

/**
 * Root index — redirect to correct portal based on auth state.
 * If not signed in → go to login.
 * If signed in → go to role's home screen.
 */
export default function Index() {
  const { isSignedIn, role } = useAuthStore();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (role) {
    case UserRole.PARENT:
      return <Redirect href="/(parent)" />;
    case UserRole.GATEKEEPER:
      return <Redirect href="/(gatekeeper)" />;
    case UserRole.CONDUCTOR:
      return <Redirect href="/(conductor)" />;
    case UserRole.SCHOOL_ADMIN:
    case UserRole.TEACHER:
      return <Redirect href="/(school-admin)" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}
