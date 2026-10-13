import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, colors, portalAccents } from '@/design/tokens';
import { TabBarIcon } from '@/components/shared/TabBarIcon';

export default function ConductorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: portalAccents.conductor.from,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBackground: () => (
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopColor: glass.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Trip',
          tabBarLabel: 'Trip',
          tabBarIcon: ({ focused }) => <TabBarIcon glyph="🚌" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="manifest"
        options={{
          title: 'Student Manifest',
          tabBarLabel: 'Manifest',
          tabBarIcon: ({ focused }) => <TabBarIcon glyph="👥" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
