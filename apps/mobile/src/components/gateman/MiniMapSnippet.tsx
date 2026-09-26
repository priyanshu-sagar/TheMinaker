import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, UrlTile } from 'react-native-maps';
import { radius, statusColors } from '@/design/gateman-theme';

type Pin = { lat: number; lng: number; color?: string };

/**
 * Small, non-interactive map used inside cards — a stop with a 500 m
 * geofence circle, and optionally a second pin (e.g. a conductor's pinged
 * location) for comparison.
 */
export function MiniMapSnippet({
  center,
  radiusMeters = 500,
  secondaryPin,
  height = 140,
}: {
  center: { lat: number; lng: number };
  radiusMeters?: number;
  secondaryPin?: Pin;
  height?: number;
}) {
  return (
    <View style={[styles.wrap, { height }]}>
      <MapView
        style={styles.map}
        provider={undefined}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents="none"
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        <Circle
          center={{ latitude: center.lat, longitude: center.lng }}
          radius={radiusMeters}
          strokeColor={statusColors.online}
          fillColor="rgba(16, 185, 129, 0.15)"
          strokeWidth={1.5}
        />
        <Marker coordinate={{ latitude: center.lat, longitude: center.lng }} pinColor={statusColors.online} />
        {secondaryPin ? (
          <Marker
            coordinate={{ latitude: secondaryPin.lat, longitude: secondaryPin.lng }}
            pinColor={secondaryPin.color ?? statusColors.offline}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: 'hidden' },
  map: { flex: 1 },
});
