import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/design/gateman-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { StatusBadge } from './StatusBadge';
import { FleetBus } from '@/store/gateman.store';

export function BusRouteListItem({ bus, onPress }: { bus: FleetBus; onPress?: () => void }) {
  return (
    <GlassCard padded={false}>
      <Pressable style={styles.row} onPress={onPress}>
        <View style={styles.info}>
          <Text style={styles.route}>{bus.routeName}</Text>
          <Text style={styles.meta}>{bus.busNumber} · {bus.conductorName}</Text>
        </View>
        <StatusBadge label={bus.status} tone={bus.status === 'Online' ? 'online' : 'offline'} />
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, gap: spacing.md },
  info: { flex: 1 },
  route: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
