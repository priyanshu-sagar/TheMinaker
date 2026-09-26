import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statusColors } from '@/design/gateman-theme';
import { GlassCard } from '@/components/glass/GlassCard';

export function MetricChip({ label, count, tone }: { label: string; count: number; tone: 'online' | 'offline' }) {
  const fg = tone === 'online' ? statusColors.online : statusColors.offline;
  return (
    <GlassCard style={styles.chipWrap} padded={false}>
      <View style={styles.inner}>
        <Text style={[styles.count, { color: fg }]}>{count}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  chipWrap: { flex: 1 },
  inner: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
  count: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
});
