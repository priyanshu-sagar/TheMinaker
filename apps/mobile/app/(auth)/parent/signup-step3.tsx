import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner } from '@/components/auth/Banner';
import { LinkButton, PrimaryButton } from '@/components/auth/Buttons';
import { FormField } from '@/components/auth/FormField';
import { ProgressDots } from '@/components/auth/ProgressDots';
import { AuthScreen } from '@/components/auth/Screen';
import { StepHeader } from '@/components/auth/StepHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { shadows, spacing } from '@/design/tokens';
import { useAuthFlowStore } from '@/auth/auth-flow.store';
import { AuthMockError, sendEmailOtp, verifyEmailOtp } from '@/auth/mock-auth-api';
import { saveMockSession } from '@/auth/session';

export default function ParentSignupStep3() {
  const draft = useAuthFlowStore((state) => state.parentDraft);
  const signupOtp = useAuthFlowStore((state) => state.signupOtp);
  const setSignupOtp = useAuthFlowStore((state) => state.setSignupOtp);
  const resetParentDraft = useAuthFlowStore((state) => state.resetParentDraft);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onVerify() {
    if (!signupOtp) return;
    setError(null);
    setLoading(true);
    try {
      await verifyEmailOtp({ enteredOtp, expectedOtp: signupOtp });
      await saveMockSession({ role: UserRole.PARENT, fullName: draft.fullName, email: draft.email });
      resetParentDraft();
      router.replace('/(parent)' as never);
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError(null);
    const { otp } = await sendEmailOtp(draft.email);
    setSignupOtp(otp);
    setInfo('A new code has been sent.');
  }

  return (
    <AuthScreen title="Verify Your Email" subtitle={`Step 3 — enter the code sent to ${draft.email || 'your email'}`}>
      <View style={styles.stepProgressRow}>
        <StepHeader step={3} total={3} />
        <ProgressDots count={3} activeIndex={2} />
      </View>

      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          {signupOtp ? <Banner tone="warning">{`Development OTP: ${signupOtp}`}</Banner> : null}
          <FormField
            label="6-digit code"
            value={enteredOtp}
            onChangeText={setEnteredOtp}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
          />
          {info ? <Banner tone="info">{info}</Banner> : null}
          {error ? <Banner tone="error">{error}</Banner> : null}
          <PrimaryButton label="Verify & Create Account" onPress={onVerify} loading={loading} />
          <LinkButton label="Resend code" onPress={onResend} />
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
