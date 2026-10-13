import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/design/tokens';

/** Renders an "old vs new" diff for an edit request, one row per changed field. */
export function DiffRows({ oldData, newData }: { oldData: Record<string, string>; newData: Record<string, string> }) {
  const fields = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));
  return (
    <View style={styles.wrap}>
      {fields.map((field) => (
        <View key={field} style={styles.row}>
          <Text style={styles.field}>{field}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.oldValue} numberOfLines={1}>{oldData[field] ?? '—'}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.newValue} numberOfLines={1}>{newData[field] ?? '—'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
  row: { gap: 2 },
  field: { ...typography.overline, color: colors.textMuted },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  oldValue: { flex: 1, fontSize: 14, color: colors.offline, textDecorationLine: 'line-through' },
  arrow: { color: colors.textMuted },
  newValue: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.online },
});
