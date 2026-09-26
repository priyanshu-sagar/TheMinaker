import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing } from '@/design/theme';

/** Shared blurred search input, used across every glassmorphism portal. */
export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={35} tint="light" style={styles.blur}>
        <View style={styles.inner}>
          <Text style={styles.icon}>🔍</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    shadowColor: glass.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  blur: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: glass.cardBg, paddingHorizontal: spacing.md, minHeight: 44 },
  icon: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
});
