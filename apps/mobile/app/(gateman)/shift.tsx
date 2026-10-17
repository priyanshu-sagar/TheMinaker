import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, radius, spacing, typography } from '@/design/tokens';
import { useAuthStore } from '@/store/auth.store';
import { useGatemanStore } from '@/store/gateman.store';

export default function ShiftScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const logs = useGatemanStore((state) => state.shiftLog);
  const gateLockedDown = useGatemanStore((state) => state.gateLockedDown);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);
  const clock = [Math.floor(elapsed / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={styles.list}>
          <Text style={styles.title}>Shift</Text>
          <GlassCard>
            <Text style={styles.name}>{user?.fullName ?? 'Gateman'}</Text>
            <Text style={styles.meta}>On duty {clock}</Text>
            <Text style={styles.meta}>Gate is {gateLockedDown ? 'closed' : 'open'}</Text>
            <Text style={styles.meta}>{logs.length} actions recorded this shift</Text>
          </GlassCard>
          <Text style={styles.section}>Action history</Text>
          {logs.map((item) => (
            <GlassCard key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.action}</Text>
              <Text style={styles.meta}>{item.description}</Text>
              <Text style={styles.meta}>{new Date(item.timestamp).toLocaleString()}</Text>
            </GlassCard>
          ))}
          <AnimatedPressable
            haptic="medium"
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/portal-showcase');
            }}
            style={styles.signOut}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </AnimatedPressable>
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 140 },
  title: { ...typography.heading, marginBottom: spacing.md },
  section: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { marginBottom: spacing.sm },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  signOut: { marginTop: spacing.xl, minHeight: 48, borderRadius: radius.md, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  signOutText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
