import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/api/client';
import {
  LoginMethod,
  LoginRequest,
  UserRole,
} from '@minaker/shared-types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ─── Role configuration ───────────────────────────────────────────────────────
const PORTALS: Array<{
  role: UserRole;
  label: string;
  emoji: string;
  loginMethod: LoginMethod;
  identifierLabel: string;
  identifierPlaceholder: string;
  credentialLabel: string;
  credentialPlaceholder: string;
  isOtp: boolean;
}> = [
  {
    role: UserRole.PARENT,
    label: 'Parent',
    emoji: '👨‍👩‍👧',
    loginMethod: LoginMethod.PARENT_ID_OTP,
    identifierLabel: 'Parent ID',
    identifierPlaceholder: 'e.g. DPS-P-00123',
    credentialLabel: 'OTP (sent to your phone)',
    credentialPlaceholder: '6-digit OTP',
    isOtp: true,
  },
  {
    role: UserRole.GATEKEEPER,
    label: 'Gatekeeper',
    emoji: '🚪',
    loginMethod: LoginMethod.EMPLOYEE_PIN,
    identifierLabel: 'Employee ID',
    identifierPlaceholder: 'Your staff employee ID',
    credentialLabel: 'PIN',
    credentialPlaceholder: '4–6 digit PIN',
    isOtp: false,
  },
  {
    role: UserRole.CONDUCTOR,
    label: 'Conductor',
    emoji: '🚌',
    loginMethod: LoginMethod.EMPLOYEE_PIN,
    identifierLabel: 'Employee ID',
    identifierPlaceholder: 'Your staff employee ID',
    credentialLabel: 'PIN',
    credentialPlaceholder: '4–6 digit PIN',
    isOtp: false,
  },
  {
    role: UserRole.SCHOOL_ADMIN,
    label: 'School Admin',
    emoji: '📋',
    loginMethod: LoginMethod.PHONE_OTP,
    identifierLabel: 'Phone Number',
    identifierPlaceholder: '+91 99999 99999',
    credentialLabel: 'OTP',
    credentialPlaceholder: '6-digit OTP',
    isOtp: true,
  },
];

export default function LoginScreen() {
  const [selectedPortal, setSelectedPortal] = useState<(typeof PORTALS)[0] | null>(null);
  const [tenantSlug, setTenantSlug] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { setAuth } = useAuthStore();

  const handleSendOtp = async () => {
    if (!selectedPortal || !tenantSlug.trim() || !identifier.trim()) {
      Alert.alert('Missing Info', 'Please enter your school and identifier first.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/send-otp', {
        tenantSlug: tenantSlug.trim().toLowerCase(),
        phone: selectedPortal.loginMethod === LoginMethod.PHONE_OTP ? identifier : undefined,
        parentUid: selectedPortal.loginMethod === LoginMethod.PARENT_ID_OTP ? identifier : undefined,
      });
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Check your registered phone for the OTP.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedPortal || !tenantSlug.trim() || !identifier.trim() || !credential.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const payload: LoginRequest = {
        role: selectedPortal.role,
        tenantSlug: tenantSlug.trim().toLowerCase(),
        identifier: identifier.trim(),
        credential: credential.trim(),
        loginMethod: selectedPortal.loginMethod,
      };
      const { accessToken, user } = await apiClient.login(payload);
      await setAuth(accessToken, user);

      // Navigate to the correct portal
      switch (user.role) {
        case UserRole.PARENT:
          router.replace('/(parent)');
          break;
        case UserRole.GATEKEEPER:
          router.replace('/(gatekeeper)');
          break;
        case UserRole.CONDUCTOR:
          router.replace('/(conductor)');
          break;
        case UserRole.SCHOOL_ADMIN:
        case UserRole.TEACHER:
          router.replace('/(school-admin)');
          break;
      }
    } catch (err: unknown) {
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 1: Role selector ──────────────────────────────────────────────────
  if (!selectedPortal) {
    return (
      <View style={styles.container as any}>
        <View style={styles.header as any}>
          <Text style={styles.appName as any}>🚌 TheMinaker</Text>
          <Text style={styles.subtitle as any}>Select your portal to continue</Text>
        </View>
        <View style={styles.portalGrid as any}>
          {PORTALS.map((portal) => (
            <Pressable
              key={portal.role}
              style={styles.portalCard as any}
              onPress={() => setSelectedPortal(portal)}
            >
              <Text style={styles.portalEmoji as any}>{portal.emoji}</Text>
              <Text style={styles.portalLabel as any}>{portal.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // ─── Step 2: Credential form ────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.formContainer as any}>
        <Pressable onPress={() => { setSelectedPortal(null); setOtpSent(false); }}>
          <Text style={styles.back as any}>← Back</Text>
        </Pressable>

        <Text style={styles.portalTitle as any}>
          {selectedPortal.emoji} {selectedPortal.label} Login
        </Text>

        {/* School Slug */}
        <Text style={styles.label as any}>School Code</Text>
        <TextInput
          style={styles.input as any}
          placeholder="e.g. dps-noida"
          value={tenantSlug}
          onChangeText={setTenantSlug}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Identifier */}
        <Text style={styles.label as any}>{selectedPortal.identifierLabel}</Text>
        <TextInput
          style={styles.input as any}
          placeholder={selectedPortal.identifierPlaceholder}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType={
            selectedPortal.loginMethod === LoginMethod.PHONE_OTP
              ? 'phone-pad'
              : 'default'
          }
        />

        {/* OTP send button (only for OTP-based roles) */}
        {selectedPortal.isOtp && !otpSent && (
          <Pressable
            style={[styles.button, styles.secondaryButton] as any}
            onPress={handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText as any}>
              {loading ? 'Sending…' : 'Send OTP'}
            </Text>
          </Pressable>
        )}

        {/* Credential (OTP or PIN) */}
        {(!selectedPortal.isOtp || otpSent) && (
          <>
            <Text style={styles.label as any}>{selectedPortal.credentialLabel}</Text>
            <TextInput
              style={styles.input as any}
              placeholder={selectedPortal.credentialPlaceholder}
              value={credential}
              onChangeText={setCredential}
              secureTextEntry={!selectedPortal.isOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled] as any}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText as any}>Login</Text>
              }
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  portalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  portalCard: {
    width: '44%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  portalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  portalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    paddingTop: 60,
  },
  back: {
    fontSize: 16,
    color: '#1a73e8',
    marginBottom: 24,
  },
  portalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1a73e8',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
});
