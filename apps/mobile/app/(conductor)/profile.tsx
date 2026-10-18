import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { BusDecisionBanner } from '@/components/conductor/BusDecisionBanner';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useAuthStore } from '@/store/auth.store';
import { useConductorStore } from '@/store/conductor.store';

const DAY = 24 * 60 * 60 * 1000;
const TABS = ['All', 'Boarding', 'Dropping', 'Detours'] as const;

export default function ConductorProfileScreen() {
  const bus = useConductorStore((state) => state.assignedBus);
  const fleet = useConductorStore((state) => state.fleetBuses);
  const source = useConductorStore((state) => state.assignmentSource);
  const students = useConductorStore((state) => state.studentManifest);
  const logs = useConductorStore((state) => state.shiftLogs);
  const alertsOn = useConductorStore((state) => state.soundAlertsEnabled && state.vibrationEnabled);
  const tripLive = useConductorStore((state) => state.tripLive);
  const toggleAlerts = useConductorStore((state) => state.toggleAlerts);
  const submitBusChangeRequest = useConductorStore((state) => state.submitBusChangeRequest);
  const endShift = useConductorStore((state) => state.endShift);
  const signOut = useAuthStore((state) => state.signOut);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const [logTab, setLogTab] = useState<(typeof TABS)[number]>('All');
  const openBuses = fleet.filter((item) => !item.conductorName && item.status !== 'Maintenance' && item.busNumber !== bus.busNumber).map((item) => item.busNumber);
  const onBus = useMemo(() => students.filter((item) => item.boardingStatus === 'Boarded').length, [students]);
  const recent = useMemo(() => logs.filter((item) => {
    if (Date.now() - new Date(item.timestamp).getTime() >= 30 * DAY) return false;
    if (logTab === 'Boarding') return item.action.toLowerCase().includes('board');
    if (logTab === 'Dropping') return item.action.toLowerCase().includes('drop');
    if (logTab === 'Detours') return item.action.toLowerCase().includes('detour') || item.action.toLowerCase().includes('flag') || item.action.toLowerCase().includes('swap') || item.action.toLowerCase().includes('phone');
    return true;
  }).slice(0, 16), [logs, logTab]);
  const completion = Math.round(((bus.currentStopIndex + 1) / bus.totalStops) * 100);

  function requestSwap() {
    if (!openBuses.length) {
      setAsk({ tone: 'info', title: 'No open bus', summary: 'Every other bus already has a conductor.', confirmLabel: 'OK', onConfirm: () => undefined });
      return;
    }
    setAsk({ tone: 'approve', title: 'Request a bus swap', summary: 'Pick an open bus. The gateman has 2 minutes to approve it.', confirmLabel: 'Send request', reasons: openBuses, onConfirm: (picked) => { if (picked) submitBusChangeRequest(picked, picked, 'Requested from shift'); } });
  }

  function signOutShift() {
    if (onBus > 0) {
      setAsk({ tone: 'override', title: 'Students are still on the bus', summary: `${onBus} students are still on ${bus.busNumber}. Finish the ${tripLive ? 'live ' : ''}run before you sign out.`, confirmLabel: 'OK', onConfirm: () => undefined });
      return;
    }
    setAsk({
      tone: 'reject',
      title: 'Sign out of this shift',
      summary: tripLive ? 'This also takes the empty bus offline. The 30-day log stays on this phone.' : 'The 30-day log stays on this phone. You will return to the portal picker.',
      confirmLabel: 'Sign out',
      onConfirm: async () => {
        if (tripLive) useConductorStore.getState().setTripLive(false);
        endShift();
        await signOut();
        router.replace('/(auth)/portal-showcase');
      },
    });
  }

  return (
    <MeshBackground>
      <ScrollView bounces={false} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.idCard}>
          <LinearGradient colors={[portalAccents.conductor.from, portalAccents.conductor.to]} style={styles.avatar}><Text style={styles.avatarText}>{bus.conductorName.slice(0, 1)}</Text></LinearGradient>
          <View style={styles.flex}>
            <Text style={styles.heading} numberOfLines={1}>{bus.conductorName}</Text>
            <Text style={styles.meta}>EMP-2847 · Licence valid</Text>
            <Text style={styles.meta} numberOfLines={1}>{bus.busNumber} · {bus.routeName}</Text>
            <Text style={styles.meta}>{source}</Text>
          </View>
        </View>
        <BusDecisionBanner flush />
        <AnimatedPressable haptic="selection" onPress={requestSwap} style={styles.swapBtn}><Text style={styles.white}>Request a bus swap</Text></AnimatedPressable>

        <Text style={styles.section}>This shift</Text>
        <View style={styles.grid}>
          <Stat label="Started" value="06:15 AM" />
          <Stat label="Route done" value={`${completion}%`} />
          <Stat label="On the bus" value={String(onBus)} />
          <Stat label="On time" value="96%" />
        </View>

        <Text style={styles.section}>30-day log</Text>
        <View style={styles.pills}>
          {TABS.map((item) => (
            <AnimatedPressable key={item} haptic="selection" onPress={() => setLogTab(item)} style={[styles.pill, logTab === item ? styles.pillOn : null]}>
              <Text style={[styles.pillText, logTab === item ? styles.pillTextOn : null]}>{item}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.colTime, styles.headText]}>When</Text>
            <Text style={[styles.colEvent, styles.headText]}>What happened</Text>
          </View>
          {recent.length === 0 ? <Text style={styles.empty}>No rows in this filter.</Text> : recent.map((item, index) => (
            <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableAlt : null]}>
              <Text style={styles.colTime}>{new Date(item.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
              <Text style={styles.colEvent}>{item.action}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footnote}>Kept on this phone for 30 days. The gateman issues the official PDF.</Text>

        <Text style={styles.section}>Alerts</Text>
        <View style={styles.setting}>
          <View style={styles.flex}>
            <Text style={styles.body}>Sound and vibration</Text>
            <Text style={styles.meta}>One switch. Stops and parent pings ring and vibrate together.</Text>
          </View>
          <Switch value={alertsOn} onValueChange={toggleAlerts} trackColor={{ false: colors.borderStrong, true: portalAccents.conductor.from }} />
        </View>

        <AnimatedPressable haptic="medium" onPress={signOutShift} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </AnimatedPressable>
      </ScrollView>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 150 },
  flex: { flex: 1 },
  idCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.heading, color: palette.white, backgroundColor: 'transparent' },
  heading: { ...typography.heading },
  meta: { ...typography.caption, marginTop: 2 },
  body: { ...typography.bodyBold },
  swapBtn: { minHeight: 44, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  section: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { width: '48%', backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  statValue: { ...typography.heading },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pill: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center', backgroundColor: palette.white },
  pillOn: { borderColor: portalAccents.conductor.from, backgroundColor: colors.successBg },
  pillText: { ...typography.caption, color: colors.textPrimary },
  pillTextOn: { color: portalAccents.conductor.from, fontWeight: '700' },
  table: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, backgroundColor: palette.white },
  tableHead: { flexDirection: 'row', backgroundColor: colors.neutralBg, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  tableRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
  tableAlt: { backgroundColor: colors.surfaceStrong },
  headText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700', marginTop: 0 },
  colTime: { width: 108, ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  colEvent: { flex: 1, ...typography.caption, color: colors.textPrimary },
  empty: { ...typography.caption, padding: spacing.md },
  footnote: { ...typography.caption, marginTop: spacing.sm },
  setting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong },
  signOut: { marginTop: spacing.lg, minHeight: 48, borderRadius: radius.full, borderWidth: 1, borderColor: colors.error, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  signOutText: { ...typography.bodyBold, color: colors.error, backgroundColor: 'transparent' },
});
