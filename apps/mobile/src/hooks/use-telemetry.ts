import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as Paho from 'paho-mqtt';
import { useAuthStore } from '../store/auth.store';

export function useTelemetry(busId?: string, isActive: boolean = false) {
  const { accessToken, user } = useAuthStore();
  const mqttClient = useRef<Paho.Client | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isActive || !busId || !user?.tenantId) {
      stopTelemetry();
      return;
    }

    void startTelemetry(user.tenantId, busId, user.id);

    return () => {
      stopTelemetry();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, busId, user?.tenantId, user?.id]);

  const startTelemetry = async (tenantId: string, busId: string, conductorId: string) => {
    // 1. Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return;
    }

    // 2. Connect to Mosquitto over WebSockets (port 9001)
    // 10.0.2.2 = localhost for Android emulator; use server IP for physical devices
    const clientId = `conductor_${conductorId.slice(0, 8)}_${Math.random().toString(16).slice(2, 6)}`;
    mqttClient.current = new Paho.Client('10.0.2.2', 9001, '/mqtt', clientId);

    mqttClient.current.connect({
      onSuccess: async () => {
        console.log('MQTT connected — starting GPS watch');

        locationSub.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (loc) => {
            if (!mqttClient.current?.isConnected()) return;

            const payload = JSON.stringify({
              conductorId,
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              speedKmh: (loc.coords.speed ?? 0) * 3.6,
              heading: loc.coords.heading,
              accuracyM: loc.coords.accuracy,
              timestamp: new Date(loc.timestamp).toISOString(),
            });

            const message = new Paho.Message(payload);
            message.destinationName = `minaker/${tenantId}/bus/${busId}/location`;
            message.qos = 0;
            mqttClient.current?.send(message);
          }
        );
      },
      onFailure: (err: { errorMessage: string }) => {
        console.error('MQTT connection failed:', err.errorMessage);
      },
    });
  };

  const stopTelemetry = () => {
    locationSub.current?.remove();
    locationSub.current = null;

    if (mqttClient.current?.isConnected()) {
      mqttClient.current.disconnect();
    }
    mqttClient.current = null;
  };
}
