import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { glass, radius, shadows, spacing, typography } from '@/design/tokens';
import { BackRow } from './BackRow';

export function AuthScreen({
  title,
  subtitle,
  showBack = true,
  footer,
  children,
  headerIcon,
  headerContent,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  headerIcon?: ReactNode;
  headerContent?: ReactNode;
}) {
  const hasHeader = Boolean(title || subtitle || headerIcon || headerContent);

  return (
    <MeshBackground>
      {/* Decorative floating orbs */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb3]} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
          >
            {showBack ? <BackRow /> : null}

            {hasHeader ? (
              <GlassCard style={[styles.headerCard, shadows.sm]} padded={false}>
                <View style={styles.headerInner}>
                  {headerIcon ? <View style={styles.headerIconWrap}>{headerIcon}</View> : null}
                  {headerContent}
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
              </GlassCard>
            ) : null}

            <View style={styles.body}>{children}</View>
          </ScrollView>

          {footer ? (
            <BlurView intensity={glass.blurModal} tint="light" style={styles.footerBlur}>
              <View style={styles.footerInner}>{footer}</View>
            </BlurView>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerInner: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  headerIconWrap: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 2,
  },
  body: {
    marginBottom: spacing.md,
  },
  footerBlur: {
    borderTopWidth: 1,
    borderTopColor: glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  footerInner: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  orb: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  orb1: {
    width: 240,
    height: 240,
    top: -50,
    right: -60,
    backgroundColor: glass.orb1,
    opacity: 0.6,
  },
  orb2: {
    width: 280,
    height: 280,
    bottom: 80,
    left: -80,
    backgroundColor: glass.orb2,
    opacity: 0.5,
  },
  orb3: {
    width: 180,
    height: 180,
    top: '40%',
    left: -60,
    backgroundColor: glass.orb3,
    opacity: 0.35,
  },
});
