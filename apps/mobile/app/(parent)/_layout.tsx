import { Tabs } from 'expo-router';

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Live Tracking', tabBarLabel: 'Track', tabBarIcon: () => tabIcon('🗺️') }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance', tabBarLabel: 'Attendance', tabBarIcon: () => tabIcon('📅') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarLabel: 'Alerts', tabBarIcon: () => tabIcon('🔔') }} />
    </Tabs>
  );
}

const { Text } = require('react-native');
function tabIcon(emoji: string) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}
