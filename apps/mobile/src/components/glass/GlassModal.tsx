import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '@/design/theme';
import { glass } from '@/design/glass-theme';

/** Shared full-width bottom-sheet glass modal, used across every portal. */
export function GlassModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.sheetShadow}>
          <BlurView intensity={50} tint="light" style={styles.sheetBlur}>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheetShadow: {
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    shadowColor: glass.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
    maxHeight: '85%',
  },
  sheetBlur: {
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
  },
  sheet: { backgroundColor: glass.cardBgStrong, maxHeight: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 15, color: colors.textSecondary, fontWeight: '700' },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
});
