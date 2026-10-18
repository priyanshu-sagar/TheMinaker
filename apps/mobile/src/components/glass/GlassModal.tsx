import { ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, palette, radius, spacing } from '@/design/tokens';
import { glass } from '@/design/tokens';

/** Shared full-width bottom-sheet glass modal, used across every portal. */
export function GlassModal({
  visible,
  title,
  onClose,
  maxHeight = '85%',
  fill = false,
  scroll = true,
  onBack,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  maxHeight?: `${number}%`;
  /** Lock the sheet to maxHeight instead of shrinking to its content. */
  fill?: boolean;
  /** Turn off when the sheet body is a virtualized list. */
  scroll?: boolean;
  /** iOS-style back. Defaults to closing the sheet. */
  onBack?: () => void;
  children: ReactNode;
}) {
  const sheet = (
    <View style={[styles.sheet, fill ? styles.sheetFill : null]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack ?? onClose} hitSlop={8}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      {scroll ? (
        <ScrollView
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          removeClippedSubviews={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fillBody}>{children}</View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={[styles.sheetShadow, { maxHeight }, fill ? { height: maxHeight } : null]}>
          {Platform.OS === 'android' ? (
            <View style={[styles.sheetBlur, fill ? styles.sheetFill : null]}>{sheet}</View>
          ) : (
            <BlurView intensity={50} tint="light" style={[styles.sheetBlur, fill ? styles.sheetFill : null]}>
              {sheet}
            </BlurView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.72)' },
  sheetShadow: {
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    shadowColor: glass.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 0,
    boxShadow: '0px -8px 28px rgba(15, 23, 42, 0.18)',
    maxHeight: '85%',
  },
  sheetBlur: {
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
  },
  sheet: { backgroundColor: palette.offWhite, maxHeight: '100%' },
  sheetFill: { flex: 1 },
  fillBody: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  backBtn: { minWidth: 64, minHeight: 32, justifyContent: 'center' },
  backText: { fontSize: 16, fontWeight: '600', color: colors.info },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 15, color: colors.textSecondary, fontWeight: '700' },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
