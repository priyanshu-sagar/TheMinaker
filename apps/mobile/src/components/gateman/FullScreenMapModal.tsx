import { Modal, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '@/design/tokens';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FleetBus } from '@/store/gateman.store';

const REGION = { latitude: 27.95, longitude: 77.55, latitudeDelta: 3.1, longitudeDelta: 2.3 };

export function FullScreenMapModal({
  visible,
  fleet,
  onClose,
}: {
  visible: boolean;
  fleet: FleetBus[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Fleet — Full Map</Text>
          <AnimatedPressable style={[styles.closeBtn, shadows.sm]} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </AnimatedPressable>
        </View>
        <MapView style={styles.map} provider={undefined} initialRegion={REGION}>
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
          {fleet.map((bus) => (
            <Marker
              key={bus.id}
              coordinate={{ latitude: bus.coordinates.lat, longitude: bus.coordinates.lng }}
              title={bus.busNumber}
              description={`${bus.routeName} · ${bus.conductorName}`}
              pinColor={bus.status === 'Online' ? colors.online : colors.offline}
            />
          ))}
        </MapView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { ...typography.heading, color: colors.textPrimary },
  closeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  closeText: { ...typography.label, color: colors.textPrimary },
  map: { flex: 1 },
});
