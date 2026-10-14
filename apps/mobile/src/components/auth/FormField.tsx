import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { colors, radius, spacing, typography } from '@/design/tokens';

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  error,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  maxLength?: number;
  error?: string | null;
  editable?: boolean;
}) {
  const box = useRef<View>(null);

  return (
    <View style={styles.field} collapsable={false}>
      <Text style={styles.label}>{label}</Text>
      <View
        ref={box}
        collapsable={false}
        style={[styles.inputContainer, error ? styles.inputError : null, !editable ? styles.inputDisabled : null]}
      >
        <AppTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => {
            box.current?.setNativeProps({ style: { borderColor: colors.primary } });
          }}
          onBlur={() => {
            box.current?.setNativeProps({
              style: { borderColor: error ? colors.error : colors.borderStrong },
            });
          }}
          style={styles.input}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    backgroundColor: 'transparent',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
  },
  input: {
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.01)',
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 2,
  },
});
