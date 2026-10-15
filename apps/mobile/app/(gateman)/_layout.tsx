import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { glass, portalAccents, colors } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

const BUS_PATH =
  'M4 16C4 16.88 4.39 17.67 5 18.22V20H8V19H16V20H19V18.22C19.61 17.67 20 16.88 20 16V6C20 2 16 2 12 2C8 2 4 2 4 6V16ZM7.5 17C6.67 17 6 16.33 6 15.5C6 14.67 6.67 14 7.5 14C8.33 14 9 14.67 9 15.5C9 16.33 8.33 17 7.5 17ZM16.5 17C15.67 17 15 16.33 15 15.5C15 14.67 15.67 14 16.5 14C17.33 14 18 14.67 18 15.5C18 16.33 17.33 17 16.5 17ZM6 10V6H18V10H6Z';

const SHIELD_PATH =
  'M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z';

const LIST_PATH =
  'M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z';

const PHONE_PATH =
  'M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z';

function GateTabIcon({ path, focused, color }: { path: string; focused: boolean; color: any }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.5 }}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d={path} fill={color} />
      </Svg>
    </View>
  );
}

export default function GatemanLayout() {
  const pendingPickups = useGatemanStore((s) => s.earlyPickups.filter((p) => p.status === 'Pending').length);
  const pendingRequests = useGatemanStore((s) => s.routingRequests.filter((r) => r.status === 'Pending').length);

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
          title: 'Command Hub',
          tabBarIcon: ({ color, focused }) => <GateTabIcon path={BUS_PATH} focused={focused} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="access"
        options={{
          title: 'Access',
          tabBarBadge: pendingPickups > 0 ? pendingPickups : undefined,
          tabBarIcon: ({ color, focused }) => <GateTabIcon path={SHIELD_PATH} focused={focused} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarBadge: pendingRequests > 0 ? pendingRequests : undefined,
          tabBarIcon: ({ color, focused }) => <GateTabIcon path={LIST_PATH} focused={focused} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin Link',
          tabBarIcon: ({ color, focused }) => <GateTabIcon path={PHONE_PATH} focused={focused} color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
