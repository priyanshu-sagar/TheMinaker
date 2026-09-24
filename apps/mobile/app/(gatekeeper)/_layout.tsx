import { Tabs } from 'expo-router';

export default function GatekeeperLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e5e7eb' },
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mark Attendance',
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color }) => <TabIcon emoji="✅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Today's Summary",
          tabBarLabel: 'Summary',
          tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, opacity: color === '#1a73e8' ? 1 : 0.5 }}>{emoji}</Text>;
}
