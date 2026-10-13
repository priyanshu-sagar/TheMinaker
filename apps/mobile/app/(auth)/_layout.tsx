import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="onboarding">
      <Stack.Screen name="portal-showcase" options={{ headerShown: false }} />
    </Stack>
  );
}
