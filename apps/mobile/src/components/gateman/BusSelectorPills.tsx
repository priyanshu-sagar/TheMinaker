import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing } from '@/design/gateman-theme';
import { FleetBus } from '@/store/gateman.store';

export function BusSelectorPills({
  buses,
  selectedId,
  onSelect,
}: {
  buses: FleetBus[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {buses.map((bus) => {
        const active = bus.id === selectedId;
        return (
          <Pressable key={bus.id} style={[styles.pill, active ? styles.pillActive : null]} onPress={() => onSelect(bus.id)}>
            <Text style={[styles.text, active ? styles.textActive : null]}>{bus.busNumber}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  pill: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  textActive: { color: '#fff' },
});
