import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, glass, radius, shadows, spacing, typography } from '@/design/tokens';

type Tone = 'error' | 'info' | 'warning';

const TONE_CONFIG = {
  error: {
    stripColor: colors.error,
    bgColor: colors.errorBg,
    textColor: colors.error,
  },
  info: {
    stripColor: colors.info,
    bgColor: colors.infoBg,
    textColor: colors.info,
  },
  warning: {
    stripColor: colors.warning,
    bgColor: colors.warningBg,
    textColor: colors.warning,
  },
} as const;

export function Banner({ tone, children }: { tone: Tone; children: string }) {
  const config = TONE_CONFIG[tone];

  return (
    <View style={[styles.wrap, shadows.sm]}>
      <BlurView intensity={glass.blurCard} tint="light" style={styles.blur}>
        <View style={[styles.inner, { backgroundColor: config.bgColor }]}>
          <View style={[styles.strip, { backgroundColor: config.stripColor }]} />
          <View style={styles.content}>
            <Text style={[styles.text, { color: config.textColor }]}>{children}</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    minHeight: 44,
    alignItems: 'stretch',
  },
  strip: {
    width: 4,
    borderRadius: radius.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'center',
  },
  text: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
