import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { glass, portalAccents, colors } from '@/design/tokens';
import { TabBarIcon } from '@/components/shared/TabBarIcon';
import { useGatemanStore } from '@/store/gateman.store';

export default function GatemanLayout() {
  const pendingCount = useGatemanStore(
    (state) => state.profileApprovals.length + state.editRequests.length + state.geofenceAlerts.length,
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: portalAccents.gateman.from,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBackground: () => (
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: glass.border,
          borderTopWidth: 1,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live Fleet',
          tabBarIcon: ({ focused }) => <TabBarIcon glyph="🚌" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Action Inbox',
          tabBarIcon: ({ focused }) => <TabBarIcon glyph="📥" focused={focused} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ focused }) => <TabBarIcon glyph="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon glyph="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
