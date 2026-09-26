import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ProvisionedLoginScreen } from '@/components/auth/ProvisionedLoginScreen';
import { useAuthFlowStore } from '@/auth/auth-flow.store';

export default function TeacherLoginScreen() {
  const school = useAuthFlowStore((state) => state.selectedSchool);

  useEffect(() => {
    if (!school) router.replace('/(auth)/teacher/school-select');
  }, [school]);

  if (!school) return null;

  return (
    <ProvisionedLoginScreen
      role={UserRole.TEACHER}
      title="Teacher Login"
      idLabel="Teacher ID or Name"
      idPlaceholder="Your teacher ID or name"
      schoolSubtitle={school.name}
      setPasswordHref="/(auth)/teacher/set-password"
      forgotPasswordHref="/(auth)/teacher/forgot-password"
    />
  );
}
