import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';

const PLACES = [
  { name: 'Lokhandwala Circle', lat: 19.1307, lng: 72.8296 },
  { name: 'Infinity Mall, Andheri', lat: 19.1365, lng: 72.8290 },
  { name: 'Khar Telephone Exchange', lat: 19.0688, lng: 72.8400 },
  { name: 'Juhu Beach Gate', lat: 19.0988, lng: 72.8265 },
];

export interface StopDraft {
  lat: number;
  lng: number;
  flat: string;
  area: string;
  landmark: string;
}

/** Bottom sheet map. The pin stays fixed while the parent pans the map underneath. */
export function StopMapModal({
  visible,
  currentStop,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  currentStop: string;
  onClose: () => void;
  onConfirm: (draft: StopDraft) => void;
}) {
  const [query, setQuery] = useState('');
  const [center, setCenter] = useState({ lat: 19.119, lng: 72.846 });
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');

  const matches = useMemo(
    () => PLACES.filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const ready = flat.trim().length > 0 && area.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>New boarding point</Text>
          <Text style={styles.current}>Current stop: {currentStop}</Text>
          <AppTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search location"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.search}
          />
          {query.trim() && matches.length > 0 ? (
            <View>
              {matches.map((place) => (
                <AnimatedPressable
                  key={place.name}
                  haptic="selection"
                  onPress={() => {
                    setCenter({ lat: place.lat, lng: place.lng });
                    setArea(place.name);
                    setQuery('');
                  }}
                  style={styles.place}
                >
                  <Text style={styles.placeText}>{place.name}</Text>
                </AnimatedPressable>
              ))}
            </View>
          ) : null}
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              provider={undefined}
              region={{ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
              onRegionChangeComplete={(region) => setCenter({ lat: region.latitude, lng: region.longitude })}
            >
              <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
            </MapView>
            <View pointerEvents="none" style={styles.pin}>
              <MapPin color={portalAccents.parent.from} size={32} />
            </View>
          </View>
          <Text style={styles.coords}>Requested pin {center.lat.toFixed(5)}, {center.lng.toFixed(5)}</Text>
          <AppTextInput value={flat} onChangeText={setFlat} placeholder="Flat / house no." placeholderTextColor={colors.textPlaceholder} style={styles.field} />
          <AppTextInput value={area} onChangeText={setArea} placeholder="Area / sector" placeholderTextColor={colors.textPlaceholder} style={styles.field} />
          <AppTextInput value={landmark} onChangeText={setLandmark} placeholder="Landmark" placeholderTextColor={colors.textPlaceholder} style={styles.field} />
          <AnimatedPressable
            haptic="medium"
            disabled={!ready}
            onPress={() => onConfirm({ lat: center.lat, lng: center.lng, flat: flat.trim(), area: area.trim(), landmark: landmark.trim() })}
            style={[styles.confirm, !ready ? styles.disabled : null]}
          >
            <Text style={styles.confirmText}>Confirm location</Text>
          </AnimatedPressable>
          <AnimatedPressable haptic="light" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.72)' },
  sheet: {
    height: '72%',
    backgroundColor: palette.offWhite,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  title: { ...typography.heading },
  current: { ...typography.caption, marginBottom: spacing.sm },
  search: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  place: { paddingVertical: spacing.xs },
  placeText: { ...typography.body },
  mapWrap: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.sm },
  map: { flex: 1 },
  pin: { position: 'absolute', top: '46%', left: '46%' },
  coords: { ...typography.caption, marginBottom: spacing.xs },
  field: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  confirm: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
  cancel: { minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.bodyBold, color: portalAccents.parent.from, backgroundColor: 'transparent' },
});
