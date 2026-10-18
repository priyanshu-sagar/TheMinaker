import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, radius, spacing, typography } from '@/design/tokens';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  color = colors.primary,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}) {
  const isDisabled = disabled || loading;
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.primaryInner, { backgroundColor: color }, isDisabled ? styles.disabled : null]}
    >
      {loading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryText}>{label}</Text>}
    </AnimatedPressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.secondaryInner, disabled ? styles.disabled : null]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </AnimatedPressable>
  );
}

export function LinkButton({
  label,
  onPress,
  disabled = false,
  color = colors.primary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <AnimatedPressable
      style={styles.link}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
    >
      <Text style={[styles.linkText, { color }]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  primaryInner: {
    minHeight: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryText: {
    ...typography.label,
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryInner: {
    minHeight: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.white,
  },
  secondaryText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  linkText: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
});
