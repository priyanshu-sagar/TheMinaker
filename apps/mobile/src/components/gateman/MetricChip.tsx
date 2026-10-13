import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';

export function MetricChip({ label, count, tone }: { label: string; count: number; tone: 'online' | 'offline' }) {
  const fg = tone === 'online' ? colors.online : colors.offline;
  return (
    <GlassCard style={[styles.chipWrap, shadows.sm]} padded={false}>
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
  label: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
});
