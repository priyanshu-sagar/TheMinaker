import { StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/design/theme';

export function StepHeader({ step, total }: { step: number; total: number }) {
  return <Text style={styles.text}>Step {step} of {total}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
});
