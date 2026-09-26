import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/design/theme';

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, active ? styles.segmentActive : null]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, active ? styles.labelActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#eaeef2',
    borderRadius: radius.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentActive: { backgroundColor: colors.surface, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  labelActive: { color: colors.textPrimary },
});
