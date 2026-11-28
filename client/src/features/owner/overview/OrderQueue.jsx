import { ArrowRight, LoaderCircle, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getOrderQueue } from '../../../api/orders.js';
import Alert from '../../../components/ui/Alert.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import QueueCard from './QueueCard.jsx';

// Orders still cooking come first (that is what needs attention now), then ready-but-unpaid
// ones; the API sends each group oldest first and sort() keeps that order.
const byStatus = (a, b) => (a.status === b.status ? 0 : a.status === 'new' ? -1 : 1);

// The live order queue on the dashboard. It reloads when liveTick changes (an order event, via
// the owner layout). A failed reload keeps the cards on screen, like the kitchen board does.
export default function OrderQueue({ liveTick, now }) {
  const { withAuth } = useAuth();
  const [queue, setQueue] = useState({ status: 'loading', orders: [], error: null });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getOrderQueue, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted || !data) return;
        setQueue({ status: 'ready', orders: [...data.orders].sort(byStatus), error: null });
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setQueue((current) =>
          current.status === 'ready'
            ? { ...current, error: err }
            : { ...current, status: 'error', error: err },
        );
      });
    return () => controller.abort();
  }, [withAuth, liveTick, retryCount]);

  const retry = () => setRetryCount((count) => count + 1);
  const hasOrders = queue.status === 'ready' && queue.orders.length > 0;

  return (
    <section aria-labelledby="queue-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="queue-title" className="flex items-center gap-3 text-h1">
          Order queue
          {hasOrders && (
            <span className="rounded-full bg-night px-2.5 font-sans text-base leading-7 font-semibold text-white tabular-nums">
              {queue.orders.length}
            </span>
          )}
        </h2>
        <Link
          to="/kitchen"
          className="inline-flex min-h-12 items-center gap-1 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Kitchen
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </div>

      {queue.status === 'loading' && (
        <p className="flex items-center gap-3 text-text-muted" role="status">
          <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          Loading orders…
        </p>
      )}
      {queue.error && (
        <div className="flex flex-col gap-3">
          <Alert>
            {queue.status === 'ready' ? 'Could not refresh the queue. ' : ''}
            {queue.error.message}
          </Alert>
          <Button variant="secondary" isFullWidth={false} onClick={retry} className="self-start">
            <RotateCw size={24} aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}
      {queue.status === 'ready' && queue.orders.length === 0 && (
        <p className="rounded-card bg-surface p-5 text-text-muted shadow-card">
          No open orders right now. New orders appear here by themselves.
        </p>
      )}
      {hasOrders && (
        <ul
          aria-label="Open orders: cooking first, then ready and unpaid"
          className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] lg:mx-0 lg:scroll-px-0 lg:px-0"
        >
          {queue.orders.map((order) => (
            <QueueCard key={order.id} order={order} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}
