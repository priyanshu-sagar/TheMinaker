import { router } from 'expo-router';
import { AuthScreen } from '@/components/auth/Screen';
import { SchoolPicker } from '@/components/auth/SchoolPicker';
import { useAuthFlowStore } from '@/auth/auth-flow.store';

export default function SchoolAdminSchoolSelectScreen() {
  const setSelectedSchool = useAuthFlowStore((state) => state.setSelectedSchool);

  return (
    <AuthScreen title="Find Your School" subtitle="Search by school name or ID to continue.">
      <SchoolPicker
        scope="school-admin"
        onSelect={(school) => {
          setSelectedSchool(school);
          router.push('/(auth)/school-admin/login');
        }}
      />
    </AuthScreen>
  );
}
