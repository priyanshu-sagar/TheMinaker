import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

function SlideToAuthorize({ onDone }: { onDone: () => void }) {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      x.value = Math.max(0, Math.min(event.translationX, 210));
    })
    .onEnd(() => {
      if (x.value > 160) runOnJS(onDone)();
      x.value = withSpring(0, { damping: 14, stiffness: 200 });
    });
  return (
    <View style={styles.track}>
      <Text style={styles.trackLabel}>Slide to authorize</Text>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.knob, style]} />
      </GestureDetector>
    </View>
  );
}

export default function AccessScreen() {
  const entries = useGatemanStore((state) => state.gateEntries);
  const pickups = useGatemanStore((state) => state.earlyPickups);
  const verifyPickup = useGatemanStore((state) => state.verifyPickup);

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Gate access</Text>
          <NotificationBell />
        </View>
        <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={styles.list}>
          <Text style={styles.section}>Early pickup and self drop-off</Text>
          {pickups.filter((item) => item.status === 'Pending').map((item) => (
            <GlassCard key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.studentName}</Text>
              <Text style={styles.meta}>{item.grade} · {item.parentName}</Text>
              <Text style={styles.meta}>{item.reason}</Text>
              <SlideToAuthorize onDone={() => verifyPickup(item.id)} />
            </GlassCard>
          ))}
          <Text style={styles.section}>Today at the gate</Text>
          {entries.map((item) => (
            <GlassCard key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.studentName}</Text>
              <Text style={styles.meta}>{item.type} · {item.method}</Text>
              <Text style={styles.meta}>{new Date(item.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
            </GlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  title: { ...typography.heading },
  list: { padding: spacing.lg, paddingBottom: 140 },
  section: { ...typography.overline, marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { marginBottom: spacing.md },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  track: { marginTop: spacing.md, height: 44, borderRadius: radius.full, backgroundColor: colors.neutralBg, justifyContent: 'center', overflow: 'hidden' },
  trackLabel: { ...typography.caption, textAlign: 'center' },
  knob: { position: 'absolute', left: 4, width: 36, height: 36, borderRadius: 18, backgroundColor: portalAccents.gateman.from },
});
