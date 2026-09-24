import { useAuthStore } from '@/store/auth.store';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useTelemetry } from '@/hooks/use-telemetry';

/**
 * Conductor Trip Dashboard
 *
 * - Shows current trip status (pending / active / completed)
 * - Start Trip / End Trip buttons
 * - GPS tracking starts automatically in background when trip is active
 * - Battery % and GPS accuracy indicators
 */
export default function ConductorTripScreen() {
  const { user } = useAuthStore();
  
  // Minimal placeholder state for now — in reality, this comes from GET /fleet/trips/my-active
  const [isActive, setIsActive] = useState(false);
  // Fake bus ID for local testing/demo
  const demoBusId = "00000000-0000-0000-0000-000000000000"; 
  
  useTelemetry(demoBusId, isActive);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.greeting}>Good morning, {user?.fullName?.split(' ')[0]} 👋</Text>
        <Text style={styles.busInfo}>Bus: — · Route: —</Text>
      </View>

      <View style={styles.tripCard}>
        <Text style={styles.tripStatus}>{isActive ? "🟢 Trip Active" : "⏳ No active trip"}</Text>
        <Text style={styles.tripHint}>{isActive ? "GPS is broadcasting in the background" : "Press Start Trip when you begin your route"}</Text>

        <Pressable 
          style={[styles.startBtn, isActive && { backgroundColor: '#ef4444' }]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.startBtnText}>{isActive ? "🛑 End Trip" : "🚌 Start Trip"}</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Students" value="0" emoji="👥" />
        <StatCard label="GPS" value="—" emoji="📍" />
        <StatCard label="Battery" value="—%" emoji="🔋" />
      </View>

      <Text style={styles.hint}>
        📡 GPS tracking will publish your location automatically once the trip starts.
      </Text>
    </View>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  card: {
    backgroundColor: '#1a73e8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  busInfo: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tripStatus: { fontSize: 22, fontWeight: '700', color: '#374151', marginBottom: 8 },
  tripHint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  startBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowOpacity: 0.04,
    elevation: 1,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  hint: { marginTop: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 },
});
