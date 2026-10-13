import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { glass, colors, radius, spacing, palette, portalAccents, shadows, typography } from '@/design/tokens';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { MaterialType } from '@/store/teacher.store';

const TYPES: MaterialType[] = ['PDF', 'Note', 'Link', 'Image'];

export function UploadMaterialModal({
  visible,
  onClose,
  onUpload,
}: {
  visible: boolean;
  onClose: () => void;
  onUpload: (input: { title: string; type: MaterialType }) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('PDF');

  function handleClose() {
    setTitle('');
    setType('PDF');
    onClose();
  }

  function handleUpload() {
    if (!title.trim()) return;
    onUpload({ title: title.trim(), type });
    handleClose();
  }

  return (
    <GlassModal visible={visible} title="Upload Material" onClose={handleClose}>
      <Text style={styles.hint}>This is a mock upload. The file is stored locally until the API is connected.</Text>
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Chapter 5 worksheet"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {TYPES.map((option) => {
          const active = option === type;
          return (
            <AnimatedPressable
              key={option}
              haptic="selection"
              onPress={() => setType(option)}
              style={[styles.typeChip, active ? styles.typeChipActive : null]}
            >
              <Text style={[styles.typeText, active ? styles.typeTextActive : null]}>{option}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
      <AnimatedPressable haptic="medium" onPress={handleUpload} disabled={!title.trim()} style={[styles.uploadBtn, shadows.sm, !title.trim() ? styles.disabled : null]}>
        <Text style={styles.uploadText}>Add to Class</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
  label: { ...typography.overline, color: colors.textMuted },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { borderRadius: radius.full, borderWidth: 1.5, borderColor: glass.border, paddingHorizontal: 14, paddingVertical: 8 },
  typeChipActive: { backgroundColor: portalAccents.teacher.from, borderColor: portalAccents.teacher.from },
  typeText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  typeTextActive: { color: palette.white },
  uploadBtn: { minHeight: 46, borderRadius: radius.md, backgroundColor: portalAccents.teacher.from, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  uploadText: { color: palette.white, fontSize: 15, fontWeight: '700' },
});
