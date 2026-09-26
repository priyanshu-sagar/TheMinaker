import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 } as any}>{emoji}</Text>;
}

export default function GatekeeperLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e5e7eb' } as object,
        headerStyle: { backgroundColor: '#1a73e8' } as object,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' } as object,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mark Attendance',
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Today's Summary",
          tabBarLabel: 'Summary',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
