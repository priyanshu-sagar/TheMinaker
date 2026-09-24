'use client';

import { WS_NAMESPACES } from '@minaker/shared-types';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000';

/**
 * React hook to connect to a WebSocket namespace and subscribe to events.
 * Automatically reconnects and cleans up on unmount.
 *
 * @example
 * const socket = useSocket(WS_NAMESPACES.TRACKING);
 * useEffect(() => {
 *   socket?.on('bus:location_updated', (data) => setPosition(data));
 * }, [socket]);
 */
export function useSocket(namespace: string, token?: string): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${WS_URL}${namespace}`, {
      auth: token ? { token } : undefined,
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log(`[WS] Connected to ${namespace}`);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[WS] Disconnected from ${namespace}:`, reason);
    });

    socket.on('connect_error', (err) => {
      console.error(`[WS] Connection error on ${namespace}:`, err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace, token]);

  return socketRef.current;
}

/** Convenience: tracking namespace socket for parent bus location view */
export const useTrackingSocket = (token?: string) =>
  useSocket(WS_NAMESPACES.TRACKING, token);

/** Convenience: school namespace socket for admin attendance dashboard */
export const useSchoolSocket = (token?: string) =>
  useSocket(WS_NAMESPACES.SCHOOL, token);
