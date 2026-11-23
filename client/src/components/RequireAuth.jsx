import { LoaderCircle, RotateCw } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
import Alert from './ui/Alert.jsx';
import Button from './ui/Button.jsx';

// Wraps owner-only routes: shows them when logged in, sends everyone else to the login page.
export default function RequireAuth() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') return <Outlet />;
  if (status === 'anonymous') {
    return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-4 px-4 text-center"
      aria-live="polite"
    >
      {status === 'loading' ? (
        <>
          <LoaderCircle size={24} className="animate-spin text-primary" aria-hidden="true" />
          <p className="font-semibold">Loading your café…</p>
          <p className="text-sm text-text-muted">The server can take up to a minute to wake up.</p>
        </>
      ) : (
        <>
          <Alert>{error}</Alert>
          <Button onClick={retry}>
            <RotateCw size={24} aria-hidden="true" />
            Try again
          </Button>
        </>
      )}
    </main>
  );
}
