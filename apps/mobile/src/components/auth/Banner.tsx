import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/design/theme';

type Tone = 'error' | 'info' | 'warning';

export function Banner({ tone, children }: { tone: Tone; children: string }) {
  return (
    <View style={[styles.base, TONE_STYLES[tone].box]}>
      <Text style={[styles.text, TONE_STYLES[tone].text]}>{children}</Text>
    </View>
  );
}

const TONE_STYLES = {
  error: {
    box: { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder },
    text: { color: colors.danger },
  },
  info: {
    box: { backgroundColor: colors.infoBg, borderColor: colors.infoBorder },
    text: { color: colors.info },
  },
  warning: {
    box: { backgroundColor: colors.warningBg, borderColor: colors.warningBorder },
    text: { color: colors.warning },
  },
} as const;

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  text: { fontSize: 14, lineHeight: 20 },
});
