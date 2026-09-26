import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/design/theme';

export function ProgressDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 18 },
});
