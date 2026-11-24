import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/client.js';

// A live connection to the API for news: new orders for the kitchen, status changes for a
// customer. auth: { token } (kitchen, owner login) or { deviceId } (customer phone); null keeps it
// closed. handlers: { onConnect, 'order:new': fn, ... }. onConnect runs on every connect and
// reconnect: that is when to fetch the data again over REST, since news sent while the
// connection was down is not repeated. Returns 'connecting', 'live' or 'offline'.
export function useSocket(auth, handlers) {
  const handlersRef = useRef(handlers);
  const [status, setStatus] = useState('connecting');
  // A string, so a new but equal auth object does not reconnect.
  const authKey = auth ? JSON.stringify(auth) : null;

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!authKey || !API_URL) return undefined;
    const socket = io(API_URL, { auth: JSON.parse(authKey) });
    socket.on('connect', () => {
      setStatus('live');
      handlersRef.current.onConnect?.();
    });
    socket.on('disconnect', () => setStatus('offline'));
    socket.on('connect_error', () => setStatus('offline'));
    socket.onAny((event, payload) => handlersRef.current[event]?.(payload));
    return () => socket.disconnect();
  }, [authKey]);

  return authKey ? status : 'offline';
}
