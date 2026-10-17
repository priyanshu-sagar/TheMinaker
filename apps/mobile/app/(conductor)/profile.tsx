import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useAuthStore } from '@/store/auth.store';
import { useConductorStore } from '@/store/conductor.store';

export default function ConductorProfileScreen() {
  const bus = useConductorStore((state) => state.assignedBus);
  const students = useConductorStore((state) => state.studentManifest);
  const pings = useConductorStore((state) => state.pingRecords);
  const flags = useConductorStore((state) => state.offLocationFlags);
  const logs = useConductorStore((state) => state.shiftLogs);
  const sound = useConductorStore((state) => state.soundAlertsEnabled);
  const routeMode = useConductorStore((state) => state.routeChangeModeActive);
  const toggleSound = useConductorStore((state) => state.toggleSoundAlerts);
  const toggleRoute = useConductorStore((state) => state.toggleRouteChangeMode);
  const endShift = useConductorStore((state) => state.endShift);
  const signOut = useAuthStore((state) => state.signOut);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const boarded = useMemo(() => students.filter((item) => item.boardingStatus === 'Boarded').length, [students]);
  const absent = useMemo(() => students.filter((item) => item.boardingStatus === 'Absent').length, [students]);
  const recent = useMemo(() => logs.slice(0, 12), [logs]);

  return (
    <MeshBackground>
      <ScrollView bounces={false} contentContainerStyle={styles.list}>
        <GlassCard style={[shadows.lg, styles.card]}>
          <LinearGradient colors={[portalAccents.conductor.from, portalAccents.conductor.to]} style={styles.avatar}><Text style={styles.avatarText}>R</Text></LinearGradient>
          <Text style={styles.heading}>{bus.conductorName}</Text>
          <Text style={styles.meta}>Bus conductor · EMP-2847</Text>
          <Text style={styles.badge}>{bus.busNumber} · Route A</Text>
        </GlassCard>
        <Text style={styles.section}>Shift summary</Text>
        <GlassCard style={styles.card}>
          <View style={styles.grid}>
            <Cell label="Start" value="06:15 AM" />
            <Cell label="Stop" value={`${bus.currentStopIndex + 1} of ${bus.totalStops}`} />
            <Cell label="Boarded" value={String(boarded)} />
            <Cell label="Absent" value={String(absent)} />
            <Cell label="Pings" value={String(pings.length)} />
            <Cell label="Flags" value={String(flags.length)} />
          </View>
        </GlassCard>
        <Text style={styles.section}>Shift log</Text>
        {recent.map((item) => (
          <View key={item.id} style={styles.log}>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
            <Text style={styles.meta}>{item.action}</Text>
          </View>
        ))}
        <Text style={styles.section}>Settings</Text>
        <View style={styles.setting}><Text style={styles.body}>Sound alerts</Text><Switch value={sound} onValueChange={toggleSound} trackColor={{ false: colors.borderStrong, true: portalAccents.conductor.from }} /></View>
        <View style={styles.setting}><Text style={styles.body}>Route change mode</Text><Switch value={routeMode} onValueChange={toggleRoute} trackColor={{ false: colors.borderStrong, true: portalAccents.conductor.from }} /></View>
        <Text style={styles.section}>Account</Text>
        <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'reject', title: 'End shift and sign out', summary: 'The shift summary stays in the log. Sign out of this conductor session?', confirmLabel: 'Sign out', onConfirm: async () => { endShift(); await signOut(); router.replace('/(auth)/portal-showcase'); } })}>
          <Text style={styles.signOut}>Sign out</Text>
        </AnimatedPressable>
      </ScrollView>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return <View style={styles.cell}><Text style={styles.body}>{value}</Text><Text style={styles.meta}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 140 },
  card: { padding: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.hero, color: palette.white, backgroundColor: 'transparent' },
  heading: { ...typography.heading, marginTop: spacing.sm },
  meta: { ...typography.caption, marginTop: 2 },
  badge: { alignSelf: 'flex-start', marginTop: spacing.sm, ...typography.caption, color: colors.success, backgroundColor: colors.successBg, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, fontWeight: '700' },
  section: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33%', paddingVertical: spacing.sm },
  body: { ...typography.bodyBold },
  log: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs, borderLeftWidth: 2, borderLeftColor: portalAccents.conductor.from, paddingLeft: spacing.sm, marginLeft: spacing.xs },
  time: { ...typography.caption, width: 72, fontWeight: '700', color: colors.textPrimary },
  setting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  signOut: { ...typography.bodyBold, color: colors.error, backgroundColor: 'transparent' },
});
