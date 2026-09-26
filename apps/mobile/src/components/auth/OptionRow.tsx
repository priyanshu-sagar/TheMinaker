import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/design/theme';

export function OptionRow({
  label,
  sublabel,
  initial,
  onPress,
}: {
  label: string;
  sublabel?: string;
  initial: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e4edf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  textCol: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  sublabel: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textMuted },
});
