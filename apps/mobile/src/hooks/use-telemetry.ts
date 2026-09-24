import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import Paho from 'paho-mqtt';
import { useAuthStore } from '../store/auth.store';

export function useTelemetry(busId?: string, isActive: boolean = false) {
  const { user, token } = useAuthStore();
  const mqttClient = useRef<Paho.Client | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isActive || !busId || !user?.tenantId) {
      stopTelemetry();
      return;
    }

    startTelemetry(user.tenantId, busId, user.id);

    return () => {
      stopTelemetry();
    };
  }, [isActive, busId, user?.tenantId, user?.id]);

  const startTelemetry = async (tenantId: string, busId: string, conductorId: string) => {
    // 1. Request Permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return;
    }

    // 2. Connect to MQTT via WebSockets (Mosquitto port 9001)
    // Adjust host for production vs emulator (10.0.2.2 for Android emulator)
    const host = '10.0.2.2'; 
    const clientId = `conductor_${conductorId}_${Math.random().toString(16).slice(2, 8)}`;
    
    mqttClient.current = new Paho.Client(host, 9001, '/mqtt', clientId);

    mqttClient.current.connect({
      onSuccess: async () => {
        console.log('Connected to MQTT Broker (WebSockets)');

        // 3. Start GPS tracking
        locationSub.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (loc) => {
            if (!mqttClient.current?.isConnected()) return;

            const payload = {
              conductorId,
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              speedKmh: (loc.coords.speed || 0) * 3.6,
              heading: loc.coords.heading,
              accuracyM: loc.coords.accuracy,
              timestamp: new Date(loc.timestamp).toISOString(),
            };

            const message = new Paho.Message(JSON.stringify(payload));
            message.destinationName = `minaker/${tenantId}/bus/${busId}/location`;
            message.qos = 0;
            
            mqttClient.current.send(message);
          }
        );
      },
      onFailure: (err) => {
        console.error('MQTT Connection failed:', err);
      },
    });
  };

  const stopTelemetry = () => {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
    if (mqttClient.current && mqttClient.current.isConnected()) {
      mqttClient.current.disconnect();
      console.log('MQTT Disconnected');
    }
    mqttClient.current = null;
  };
}
