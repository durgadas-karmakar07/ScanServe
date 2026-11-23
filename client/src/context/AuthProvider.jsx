import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, loginOwner, registerOwner } from '../api/auth.js';
import { clearToken, readToken, saveToken } from '../lib/tokenStorage.js';
import { AuthContext } from './authContext.js';

const LOGGED_OUT = { status: 'anonymous', token: null, staff: null, restaurant: null, error: '' };

function initialSession() {
  const token = readToken();
  return token ? { ...LOGGED_OUT, status: 'loading', token } : LOGGED_OUT;
}

// Owner session for the whole app. status: 'loading' (checking a saved token), 'authenticated',
// 'anonymous', or 'error' (server unreachable; the token is kept so "Try again" can work).
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(initialSession);
  const { status, token } = session;

  // A saved token is checked with the server on start, and again after "Try again".
  useEffect(() => {
    if (status !== 'loading') return undefined;
    const controller = new AbortController();
    // A login or logout that happens meanwhile aborts this check; its late answer must not
    // overwrite the newer session.
    getMe(token, { signal: controller.signal })
      .then(({ staff, restaurant }) => {
        if (controller.signal.aborted) return;
        setSession({ ...LOGGED_OUT, status: 'authenticated', token, staff, restaurant });
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        if (err.status === 401) {
          clearToken();
          setSession(LOGGED_OUT);
          return;
        }
        setSession((current) => ({ ...current, status: 'error', error: err.message }));
      });
    return () => controller.abort();
  }, [status, token]);

  const startSession = useCallback(({ token: newToken, staff, restaurant }) => {
    saveToken(newToken);
    setSession({ ...LOGGED_OUT, status: 'authenticated', token: newToken, staff, restaurant });
  }, []);

  const login = useCallback(
    async (credentials) => startSession(await loginOwner(credentials)),
    [startSession],
  );
  const register = useCallback(
    async (details) => startSession(await registerOwner(details)),
    [startSession],
  );
  const logout = useCallback(() => {
    clearToken();
    setSession(LOGGED_OUT);
  }, []);
  const retry = useCallback(
    () => setSession((current) => ({ ...current, status: 'loading', error: '' })),
    [],
  );

  const value = useMemo(
    () => ({ ...session, login, register, logout, retry }),
    [session, login, register, logout, retry],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
