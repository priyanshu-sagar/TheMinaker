import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, radius, spacing, typography } from '@/design/tokens';

export function BackRow({ label = 'Back', onPress }: { label?: string; onPress?: () => void }) {
  return (
    <AnimatedPressable
      style={styles.button}
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
    >
      <View style={styles.iconWrap}>
        <View style={styles.chevron} />
      </View>
      <Text style={styles.text}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingLeft: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  chevron: {
    width: 7,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },
  text: {
    ...typography.label,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
