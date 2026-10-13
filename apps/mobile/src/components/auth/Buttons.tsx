import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, radius, shadows, spacing, typography } from '@/design/tokens';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.primaryWrapper, shadows.md, isDisabled ? styles.disabled : null]}
    >
      <LinearGradient
        colors={[colors.primary, '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryInner}
      >
        {loading ? (
          <ActivityIndicator color={palette.white} />
        ) : (
          <Text style={styles.primaryText}>{label}</Text>
        )}
      </LinearGradient>
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
      style={[styles.secondaryWrapper, shadows.sm, disabled ? styles.disabled : null]}
    >
      <BlurView intensity={40} tint="light" style={styles.secondaryBlur}>
        <View style={styles.secondaryInner}>
          <Text style={styles.secondaryText}>{label}</Text>
        </View>
      </BlurView>
    </AnimatedPressable>
  );
}

export function LinkButton({
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
      style={styles.link}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
    >
      <Text style={styles.linkText}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  primaryWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  primaryInner: {
    minHeight: 48,
    borderRadius: radius.md,
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
  secondaryWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  secondaryBlur: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  secondaryInner: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceStrong,
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
    color: colors.primary,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
});
