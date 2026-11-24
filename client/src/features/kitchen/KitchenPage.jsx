import { ArrowLeft, BellRing, LoaderCircle, RotateCw, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cancelOrder, getKitchenOrders, markOrderReady } from '../../api/orders.js';
import Button from '../../components/ui/Button.jsx';
import Sheet from '../../components/ui/Sheet.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocket } from '../../hooks/useSocket.js';
import { useToast } from '../../hooks/useToast.js';
import { useWakeLock } from '../../hooks/useWakeLock.js';
import { enableSound, isSoundAvailable, isSoundOn, playChime } from '../../lib/orderSound.js';
import OrderCard from './OrderCard.jsx';

const CLOCK_TICK_MS = 30_000;

// /kitchen — the live kitchen board (PRD: a new order shows within 2 seconds, with a sound).
// New orders arrive over the live connection; Ready and Cancel go through the REST API, and the
// other screens hear about them live. After any reconnect the list is loaded again.
export default function KitchenPage() {
  const { token, restaurant, withAuth } = useAuth();
  const { showToast } = useToast();
  const [board, setBoard] = useState({ status: 'loading', orders: [], error: null });
  const [loadCount, setLoadCount] = useState(0);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasSound, setHasSound] = useState(isSoundOn);
  const [announcement, setAnnouncement] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const isAwake = useWakeLock();
  const headingRef = useRef(null);
  const readyRefs = useRef(new Map());
  // When this screen's own Ready/Cancel removes a card, focus moves to the card that takes its
  // place (or the heading), so keyboard and screen reader users are not lost.
  const focusIndexAfterRemoval = useRef(null);

  useEffect(() => {
    document.title = `Kitchen · ${restaurant.name}`;
  }, [restaurant.name]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getKitchenOrders, { signal: controller.signal })
      .then(({ orders }) => setBoard({ status: 'ready', orders, error: null }))
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        // A failed reload keeps the cards that are already on screen.
        setBoard((current) =>
          current.status === 'ready'
            ? { ...current, error: err }
            : { status: 'error', orders: [], error: err },
        );
      });
    return () => controller.abort();
  }, [withAuth, loadCount]);

  const reload = useCallback(() => setLoadCount((count) => count + 1), []);

  const removeOrder = useCallback((orderId) => {
    setBoard((current) => ({
      ...current,
      orders: current.orders.filter((order) => order.id !== orderId),
    }));
  }, []);

  const connection = useSocket(token ? { token } : null, {
    onConnect: reload,
    'order:new': (order) => {
      setBoard((current) =>
        current.orders.some((existing) => existing.id === order.id)
          ? current
          : { ...current, orders: [...current.orders, order] },
      );
      playChime();
      setAnnouncement(`New order ${order.orderNumber} for ${order.customerName}`);
    },
    'order:ready': ({ orderId }) => removeOrder(orderId),
    'order:cancelled': ({ orderId }) => removeOrder(orderId),
  });

  useEffect(() => {
    const index = focusIndexAfterRemoval.current;
    if (index === null) return;
    focusIndexAfterRemoval.current = null;
    const next = board.orders[Math.min(index, board.orders.length - 1)];
    (next ? readyRefs.current.get(next.id) : headingRef.current)?.focus();
  }, [board.orders]);

  const setBusy = (orderId, isBusy) =>
    setBusyIds((current) => {
      const next = new Set(current);
      if (isBusy) next.add(orderId);
      else next.delete(orderId);
      return next;
    });

  // Ready: one tap. A double tap is harmless (the server answers with the same order).
  const handleReady = async (order) => {
    setBusy(order.id, true);
    try {
      await withAuth(markOrderReady, order.id);
      focusIndexAfterRemoval.current = board.orders.findIndex((item) => item.id === order.id);
      removeOrder(order.id);
      setAnnouncement(`Order ${order.orderNumber} is ready`);
    } catch (err) {
      showToast(err.message, 'error');
      // Already cancelled or gone elsewhere: take it off this board too.
      if (err.code === 'INVALID_STATUS_CHANGE' || err.status === 404) removeOrder(order.id);
    } finally {
      setBusy(order.id, false);
    }
  };

  const confirmCancel = async () => {
    const order = cancelTarget;
    setIsCancelling(true);
    try {
      await withAuth(cancelOrder, order.id);
      focusIndexAfterRemoval.current = board.orders.findIndex((item) => item.id === order.id);
      removeOrder(order.id);
      setCancelTarget(null);
      showToast(`Order #${order.orderNumber} cancelled`);
    } catch (err) {
      showToast(err.message, 'error');
      if (err.code === 'INVALID_STATUS_CHANGE' || err.status === 404) {
        removeOrder(order.id);
        setCancelTarget(null);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const turnOnSound = async () => {
    const isOn = await enableSound().catch(() => false);
    setHasSound(isOn);
    if (!isOn) showToast('This browser could not play sound.', 'error');
  };

  const count = board.orders.length;
  const isLive = connection === 'live';

  return (
    <div className="min-h-dvh bg-kitchen-bg text-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-kitchen-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/owner/menu"
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-stone-300 hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ArrowLeft size={24} aria-hidden="true" />
            <span className="sr-only">Back to the owner area</span>
          </Link>
          {/* min-w-48: on a narrow screen the buttons move to the next line instead of
              squeezing the title. */}
          <div className="min-w-48 flex-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-h2 leading-tight font-bold break-words outline-none"
            >
              Kitchen · {restaurant.name}
            </h1>
            <p className="text-stone-400">
              {board.status === 'ready'
                ? count === 1
                  ? '1 order waiting'
                  : `${count} orders waiting`
                : 'Loading orders…'}
              {isAwake && ' · Screen stays on'}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${isLive ? 'bg-success text-white' : 'bg-warning text-white'}`}
          >
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full bg-white ${isLive ? '' : 'animate-pulse'}`}
            />
            {isLive ? 'Live' : 'Reconnecting…'}
          </span>
          {isSoundAvailable() && (
            <button
              type="button"
              onClick={hasSound ? playChime : turnOnSound}
              className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${hasSound ? 'border border-stone-700 text-stone-200 hover:bg-stone-800' : 'bg-stone-50 text-kitchen-bg hover:bg-stone-200'}`}
            >
              {hasSound ? (
                <Volume2 size={24} aria-hidden="true" />
              ) : (
                <BellRing size={24} aria-hidden="true" />
              )}
              {hasSound ? 'Test sound' : 'Turn on sound'}
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5">
        {!hasSound && isSoundAvailable() && (
          <p className="mb-4 rounded-card border border-stone-700 p-3 text-stone-300">
            Tap <strong className="text-stone-50">Turn on sound</strong> once so new orders ring.
            Browsers keep pages quiet until you tap.
          </p>
        )}
        {board.error && board.status === 'ready' && (
          <p className="mb-4 rounded-card border border-danger/60 bg-danger/20 p-3" role="alert">
            Could not refresh the orders. {board.error.message}
          </p>
        )}

        {board.status === 'loading' && (
          <p className="flex items-center gap-3 py-16 text-xl text-stone-400" role="status">
            <LoaderCircle size={28} className="animate-spin" aria-hidden="true" />
            Loading orders…
          </p>
        )}

        {board.status === 'error' && (
          <div className="flex max-w-[480px] flex-col gap-4 py-16" role="alert">
            <p className="text-h2 font-bold">The orders did not load</p>
            <p className="text-stone-400">{board.error.message}</p>
            <Button variant="secondary" isFullWidth={false} onClick={reload}>
              <RotateCw size={24} aria-hidden="true" />
              Try again
            </Button>
          </div>
        )}

        {board.status === 'ready' && count === 0 && (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="font-display text-display font-bold">No orders waiting</p>
            <p className="max-w-[40ch] text-xl text-stone-400">
              New orders appear here by themselves{hasSound ? ', with a sound' : ''}.
            </p>
          </div>
        )}

        {board.status === 'ready' && count > 0 && (
          <ul
            aria-label="Orders waiting, oldest first"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {board.orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                now={now}
                isBusy={busyIds.has(order.id)}
                readyRef={(node) => {
                  if (node) readyRefs.current.set(order.id, node);
                  else readyRefs.current.delete(order.id);
                }}
                onReady={handleReady}
                onCancel={setCancelTarget}
              />
            ))}
          </ul>
        )}
      </main>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      {cancelTarget && (
        <Sheet
          title={`Cancel order #${cancelTarget.orderNumber}?`}
          isBusy={isCancelling}
          onClose={() => !isCancelling && setCancelTarget(null)}
        >
          <p className="text-text-muted">
            {cancelTarget.customerName}&apos;s phone will show &quot;Cancelled by the café&quot;.
          </p>
          <Button variant="secondary" onClick={() => setCancelTarget(null)}>
            Keep the order
          </Button>
          <Button
            variant="danger"
            aria-disabled={isCancelling || undefined}
            onClick={() => !isCancelling && confirmCancel()}
          >
            {isCancelling ? 'Cancelling…' : 'Yes, cancel order'}
          </Button>
        </Sheet>
      )}
    </div>
  );
}
