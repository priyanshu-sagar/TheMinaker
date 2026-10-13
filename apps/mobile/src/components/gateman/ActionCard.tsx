import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius, palette, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';

export function ActionCard({
  title,
  subtitle,
  tone = 'neutral',
  children,
  onPress,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
}: {
  title: string;
  subtitle?: string;
  tone?: 'neutral' | 'amber';
  children?: ReactNode;
  onPress?: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
}) {
  const content = (
    <View style={[styles.body, tone === 'amber' ? styles.bodyAmber : null]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
      <View style={styles.actions}>
        <AnimatedPressable style={[styles.reject, shadows.sm]} onPress={onSecondary}>
          <Text style={styles.rejectText}>{secondaryLabel}</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.approve, shadows.sm]} onPress={onPrimary}>
          <Text style={styles.approveText}>{primaryLabel}</Text>
        </AnimatedPressable>
      </View>
      {tertiaryLabel && onTertiary ? (
        <AnimatedPressable style={[styles.tertiary, shadows.sm]} onPress={onTertiary}>
          <Text style={styles.tertiaryText}>{tertiaryLabel}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );

  return (
    <GlassCard padded={false} style={shadows.sm}>
      {onPress ? <AnimatedPressable onPress={onPress}>{content}</AnimatedPressable> : content}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.sm },
  bodyAmber: { backgroundColor: colors.warningBg },
  title: { ...typography.heading, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  reject: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.offline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: { color: colors.offline, fontWeight: '700', fontSize: 15 },
  approve: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.online,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: { color: palette.white, fontWeight: '700', fontSize: 15 },
  tertiary: {
    minHeight: 42,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.boarded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryText: { color: colors.boarded, fontWeight: '700', fontSize: 14 },
});
