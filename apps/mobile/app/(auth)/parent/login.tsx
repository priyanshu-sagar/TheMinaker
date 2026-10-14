import { UserRole } from '@minaker/shared-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Banner } from '@/components/auth/Banner';
import { LinkButton, PrimaryButton } from '@/components/auth/Buttons';
import { FormField } from '@/components/auth/FormField';
import { AuthScreen } from '@/components/auth/Screen';
import { SegmentedToggle } from '@/components/auth/SegmentedToggle';
import { GlassCard } from '@/components/glass/GlassCard';
import { portalAccents, radius, shadows, spacing } from '@/design/tokens';
import { AuthMockError, parentLogin } from '@/auth/mock-auth-api';
import { saveMockSession } from '@/auth/session';

type Method = 'email' | 'phone';

export default function ParentLoginScreen() {
  const [method, setMethod] = useState<Method>('email');
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accent = portalAccents.parent;

  async function onLogin() {
    setError(null);
    if (!value.trim() || !password.trim()) {
      setError('Enter your ' + (method === 'email' ? 'email' : 'phone number') + ' and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await parentLogin({ method, value: value.trim(), password });
      await saveMockSession({
        role: UserRole.PARENT,
        fullName: result.fullName,
        email: method === 'email' ? value.trim() : undefined,
        phone: method === 'phone' ? value.trim() : undefined,
      });
      router.replace('/(auth)/signed-in');
    } catch (err) {
      setError(err instanceof AuthMockError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Parent Login"
      subtitle="Sign in to track your child's bus and attendance."
      headerIcon={
        <LinearGradient
          colors={[accent.from, accent.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Text style={styles.iconEmoji}>{accent.icon}</Text>
        </LinearGradient>
      }
      footer={<LinkButton label="New here? Create an account" onPress={() => router.push('/(auth)/parent/signup-step1')} />}
    >
      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          <SegmentedToggle
            value={method}
            onChange={(next) => {
              setMethod(next);
              setValue('');
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
          />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          {error ? <Banner tone="error">{error}</Banner> : null}
          <PrimaryButton label="Log In" onPress={onLogin} loading={loading} />
          <LinkButton label="Forgot password?" onPress={() => router.push('/(auth)/parent/forgot-password')} />
        </View>
      </GlassCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  formContent: {
    marginBottom: spacing.sm,
  },
});
