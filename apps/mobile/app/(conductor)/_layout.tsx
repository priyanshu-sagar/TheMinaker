import { StyleSheet, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { UserRole } from '@minaker/shared-types';
import { useAuthStore } from '@/store/auth.store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ConductorNotificationBell } from '@/components/conductor/NotificationBell';
import { colors, palette, portalAccents, spacing, typography } from '@/design/tokens';
import { useConductorStore } from '@/store/conductor.store';

const ROUTE = 'M2 11h6v2H2v-2zm8 0h4v2h-4v-2zm6 0h6v2h-6v-2zM4 8a2 2 0 1 0 .01 0zM12 8a2 2 0 1 0 .01 0zM20 8a2 2 0 1 0 .01 0z';
const LIST = 'M9 6h12v2H9V6zM3 6h4v4H3V6zm6 5h12v2H9v-2zM3 11h4v4H3v-4zm6 5h12v2H9v-2zM3 16h4v4H3v-4z';
const OPS = 'M4 8h16v2H4V8zm0 5h16v2H4v-2zm0 5h10v2H4v-2z';
const BELL = 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z';
const PERSON = 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z';

function Icon({ path, color }: { path: string; color: string }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24"><Path d={path} fill={color} /></Svg>;
}

export default function ConductorLayout() {
  const signedIn = useAuthStore((state) => state.isSignedIn);
  const role = useAuthStore((state) => state.role);
  const conductorName = useAuthStore((state) => state.user?.fullName);
  const busNumber = useConductorStore((state) => state.assignedBus.busNumber);
  const routeName = useConductorStore((state) => state.assignedBus.routeName);
  const flags = useConductorStore((state) => state.offLocationFlags.reduce((count, item) => count + (item.status === 'Verified' || item.status === 'Rejected' ? 0 : 1), 0));

  if (!signedIn || role !== UserRole.CONDUCTOR) return <Redirect href="/(auth)/conductor/login" />;

  return (
    <View style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.bus}>{conductorName || 'Ranjit Singh'}</Text>
            <Text style={styles.chip}>{busNumber} · {routeName}</Text>
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
        <Tabs.Screen name="index" options={{ title: 'Live', tabBarIcon: ({ color }) => <Icon path={ROUTE} color={String(color)} /> }} />
        <Tabs.Screen name="manifest" options={{ title: 'Roster', tabBarIcon: ({ color }) => <Icon path={LIST} color={String(color)} /> }} />
        <Tabs.Screen name="requests" options={{ title: 'Ops', tabBarBadge: flags || undefined, tabBarIcon: ({ color }) => <Icon path={OPS} color={String(color)} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Shift', tabBarIcon: ({ color }) => <Icon path={PERSON} color={String(color)} /> }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="attendance" options={{ href: null }} />
        <Tabs.Screen name="comms" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  headerWrap: { backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  identity: { flex: 1, paddingRight: spacing.md },
  bus: { ...typography.heading },
  chip: { ...typography.caption, marginTop: 2 },
});
