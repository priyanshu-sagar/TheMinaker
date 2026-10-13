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
import { sendEmailOtp } from '@/auth/mock-auth-api';

export default function ParentSignupStep2() {
  const draft = useAuthFlowStore((state) => state.parentDraft);
  const setParentDraft = useAuthFlowStore((state) => state.setParentDraft);
  const setSignupOtp = useAuthFlowStore((state) => state.setSignupOtp);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onContinue() {
    if (!draft.studentName.trim()) return setError('Enter the student\'s name.');
    if (!draft.rollNumber.trim()) return setError('Enter the admission or roll number.');
    if (!draft.schoolCode.trim()) return setError('Enter the school code.');
    if (!draft.grade.trim()) return setError('Enter the grade or section.');
    setError(null);
    setLoading(true);
    try {
      const { otp } = await sendEmailOtp(draft.email);
      setSignupOtp(otp);
      router.push('/(auth)/parent/signup-step3');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Student Details" subtitle="Step 2 — tell us about your child">
      <View style={styles.stepProgressRow}>
        <StepHeader step={2} total={3} />
        <ProgressDots count={3} activeIndex={1} />
      </View>

      <GlassCard style={shadows.lg}>
        <View style={styles.formContent}>
          <FormField
            label="Student Name"
            value={draft.studentName}
            onChangeText={(studentName) => setParentDraft({ studentName })}
            placeholder="Student's full name"
            autoCapitalize="words"
          />
          <FormField
            label="Admission / Roll Number"
            value={draft.rollNumber}
            onChangeText={(rollNumber) => setParentDraft({ rollNumber })}
            placeholder="e.g. 2024-0042"
          />
          <FormField
            label="School Code"
            value={draft.schoolCode}
            onChangeText={(schoolCode) => setParentDraft({ schoolCode })}
            placeholder="e.g. DPS-NORTH"
            autoCapitalize="words"
          />
          <FormField
            label="Grade / Section"
            value={draft.grade}
            onChangeText={(grade) => setParentDraft({ grade })}
            placeholder="e.g. 6-B"
            autoCapitalize="words"
          />
          {error ? <Banner tone="error">{error}</Banner> : null}
          <PrimaryButton label="Continue" onPress={onContinue} loading={loading} />
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
  formContent: {
    gap: spacing.md,
  },
});
