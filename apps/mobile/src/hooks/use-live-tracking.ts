import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { LocationPayload } from '../api/client'; // Reuse if possible or define inline

export function useLiveTracking() {
  const { token, user } = useAuthStore();
  const [buses, setBuses] = useState<Record<string, { lat: number; lng: number }>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !user?.tenantId) return;

    // Connect to NestJS WebSocket gateway (TrackingGateway)
    // Adjust IP for Android emulator testing
    socketRef.current = io('http://10.0.2.2:3000', {
      auth: { token }, // Can use auth or query
      query: { token }, 
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to live tracking gateway');
    });

    socketRef.current.on('bus_location_update', (data: { busId: string; lat: number; lng: number }) => {
      setBuses((prev) => ({
        ...prev,
        [data.busId]: { lat: data.lat, lng: data.lng },
      }));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, user?.tenantId]);

  return { buses };
}
