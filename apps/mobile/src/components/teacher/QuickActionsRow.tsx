import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';

const ACTIONS = [
  { key: 'attendance', icon: '✅', label: 'Take Attendance' },
  { key: 'test', icon: '📝', label: 'Add New Test' },
  { key: 'broadcast', icon: '📢', label: 'Send Broadcast' },
] as const;

export function QuickActionsRow({ onAction }: { onAction: (key: 'attendance' | 'test' | 'broadcast') => void }) {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <GlassCard key={action.key} padded={false} style={styles.item}>
          <Pressable style={styles.button} onPress={() => onAction(action.key)}>
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  item: { flex: 1 },
  button: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xs, gap: 4 },
  icon: { fontSize: 20 },
  label: { fontSize: 11, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
});
