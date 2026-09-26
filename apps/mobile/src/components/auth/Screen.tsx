import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/design/theme';
import { BackRow } from './BackRow';

export function AuthScreen({
  title,
  subtitle,
  showBack = true,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {showBack ? <BackRow /> : null}
          <Text style={typography.title}>{title}</Text>
          {subtitle ? <Text style={[typography.subtitle, styles.subtitle]}>{subtitle}</Text> : null}
          <View style={styles.body}>{children}</View>
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxl },
  subtitle: { marginTop: spacing.xs },
  body: { marginTop: spacing.xl, gap: spacing.md },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
