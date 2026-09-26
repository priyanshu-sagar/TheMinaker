import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { meshLayers } from '@/design/glass-theme';

/**
 * Static, softly-angled layered gradients standing in for an animated mesh
 * gradient (allowed by the spec as a fallback). Two overlapping gradients
 * at different angles give a subtle, next-gen SaaS background without a
 * shader dependency. Shared by every glassmorphism portal, not just one.
 */
export function MeshBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={meshLayers[0].colors}
        start={meshLayers[0].start}
        end={meshLayers[0].end}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={meshLayers[1].colors}
        start={meshLayers[1].start}
        end={meshLayers[1].end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
