import { Pressable, StyleSheet, Text } from 'react-native';
import { glass } from '@/design/glass-theme';

/** Shared floating action button — bottom-right, glass shadow, single glyph or short label. */
export function Fab({ label, onPress, color = '#1a4f8b' }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable style={[styles.fab, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    minWidth: 56,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: glass.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  label: { color: '#fff', fontSize: 22, fontWeight: '700' },
});
