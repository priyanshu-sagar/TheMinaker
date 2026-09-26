import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ProvisionedLoginScreen } from '@/components/auth/ProvisionedLoginScreen';
import { useAuthFlowStore } from '@/auth/auth-flow.store';

export default function SchoolAdminLoginScreen() {
  const school = useAuthFlowStore((state) => state.selectedSchool);

  useEffect(() => {
    if (!school) router.replace('/(auth)/school-admin/school-select');
  }, [school]);

  if (!school) return null;

  return (
    <ProvisionedLoginScreen
      role={UserRole.SCHOOL_ADMIN}
      title="School Admin Login"
      idLabel="Admin ID"
      idPlaceholder="Your admin ID"
      schoolSubtitle={school.name}
      setPasswordHref="/(auth)/school-admin/set-password"
      forgotPasswordHref="/(auth)/school-admin/forgot-password"
    />
  );
}
