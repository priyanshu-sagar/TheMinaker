import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ConductorNotificationBell } from '@/components/conductor/NotificationBell';
import { colors, palette, portalAccents, spacing, typography } from '@/design/tokens';
import { useConductorStore } from '@/store/conductor.store';

const ROUTE = 'M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z';
const LIST = 'M9 6h12v2H9V6zM3 6h4v4H3V6zm6 5h12v2H9v-2zM3 11h4v4H3v-4zm6 5h12v2H9v-2zM3 16h4v4H3v-4z';
const BELL = 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z';
const CHAT = 'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2z';
const PERSON = 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z';

function Icon({ path, color }: { path: string; color: string }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24"><Path d={path} fill={color} /></Svg>;
}

export default function ConductorLayout() {
  const busNumber = useConductorStore((state) => state.assignedBus.busNumber);
  const routeName = useConductorStore((state) => state.assignedBus.routeName);
  const requests = useConductorStore((state) => state.busChangeRequests.reduce((count, item) => count + (item.status === 'Pending' ? 1 : 0), 0));

  return (
    <View style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <View>
            <Text style={styles.bus}>{busNumber}</Text>
            <Text style={styles.route}>{routeName}</Text>
          </View>
          <ConductorNotificationBell />
        </View>
      </SafeAreaView>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: portalAccents.conductor.from,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { position: 'absolute', backgroundColor: palette.offWhite, borderTopColor: colors.borderStrong, borderTopWidth: 1, elevation: 0 },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          animation: 'none',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Route', tabBarIcon: ({ color }) => <Icon path={ROUTE} color={String(color)} /> }} />
        <Tabs.Screen name="attendance" options={{ title: 'Manifest', tabBarIcon: ({ color }) => <Icon path={LIST} color={String(color)} /> }} />
        <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarBadge: requests || undefined, tabBarIcon: ({ color }) => <Icon path={BELL} color={String(color)} /> }} />
        <Tabs.Screen name="comms" options={{ title: 'Comms', tabBarIcon: ({ color }) => <Icon path={CHAT} color={String(color)} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon path={PERSON} color={String(color)} /> }} />
        <Tabs.Screen name="manifest" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  headerWrap: { backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  bus: { ...typography.label },
  route: { ...typography.caption },
});
