import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner } from '@/components/auth/Banner';
import { PrimaryButton } from '@/components/auth/Buttons';
import { FormField } from '@/components/auth/FormField';
import { ProgressDots } from '@/components/auth/ProgressDots';
import { AuthScreen } from '@/components/auth/Screen';
import { StepHeader } from '@/components/auth/StepHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { shadows, spacing } from '@/design/tokens';
import { useAuthFlowStore } from '@/auth/auth-flow.store';

export default function ParentSignupStep1() {
  const draft = useAuthFlowStore((state) => state.parentDraft);
  const setParentDraft = useAuthFlowStore((state) => state.setParentDraft);
  const [error, setError] = useState<string | null>(null);

  function onContinue() {
    const fullName = draft.fullName.trim();
    const email = draft.email.trim();
    if (!fullName) return setError('Enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    if (draft.password.length < 8) return setError('Password must be at least 8 characters.');
    if (draft.password !== draft.confirmPassword) return setError('Password and confirm password must match.');
    setError(null);
    router.push('/(auth)/parent/signup-step2');
  }

  return (
    <AuthScreen title="Create Your Account" subtitle="Step 1 — your details">
      <View style={styles.stepProgressRow}>
        <StepHeader step={1} total={3} />
        <ProgressDots count={3} activeIndex={0} />
      </View>

      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          <FormField
            label="Full Name"
            value={draft.fullName}
            onChangeText={(fullName) => setParentDraft({ fullName })}
            placeholder="Your full name"
            autoCapitalize="words"
          />
          <FormField
            label="Email"
            value={draft.email}
            onChangeText={(email) => setParentDraft({ email })}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <FormField
            label="Password"
            value={draft.password}
            onChangeText={(password) => setParentDraft({ password })}
            placeholder="At least 8 characters"
            secureTextEntry
          />
          <FormField
            label="Confirm Password"
            value={draft.confirmPassword}
            onChangeText={(confirmPassword) => setParentDraft({ confirmPassword })}
            placeholder="Re-enter your password"
            secureTextEntry
          />
          {error ? <Banner tone="error">{error}</Banner> : null}
          <PrimaryButton label="Continue" onPress={onContinue} />
        </View>
      </GlassCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  formContent: {},
});
