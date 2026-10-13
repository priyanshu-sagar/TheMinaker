import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, glass, radius, shadows, spacing, typography } from '@/design/tokens';

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
    <View style={[styles.wrap, shadows.sm]}>
      <BlurView intensity={25} tint="light" style={styles.blur}>
        <View style={styles.track}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <AnimatedPressable
                key={option.value}
                style={[styles.segment, active ? styles.segmentActive : null]}
                onPress={() => onChange(option.value)}
                haptic="selection"
              >
                <Text style={[styles.label, active ? styles.labelActive : null]}>
                  {option.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  track: {
    flexDirection: 'row',
    padding: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentActive: {
    backgroundColor: colors.surfaceStrong,
    shadowColor: glass.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    ...typography.label,
    fontSize: 14,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
