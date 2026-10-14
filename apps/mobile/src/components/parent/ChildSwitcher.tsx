import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useParentStore } from '@/store/parent.store';

/** Horizontal story-style avatars. The active child wears a gradient ring. */
export function ChildSwitcher() {
  const children = useParentStore((state) => state.children);
  const activeChildId = useParentStore((state) => state.activeChildId);
  const setActiveChildId = useParentStore((state) => state.setActiveChildId);
  const addChild = useParentStore((state) => state.addChild);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  function closeAdd() {
    setName('');
    setGrade('');
    setAdding(false);
  }

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {children.map((child) => {
          const active = child.id === activeChildId;
          const initial = child.name.charAt(0);
          const face = (
            <View style={[styles.face, !active ? styles.faceDim : null]}>
              <Text style={styles.initial}>{initial}</Text>
            </View>
          );
          return (
            <AnimatedPressable key={child.id} haptic="selection" onPress={() => setActiveChildId(child.id)} style={styles.item}>
              {active ? (
                <LinearGradient colors={[portalAccents.parent.from, portalAccents.parent.to]} style={styles.ring}>
                  {face}
                </LinearGradient>
              ) : (
                face
              )}
              <Text style={[styles.label, active ? styles.labelOn : null]} numberOfLines={1}>
                {child.name.split(' ')[0]}
              </Text>
            </AnimatedPressable>
          );
        })}
        <AnimatedPressable haptic="medium" onPress={() => setAdding(true)} style={styles.item}>
          <View style={styles.add}>
            <Plus color={portalAccents.parent.from} size={22} />
          </View>
          <Text style={styles.label}>Add</Text>
        </AnimatedPressable>
      </ScrollView>

      <GlassModal visible={adding} title="Add a child" onClose={closeAdd}>
        <Text style={styles.fieldLabel}>Child name</Text>
        <AppTextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.textPlaceholder} style={styles.input} />
        <Text style={styles.fieldLabel}>Class</Text>
        <AppTextInput value={grade} onChangeText={setGrade} placeholder="e.g. Class 4-C" placeholderTextColor={colors.textPlaceholder} style={styles.input} />
        <AnimatedPressable
          haptic="medium"
          disabled={!name.trim() || !grade.trim()}
          onPress={() => {
            addChild({ name, grade });
            closeAdd();
          }}
          style={[styles.submit, !name.trim() || !grade.trim() ? styles.disabled : null]}
        >
          <Text style={styles.submitText}>Submit for verification</Text>
        </AnimatedPressable>
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.sm },
  row: { paddingHorizontal: spacing.lg, gap: spacing.md, alignItems: 'flex-start' },
  item: { width: 72, alignItems: 'center' },
  ring: { width: 68, height: 68, borderRadius: 34, padding: 3, alignItems: 'center', justifyContent: 'center' },
  face: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceDim: { opacity: 0.45 },
  initial: { ...typography.heading, color: palette.white, backgroundColor: 'transparent' },
  add: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.caption, marginTop: 6, textAlign: 'center' },
  labelOn: { color: colors.textPrimary, fontWeight: '700' },
  fieldLabel: { ...typography.overline, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
  },
  submit: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.45 },
  submitText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
