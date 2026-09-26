import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/gateman-theme';
import { GlassCard } from '@/components/glass/GlassCard';

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
        <Pressable style={styles.reject} onPress={onSecondary}>
          <Text style={styles.rejectText}>{secondaryLabel}</Text>
        </Pressable>
        <Pressable style={styles.approve} onPress={onPrimary}>
          <Text style={styles.approveText}>{primaryLabel}</Text>
        </Pressable>
      </View>
      {tertiaryLabel && onTertiary ? (
        <Pressable style={styles.tertiary} onPress={onTertiary}>
          <Text style={styles.tertiaryText}>{tertiaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <GlassCard padded={false}>
      {onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.sm },
  bodyAmber: { backgroundColor: 'rgba(245, 158, 11, 0.08)' },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  reject: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: statusColors.offline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: { color: statusColors.offline, fontWeight: '700', fontSize: 15 },
  approve: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: statusColors.online,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  tertiary: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: statusColors.boarded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryText: { color: statusColors.boarded, fontWeight: '700', fontSize: 14 },
});
