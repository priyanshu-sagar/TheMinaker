import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/design/tokens';

/** Solid toast so the message cannot show through from the screen behind it. */
export function ParentToast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 108,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: colors.success,
  },
  text: {
    ...typography.bodyBold,
    color: '#065F46',
    backgroundColor: 'transparent',
  },
});
