import { StyleSheet, Text, View } from 'react-native';

/**
 * Parent Live Tracking Screen
 *
 * Shows the real-time position of the child's school bus on a map.
 * Connects to the /tracking WebSocket namespace.
 * MapView + real-time updates implemented in feat(tracking) commit.
 */
export default function ParentTrackingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapText}>Live map coming soon</Text>
        <Text style={styles.mapHint}>
          Real-time bus tracking via WebSocket will be shown here
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Bus Status</Text>
        <Text style={styles.infoValue}>—</Text>
        <Text style={styles.infoSub}>No active trip for your child's route</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f2fe',
    margin: 16,
    borderRadius: 16,
  },
  mapEmoji: { fontSize: 60, marginBottom: 16 },
  mapText: { fontSize: 18, fontWeight: '700', color: '#0369a1' },
  mapHint: { fontSize: 13, color: '#0284c7', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  infoTitle: { fontSize: 13, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { fontSize: 28, fontWeight: '700', color: '#111827', marginVertical: 4 },
  infoSub: { fontSize: 13, color: '#9ca3af' },
});
