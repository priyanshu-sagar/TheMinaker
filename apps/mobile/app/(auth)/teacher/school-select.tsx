import { router } from 'expo-router';
import { AuthScreen } from '@/components/auth/Screen';
import { SchoolPicker } from '@/components/auth/SchoolPicker';
import { useAuthFlowStore } from '@/auth/auth-flow.store';

export default function TeacherSchoolSelectScreen() {
  const setSelectedSchool = useAuthFlowStore((state) => state.setSelectedSchool);

  return (
    <AuthScreen title="Find Your School" subtitle="Search by school name or ID to continue.">
      <SchoolPicker
        scope="teacher"
        onSelect={(school) => {
          setSelectedSchool(school);
          router.push('/(auth)/teacher/login');
        }}
      />
    </AuthScreen>
  );
}
