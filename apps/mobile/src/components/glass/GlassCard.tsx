import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass } from '@/design/glass-theme';
import { radius, spacing } from '@/design/theme';

/**
 * Glassmorphism card: blurred, semi-transparent fill, a thin light border,
 * and a soft layered shadow for a floating, tactile feel. Shared by every
 * glassmorphism portal (Gateman, Teacher, and the portal selector).
 */
export function GlassCard({
  children,
  style,
  padded = true,
  intensity = 40,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  intensity?: number;
}) {
  return (
    <View style={[styles.shadowWrap, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={[styles.tint, padded ? styles.padded : null]}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.lg,
    shadowColor: glass.shadow,
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  blur: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
  },
  tint: { backgroundColor: glass.cardBg },
  padded: { padding: spacing.lg },
});
