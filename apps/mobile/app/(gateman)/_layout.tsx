import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, palette, portalAccents } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

const BUS = 'M4 16C4 16.88 4.39 17.67 5 18.22V20H8V19H16V20H19V18.22C19.61 17.67 20 16.88 20 16V6C20 2 16 2 12 2C8 2 4 2 4 6V16ZM6 10V6H18V10H6Z';
const MAP = 'M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z';
const SHIELD = 'M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z';
const PHONE = 'M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z';
const CLOCK = 'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12.5 7V12.2L16.5 14.6L15.7 15.9L11 13V7H12.5Z';

function Icon({ path, color }: { path: string; color: string }) {
  return (
    <View>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d={path} fill={color} />
      </Svg>
    </View>
  );
}

export default function GatemanLayout() {
  const pendingPickups = useGatemanStore((state) => state.earlyPickups.reduce((count, item) => count + (item.status === 'Pending' ? 1 : 0), 0));
  const pendingRequests = useGatemanStore((state) => state.routingRequests.reduce((count, item) => count + (item.status === 'Pending' ? 1 : 0), 0));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: portalAccents.gateman.from,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBackground: () => <View style={[StyleSheet.absoluteFill, styles.tabBar]} />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: palette.offWhite,
          borderTopColor: colors.borderStrong,
          borderTopWidth: 1,
          elevation: 0,
        },
        animation: 'none',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color }) => <Icon path={BUS} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color }) => <Icon path={MAP} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="gate-access"
        options={{
          title: 'Gate',
          tabBarBadge: pendingPickups + pendingRequests || undefined,
          tabBarIcon: ({ color }) => <Icon path={SHIELD} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="admin-comms"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <Icon path={PHONE} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="shift-logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color }) => <Icon path={CLOCK} color={String(color)} />,
        }}
      />

      {/* Hidden orphan screens */}
      <Tabs.Screen name="access" options={{ href: null }} />
      <Tabs.Screen name="requests" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="shift" options={{ href: null }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="inbox" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: palette.offWhite },
});
