import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner } from '@/components/auth/Banner';
import { PrimaryButton } from '@/components/auth/Buttons';
import { FormField } from '@/components/auth/FormField';
import { AuthPanel, AuthScreen } from '@/components/auth/Screen';
import { portalAccents, spacing } from '@/design/tokens';
import { AuthMockError, setNewPassword, staffRequestPasswordResetOtp } from '@/auth/mock-auth-api';

/**
 * School admin reset uses the registered administrative email — this
 * portal manages the school's own account provisioning, so it does not
 * fall back to "contact the admin".
 */
export default function SchoolAdminForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSendCode() {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter your registered administrative email.');
      return;
    }
    setLoading(true);
    try {
      const result = await staffRequestPasswordResetOtp();
      setOtp(result.otp);
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
      router.replace('/(auth)/school-admin/login');
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Reset Password" subtitle="We'll email a code to your registered administrative address.">
      <AuthPanel>
        <View style={styles.formContent}>
          <FormField
            label="Administrative Email"
            value={email}
            onChangeText={setEmail}
            placeholder="admin@school.edu"
            keyboardType="email-address"
            editable={!otp}
          />
          {!otp ? (
            <PrimaryButton label="Send reset code" onPress={onSendCode} loading={loading} color={portalAccents.schoolAdmin.from} />
          ) : (
            <>
              <Banner tone="warning">{`Development OTP: ${otp}`}</Banner>
              <FormField label="6-digit code" value={enteredOtp} onChangeText={setEnteredOtp} placeholder="000000" keyboardType="number-pad" maxLength={6} />
              <FormField label="New Password" value={newPassword} onChangeText={setNewPasswordValue} placeholder="At least 8 characters" secureTextEntry />
              <FormField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" secureTextEntry />
              <PrimaryButton label="Update password" onPress={onReset} loading={loading} color={portalAccents.schoolAdmin.from} />
            </>
          )}
          {error ? <Banner tone="error">{error}</Banner> : null}
        </View>
      </AuthPanel>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  formContent: {},
});
