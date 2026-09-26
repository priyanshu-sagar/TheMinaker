import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/design/theme';

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
  return (
    <View style={styles.field}>
      <Text style={typography.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={editable}
        style={[styles.input, error ? styles.inputError : null, !editable ? styles.inputDisabled : null]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  inputDisabled: { backgroundColor: '#eef1f4', color: colors.textMuted },
  errorText: { color: colors.danger, fontSize: 13 },
});
