import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

interface BusPosition {
  lat: number;
  lng: number;
}

export function useLiveTracking() {
  const { accessToken, user } = useAuthStore();
  const [buses, setBuses] = useState<Record<string, BusPosition>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !user?.tenantId) return;

    // Connect to NestJS TrackingGateway (Socket.io)
    // 10.0.2.2 = localhost from Android emulator; change to server IP for physical devices
    socketRef.current = io('http://10.0.2.2:3000', {
      auth: { token: accessToken },
      query: { token: accessToken },
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
  }, [accessToken, user?.tenantId]);

  return { buses };
}
