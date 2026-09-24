import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLiveTracking } from '@/hooks/use-live-tracking';

/**
 * Parent Live Tracking Screen
 * Shows the real-time position of the child's school bus on a map.
 */
export default function ParentTrackingScreen() {
  const { buses } = useLiveTracking();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.0760, // Mumbai default
          longitude: 72.8777,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {Object.entries(buses).map(([busId, coords]) => (
          <Marker
            key={busId}
            coordinate={{ latitude: coords.lat, longitude: coords.lng }}
            title="School Bus"
            description="Live Location"
          >
            <Text style={{ fontSize: 30 }}>🚌</Text>
          </Marker>
        ))}
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Bus Status</Text>
        <Text style={styles.infoValue}>
          {Object.keys(buses).length > 0 ? '🟢 On Route' : '⏳ No active trip'}
        </Text>
        <Text style={styles.infoSub}>Live tracking updates automatically</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  map: {
    flex: 1,
  },
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
