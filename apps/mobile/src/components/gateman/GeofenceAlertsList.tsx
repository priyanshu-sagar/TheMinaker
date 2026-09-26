import { FlatList, StyleSheet, Text } from 'react-native';
import { spacing, statusColors } from '@/design/gateman-theme';
import { ActionCard } from './ActionCard';
import { MiniMapSnippet } from './MiniMapSnippet';
import { GeofenceAlert, useGatemanStore } from '@/store/gateman.store';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function GeofenceAlertsList() {
  const alerts = useGatemanStore((state) => state.geofenceAlerts);
  const resolveGeofenceAlert = useGatemanStore((state) => state.resolveGeofenceAlert);

  if (alerts.length === 0) {
    return <Text style={styles.empty}>No geofence alerts. All marks are within range.</Text>;
  }

  return (
    <FlatList
      data={alerts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }: { item: GeofenceAlert }) => (
        <ActionCard
          title={`${item.studentName} marked ${item.distanceAwayM} m from the stop`}
          subtitle={`${item.conductorName} · ${formatTime(item.timestamp)} — outside the 500 m boarding radius`}
          tone="amber"
          primaryLabel="Verify"
          secondaryLabel="Deny"
          onPrimary={() => resolveGeofenceAlert(item.id)}
          onSecondary={() => resolveGeofenceAlert(item.id)}
        >
          <Text style={styles.mapCaption}>Green = actual stop (500 m) · Red = conductor's pinged location</Text>
          <MiniMapSnippet
            center={item.stopCoordinates}
            secondaryPin={{ ...item.pingedCoordinates, color: statusColors.offline }}
          />
        </ActionCard>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { padding: spacing.xl, textAlign: 'center', color: '#8a939e' },
  mapCaption: { fontSize: 12, fontWeight: '600', color: '#5b6572', marginTop: 4 },
});
