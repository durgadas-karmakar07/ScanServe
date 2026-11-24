import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/client.js';

const MAX_RETRY_MS = 30_000;

// A live connection to the API for news: new orders for the kitchen, status changes for a
// customer. auth: { token } (kitchen, owner login) or { deviceId } (customer phone); null keeps it
// closed. handlers: { onConnect, onRefused, 'order:new': fn, ... }.
// - onConnect runs on every connect and reconnect: that is when to fetch the data again over
//   REST, since news sent while the connection was down is not repeated.
// - onRefused runs when the server says the login or device is no longer valid (UNAUTHORIZED).
// Any other failure (network, a server hiccup, the server ending the connection) is retried,
// waiting a little longer each time. Returns 'connecting', 'live', 'offline' or 'refused'.
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
    let retryTimer = 0;
    let attempts = 0;

    const retryLater = () => {
      clearTimeout(retryTimer);
      const delay = Math.min(MAX_RETRY_MS, 1000 * 2 ** attempts);
      attempts += 1;
      retryTimer = setTimeout(() => socket.connect(), delay);
    };

    socket.on('connect', () => {
      attempts = 0;
      setStatus('live');
      handlersRef.current.onConnect?.();
    });
    socket.on('disconnect', (reason) => {
      setStatus('offline');
      // The server ended it (for example after "Log out everywhere"): connect again, and the
      // handshake decides whether this login still works. Other reasons reconnect by themselves.
      if (reason === 'io server disconnect') retryLater();
    });
    socket.on('connect_error', (err) => {
      // While socket.active is true, Socket.io keeps trying by itself.
      if (socket.active) {
        setStatus('offline');
        return;
      }
      if (err.message === 'UNAUTHORIZED') {
        setStatus('refused');
        handlersRef.current.onRefused?.();
        return;
      }
      setStatus('offline');
      retryLater();
    });
    socket.onAny((event, payload) => handlersRef.current[event]?.(payload));

    return () => {
      clearTimeout(retryTimer);
      socket.disconnect();
    };
  }, [authKey]);

  return authKey ? status : 'offline';
}
