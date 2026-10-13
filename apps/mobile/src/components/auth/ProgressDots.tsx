import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/design/tokens';

export function ProgressDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        if (isActive) {
          return (
            <LinearGradient
              key={index}
              colors={[colors.primary, '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.pillActive}
            />
          );
        }

        return (
          <View
            key={index}
            style={[styles.pill, isCompleted ? styles.pillCompleted : styles.pillInactive]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    width: 26,
    height: 7,
    borderRadius: radius.full,
  },
  pill: {
    width: 10,
    height: 7,
    borderRadius: radius.full,
  },
  pillCompleted: {
    backgroundColor: colors.primary,
    opacity: 0.45,
  },
  pillInactive: {
    backgroundColor: colors.borderStrong,
  },
});
