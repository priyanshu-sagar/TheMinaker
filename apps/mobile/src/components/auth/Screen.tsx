import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { colors, palette, radius, spacing, typography } from '@/design/tokens';
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
              <View style={styles.headerCard}>
                <View style={styles.headerInner}>
                  {headerIcon ? <View style={styles.headerIconWrap}>{headerIcon}</View> : null}
                  {headerContent}
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
              </View>
            ) : null}

            <View style={styles.body}>{children}</View>
          </ScrollView>

          {footer ? <View style={styles.footerInner}>{footer}</View> : null}
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
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
  footerInner: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: palette.offWhite,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
  },
  panel: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
  },
});

export function AuthPanel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}
