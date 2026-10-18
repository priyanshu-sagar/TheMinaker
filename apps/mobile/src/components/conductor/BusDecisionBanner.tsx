import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, radius, spacing, typography } from '@/design/tokens';
import { useConductorStore } from '@/store/conductor.store';

function leftLabel(expiresAt: string | undefined, requestedAt: string, now: number) {
  const end = expiresAt ? new Date(expiresAt).getTime() : new Date(requestedAt).getTime() + 120000;
  const seconds = Math.max(0, Math.ceil((end - now) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function BusDecisionBanner({ flush = false }: { flush?: boolean }) {
  const requests = useConductorStore((state) => state.busChangeRequests);
  const pendingSwap = useConductorStore((state) => state.pendingSwap);
  const acknowledge = useConductorStore((state) => state.acknowledgeBusChange);
  const accept = useConductorStore((state) => state.acceptPendingSwap);
  const expire = useConductorStore((state) => state.expireStaleBusRequests);
  const [now, setNow] = useState(Date.now());
  const pending = requests.find((item) => item.status === 'Pending');
  const decision = requests.find((item) => item.status !== 'Pending' && !item.acknowledged);

  useEffect(() => {
    expire();
  }, [expire]);

  useEffect(() => {
    if (!pending) return undefined;
    const id = setInterval(() => {
      setNow(Date.now());
      expire();
    }, 1000);
    return () => clearInterval(id);
  }, [pending, expire]);

  if (pending) {
    return (
      <View style={[styles.banner, flush ? styles.flush : null, styles.wait]}>
        <Text style={styles.title}>Waiting on the gateman</Text>
        <Text style={styles.body}>Move to {pending.toBusNumber} · {leftLabel(pending.expiresAt, pending.requestedAt, now)} left. If nobody approves, this request is rejected.</Text>
      </View>
    );
  }

  if (decision?.status === 'Approved') {
    return (
      <View style={[styles.banner, flush ? styles.flush : null, styles.ok]}>
        <Text style={styles.title}>Approved · {decision.toBusNumber}</Text>
        <Text style={styles.body}>{decision.gatemanNote ?? 'The gateman approved this bus change.'}</Text>
        <View style={styles.actions}>
          <AnimatedPressable haptic="medium" onPress={accept} style={styles.go}><Text style={styles.goText}>Switch to this bus</Text></AnimatedPressable>
          <AnimatedPressable haptic="selection" onPress={() => acknowledge(decision.id)}><Text style={styles.dismiss}>Not now</Text></AnimatedPressable>
        </View>
      </View>
    );
  }

  if (decision?.status === 'Rejected' || decision?.status === 'AutoRejected') {
    const auto = decision.status === 'AutoRejected';
    return (
      <View style={[styles.banner, flush ? styles.flush : null, styles.no]}>
        <Text style={styles.title}>{auto ? 'Auto-rejected' : 'Rejected'} · {decision.toBusNumber}</Text>
        <Text style={styles.body}>{decision.gatemanNote ?? (auto ? 'The gateman did not respond within 2 minutes.' : 'The gateman rejected this request.')}</Text>
        <AnimatedPressable haptic="selection" onPress={() => acknowledge(decision.id)}><Text style={styles.dismiss}>Dismiss</Text></AnimatedPressable>
      </View>
    );
  }

  if (pendingSwap) {
    return (
      <View style={[styles.banner, flush ? styles.flush : null, styles.ok]}>
        <Text style={styles.title}>{pendingSwap.gatemanName} assigned {pendingSwap.toBusNumber}</Text>
        <Text style={styles.body}>{pendingSwap.routeName}</Text>
        <AnimatedPressable haptic="medium" onPress={accept} style={styles.go}><Text style={styles.goText}>Switch to this bus</Text></AnimatedPressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: { marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  flush: { marginHorizontal: 0 },
  wait: { backgroundColor: colors.warningBg, borderColor: colors.warning },
  ok: { backgroundColor: colors.successBg, borderColor: colors.success },
  no: { backgroundColor: colors.errorBg, borderColor: colors.error },
  title: { ...typography.bodyBold },
  body: { ...typography.caption, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  go: { minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.full, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  goText: { ...typography.caption, color: palette.white, fontWeight: '700', backgroundColor: 'transparent' },
  dismiss: { ...typography.caption, fontWeight: '700', marginTop: spacing.sm },
});
