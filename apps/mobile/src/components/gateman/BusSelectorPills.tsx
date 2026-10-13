import { ScrollView, StyleSheet, Text } from 'react-native';
import { glass, colors, radius, spacing, palette, shadows } from '@/design/tokens';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
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
          <AnimatedPressable
            key={bus.id}
            style={[styles.pill, active ? styles.pillActive : null, shadows.sm]}
            onPress={() => onSelect(bus.id)}
          >
            <Text style={[styles.text, active ? styles.textActive : null]}>{bus.busNumber}</Text>
          </AnimatedPressable>
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
    backgroundColor: glass.cardBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  textActive: { color: palette.white },
});
