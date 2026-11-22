import { useEffect, useState } from 'react';
import { CircleAlert, CircleCheck, LoaderCircle, RotateCw } from 'lucide-react';
import { API_URL } from '../../api/client.js';
import { getHealth } from '../../api/health.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';

const STATUS_VIEW = {
  loading: {
    Icon: LoaderCircle,
    iconClass: 'animate-spin text-text-muted',
    tone: 'neutral',
    label: 'Checking',
    title: 'Checking the server…',
  },
  ok: {
    Icon: CircleCheck,
    iconClass: 'text-success',
    tone: 'success',
    label: 'Online',
    title: 'Server is running',
  },
  error: {
    Icon: CircleAlert,
    iconClass: 'text-danger',
    tone: 'danger',
    label: 'Offline',
    title: 'Cannot reach the server',
  },
};

// Setup check for Phase 1.1: proves the client can reach the API's health route.
export default function HealthPage() {
  const [check, setCheck] = useState({ status: 'loading', message: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getHealth({ signal: controller.signal })
      .then((data) =>
        setCheck(
          data?.ok
            ? { status: 'ok', message: '' }
            : { status: 'error', message: 'The server answered, but not with ok: true.' },
        ),
      )
      .catch((err) => {
        if (err.name !== 'AbortError') setCheck({ status: 'error', message: err.message });
      });
    // StrictMode runs effects twice in development; aborting avoids a duplicate state update.
    return () => controller.abort();
  }, [attempt]);

  const checkAgain = () => {
    setCheck({ status: 'loading', message: '' });
    setAttempt((count) => count + 1);
  };

  const { Icon, iconClass, tone, label, title } = STATUS_VIEW[check.status];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Setup check</p>
        <h1 className="text-h1 font-bold">ScanServe</h1>
        <p className="text-text-muted">This page checks that the app can talk to the server.</p>
      </header>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h2 font-semibold">API status</h2>
          <Badge tone={tone}>{label}</Badge>
        </div>

        <div className="flex items-start gap-3" role="status" aria-live="polite">
          <Icon size={24} className={`mt-0.5 shrink-0 ${iconClass}`} aria-hidden="true" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-semibold">{title}</p>
            {check.status === 'ok' && (
              <p className="text-sm break-words text-text-muted">
                <code className="font-mono">GET /api/health</code> answered from {API_URL}
              </p>
            )}
            {check.status === 'error' && (
              <>
                <p className="text-sm text-text-muted">{check.message}</p>
                <p className="text-sm text-text-muted">
                  Start it with <code className="font-mono">npm run dev</code> in the{' '}
                  <code className="font-mono">server</code> folder.
                </p>
              </>
            )}
          </div>
        </div>

        {check.status !== 'loading' && (
          <Button variant={check.status === 'ok' ? 'secondary' : 'primary'} onClick={checkAgain}>
            <RotateCw size={24} aria-hidden="true" />
            Check again
          </Button>
        )}
      </Card>
    </main>
  );
}
