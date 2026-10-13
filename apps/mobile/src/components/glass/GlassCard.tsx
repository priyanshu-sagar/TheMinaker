import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, radius, spacing } from '@/design/tokens';

/**
 * Glassmorphism card: blurred, semi-transparent fill, a thin light border,
 * and a soft layered shadow for a floating, tactile feel. Shared by every
 * glassmorphism portal.
 */
export function GlassCard({
  children,
  style,
  padded = true,
  intensity = glass.blurCard,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  intensity?: number;
}) {
  const flatStyle = StyleSheet.flatten(style);
  const cardRadius = flatStyle?.borderRadius ?? radius.lg;

  const isFlex = flatStyle?.flex !== undefined;

  return (
    <View style={[styles.shadowWrap, style, { borderRadius: cardRadius }]}>
      <View style={[styles.glassBg, { borderRadius: cardRadius }, isFlex && { flex: 1 }]}>
        <BlurView intensity={intensity} tint="light" style={[styles.blur, { borderRadius: cardRadius }, isFlex && { flex: 1 }]}>
          <View style={[styles.tint, padded ? styles.padded : null, isFlex && { flex: 1 }]}>{children}</View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    backgroundColor: 'transparent',
    borderRadius: radius.lg,
    shadowColor: glass.shadow,
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  glassBg: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'transparent',
  },
  tint: { backgroundColor: 'transparent' },
  padded: { padding: spacing.lg },
});
