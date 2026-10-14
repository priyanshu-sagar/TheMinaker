import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Banner } from '@/components/auth/Banner';
import { LinkButton, PrimaryButton } from '@/components/auth/Buttons';
import { FormField } from '@/components/auth/FormField';
import { AuthScreen } from '@/components/auth/Screen';
import { SegmentedToggle } from '@/components/auth/SegmentedToggle';
import { GlassCard } from '@/components/glass/GlassCard';
import { shadows, spacing } from '@/design/tokens';
import { AuthMockError, parentRequestPasswordReset, setNewPassword } from '@/auth/mock-auth-api';

type Method = 'email' | 'phone';

export default function ParentForgotPasswordScreen() {
  const [method, setMethod] = useState<Method>('email');
  const [value, setValue] = useState('');
  const [otp, setOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRequestCode() {
    setError(null);
    if (!value.trim()) {
      setError('Enter your ' + (method === 'email' ? 'email' : 'phone number') + '.');
      return;
    }
    setLoading(true);
    try {
      const result = await parentRequestPasswordReset({ method, value: value.trim() });
      setOtp(result.otp);
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
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
      Alert.alert('Password updated', 'Please log in with your new password.');
      router.replace('/(auth)/parent/login');
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Reset Password" subtitle="We'll send a code to confirm it's you.">
      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          <SegmentedToggle
            value={method}
            onChange={(next) => {
              setMethod(next);
              setValue('');
              setOtp(null);
              setError(null);
            }}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
            ]}
          />
          <FormField
            label={method === 'email' ? 'Email' : 'Phone number'}
            value={value}
            onChangeText={setValue}
            placeholder={method === 'email' ? 'you@example.com' : '+91 98000 00000'}
            keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
            editable={!otp}
          />
          {!otp ? (
            <PrimaryButton label="Send Reset Code" onPress={onRequestCode} loading={loading} />
          ) : (
            <>
              <Banner tone="warning">{`Development OTP: ${otp}`}</Banner>
              <FormField
                label="6-digit code"
                value={enteredOtp}
                onChangeText={setEnteredOtp}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
              />
              <FormField label="New Password" value={newPassword} onChangeText={setNewPasswordValue} placeholder="At least 8 characters" secureTextEntry />
              <FormField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" secureTextEntry />
              <PrimaryButton label="Update Password" onPress={onReset} loading={loading} />
            </>
          )}
          {error ? <Banner tone="error">{error}</Banner> : null}
          <LinkButton label="Back to login" onPress={() => router.replace('/(auth)/parent/login')} />
        </View>
      </GlassCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  formContent: {},
});
