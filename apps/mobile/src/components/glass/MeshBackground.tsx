import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { meshLayers, glass, radius } from '@/design/tokens';

export function MeshBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.fill}>
      <LinearGradient colors={meshLayers[0].colors} start={meshLayers[0].start} end={meshLayers[0].end} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={meshLayers[1].colors} start={meshLayers[1].start} end={meshLayers[1].end} style={StyleSheet.absoluteFill} />
      {/* Decorative floating orbs */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb3]} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  orb: { position: 'absolute', borderRadius: radius.full },
  orb1: { width: 280, height: 280, top: -80, right: -100, backgroundColor: glass.orb1 },
  orb2: { width: 220, height: 220, top: 200, left: -120, backgroundColor: glass.orb2 },
  orb3: { width: 180, height: 180, bottom: 80, right: -60, backgroundColor: glass.orb3 },
});
