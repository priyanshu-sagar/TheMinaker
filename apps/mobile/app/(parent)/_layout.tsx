import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji }: { emoji: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Text style={{ fontSize: 20 } as any}>{emoji}</Text>;
}

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: '#1a73e8' } as object,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' } as object,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live Tracking',
          tabBarLabel: 'Track',
          tabBarIcon: () => <TabIcon emoji="🗺️" />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarLabel: 'Attendance',
          tabBarIcon: () => <TabIcon emoji="📅" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
          tabBarIcon: () => <TabIcon emoji="🔔" />,
        }}
      />
    </Tabs>
  );
}
