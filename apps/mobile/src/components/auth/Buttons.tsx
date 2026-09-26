import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '@/design/theme';

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
    <Pressable
      style={({ pressed }) => [
        styles.primary,
        isDisabled ? styles.primaryDisabled : null,
        pressed && !isDisabled ? styles.primaryPressed : null,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondary} onPress={onPress}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.link} onPress={onPress} hitSlop={6}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  link: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
