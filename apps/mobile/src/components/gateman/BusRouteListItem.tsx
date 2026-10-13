import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { StatusBadge } from './StatusBadge';
import { FleetBus } from '@/store/gateman.store';

export function BusRouteListItem({ bus, onPress }: { bus: FleetBus; onPress?: () => void }) {
  return (
    <GlassCard padded={false} style={shadows.sm}>
      <AnimatedPressable style={styles.row} onPress={onPress}>
        <View style={styles.info}>
          <Text style={styles.route}>{bus.routeName}</Text>
          <Text style={styles.meta}>{bus.busNumber} · {bus.conductorName}</Text>
        </View>
        <StatusBadge label={bus.status} tone={bus.status === 'Online' ? 'online' : 'offline'} />
      </AnimatedPressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, gap: spacing.md },
  info: { flex: 1 },
  route: { ...typography.bodyBold, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
