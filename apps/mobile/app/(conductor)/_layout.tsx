import { Tabs } from 'expo-router';

export default function ConductorLayout() {
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
      <Tabs.Screen
        name="index"
        options={{ title: 'My Trip', tabBarLabel: 'Trip', tabBarIcon: () => tabIcon('🚌') }}
      />
      <Tabs.Screen
        name="manifest"
        options={{ title: 'Student Manifest', tabBarLabel: 'Manifest', tabBarIcon: () => tabIcon('👥') }}
      />
    </Tabs>
  );
}

const { Text } = require('react-native');
function tabIcon(emoji: string) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}
