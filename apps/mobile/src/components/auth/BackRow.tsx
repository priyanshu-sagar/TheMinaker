import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/design/theme';

export function BackRow({ label = 'Back', onPress }: { label?: string; onPress?: () => void }) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
    >
      <Text style={styles.text}>‹ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 32, justifyContent: 'center', marginBottom: spacing.sm },
  text: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
