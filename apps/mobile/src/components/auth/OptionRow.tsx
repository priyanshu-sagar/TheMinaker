import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, glass, radius, shadows, spacing, typography } from '@/design/tokens';

export function OptionRow({
  label,
  sublabel,
  initial,
  onPress,
  selected = false,
}: {
  label: string;
  sublabel?: string;
  initial: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <AnimatedPressable
      style={[styles.wrap, shadows.sm]}
      onPress={onPress}
    >
      <BlurView intensity={35} tint="light" style={[styles.blur, selected && styles.blurSelected]}>
        <View style={[styles.row, selected ? styles.rowSelected : null]}>
          <LinearGradient
            colors={selected ? [colors.primary, '#6366F1'] : [colors.primarySurface, 'rgba(99, 102, 241, 0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={[styles.avatarText, selected ? styles.avatarTextSelected : null]}>
              {initial}
            </Text>
          </LinearGradient>

          <View style={styles.textCol}>
            <Text style={styles.label}>{label}</Text>
            {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
          </View>

          <View style={styles.chevronWrap}>
            <View style={[styles.chevronArrow, selected && styles.chevronArrowSelected]} />
          </View>
        </View>
      </BlurView>
    </AnimatedPressable>
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
    overflow: 'hidden',
  },
  blurSelected: {
    borderColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: glass.cardBg,
    gap: spacing.md,
  },
  rowSelected: {
    backgroundColor: colors.primarySurface,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  avatarTextSelected: {
    color: '#ffffff',
  },
  textCol: {
    flex: 1,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  sublabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevronWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronArrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.textMuted,
    transform: [{ rotate: '45deg' }],
  },
  chevronArrowSelected: {
    borderColor: colors.primary,
  },
});
