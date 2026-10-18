import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner } from './Banner';
import { LinkButton, PrimaryButton, SecondaryButton } from './Buttons';
import { FormField } from './FormField';
import { AuthScreen } from './Screen';
import { AuthPanel } from './Screen';
import { colors, spacing } from '@/design/tokens';
import { AuthMockError, setNewPassword, staffRequestPasswordResetOtp } from '@/auth/mock-auth-api';

type Mode = 'choose' | 'otp';

/**
 * Shared "forgot password" flow for teacher, gateman, and conductor:
 * either send a one-time code, or fall back to contacting the school admin.
 */
export function ProvisionedForgotPasswordScreen({ loginHref, color = colors.primary }: { loginHref: string; color?: string }) {
  const [mode, setMode] = useState<Mode>('choose');
  const [otp, setOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);

  async function onSendCode() {
    setError(null);
    setLoading(true);
    try {
      const result = await staffRequestPasswordResetOtp();
      setOtp(result.otp);
      setMode('otp');
    } finally {
      setLoading(false);
    }
  }

  async function onReset() {
    setError(null);
    if (enteredOtp.trim() !== otp) {
      setError('Incorrect code. Please try again.');
      return;
    }
    setLoading(true);
    try {
      await setNewPassword({ newPassword, confirmPassword });
      router.replace(loginHref as never);
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'otp') {
    return (
      <AuthScreen title="Reset Password" subtitle="Enter the code we sent and choose a new password.">
        <AuthPanel>
          <View style={styles.formContent}>
            <Banner tone="warning">{`Development OTP: ${otp}`}</Banner>
            <FormField label="6-digit code" value={enteredOtp} onChangeText={setEnteredOtp} placeholder="000000" keyboardType="number-pad" maxLength={6} />
            <FormField label="New Password" value={newPassword} onChangeText={setNewPasswordValue} placeholder="At least 8 characters" secureTextEntry />
            <FormField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" secureTextEntry />
            {error ? <Banner tone="error">{error}</Banner> : null}
            <PrimaryButton label="Update password" onPress={onReset} loading={loading} color={color} />
          </View>
        </AuthPanel>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Forgot Password" subtitle="Choose how you'd like to reset your password.">
      <AuthPanel>
        <View style={styles.formContent}>
          <PrimaryButton label="Send a reset code" onPress={onSendCode} loading={loading} color={color} />
          <SecondaryButton label="Contact your school admin instead" onPress={() => setShowContact(true)} />
          {showContact ? (
            <Banner tone="info">
              Please contact your school's admin office. They can reset your password and confirm your
              identity for you.
            </Banner>
          ) : null}
          <LinkButton label="Back to login" onPress={() => router.replace(loginHref as never)} />
        </View>
      </AuthPanel>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  formContent: {},
});
