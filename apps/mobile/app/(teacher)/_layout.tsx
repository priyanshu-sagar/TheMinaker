import { Tabs } from 'expo-router';
import { colors } from '@/design/teacher-theme';
import { TabBarIcon } from '@/components/shared/TabBarIcon';

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabBarIcon glyph="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="roster"
        options={{ title: 'Class Roster', tabBarIcon: ({ focused }) => <TabBarIcon glyph="👥" focused={focused} /> }}
      />
      <Tabs.Screen
        name="academics"
        options={{ title: 'Academics', tabBarIcon: ({ focused }) => <TabBarIcon glyph="📚" focused={focused} /> }}
      />
      <Tabs.Screen
        name="comms"
        options={{ title: 'Comms Hub', tabBarIcon: ({ focused }) => <TabBarIcon glyph="💬" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ focused }) => <TabBarIcon glyph="⚙️" focused={focused} /> }}
      />
    </Tabs>
  );
}
