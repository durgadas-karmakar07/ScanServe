import { Banknote, LoaderCircle, RotateCw, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getUnpaidOrders, markOrderPaid } from '../../api/orders.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocket } from '../../hooks/useSocket.js';
import { useToast } from '../../hooks/useToast.js';
import { formatRupees } from '../../lib/format.js';

const CLOCK_TICK_MS = 30_000;

// "Ready 12 min ago", or the date for orders from an earlier day.
function readyLabel(order, now) {
  const readyAt = new Date(order.readyAt ?? order.createdAt);
  const minutes = Math.floor((now - readyAt.getTime()) / 60_000);
  if (minutes < 1) return 'Ready just now';
  if (minutes < 60) return `Ready ${minutes} min ago`;
  const isToday = readyAt.toDateString() === new Date(now).toDateString();
  return isToday
    ? `Ready at ${readyAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`
    : `Ready on ${readyAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

// /owner/unpaid — orders that are ready but not paid yet (PRD: pay after eating is trust-based,
// so the owner can see who still has to pay and mark it paid). Updates live: a new Ready adds an
// order, a customer paying or a cancel removes it.
export default function UnpaidPage() {
  const { token, withAuth } = useAuth();
  const { showToast } = useToast();
  const [list, setList] = useState({
    status: 'loading',
    orders: [],
    count: 0,
    amount: 0,
    hasMore: false,
    error: null,
  });
  const [loadCount, setLoadCount] = useState(0);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [now, setNow] = useState(() => Date.now());
  const headingRef = useRef(null);
  const firstButtonRefs = useRef(new Map());
  const focusIndexAfterRemoval = useRef(null);
  // Orders paid or cancelled while a reload is on its way: its answer may still list them.
  const removedDuringLoad = useRef(new Set());

  useEffect(() => {
    document.title = 'Unpaid orders · ScanServe';
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    removedDuringLoad.current = new Set();
    withAuth(getUnpaidOrders, { signal: controller.signal })
      .then(({ orders, count, amount, hasMore }) => {
        const removed = removedDuringLoad.current;
        const shown = orders.filter((order) => !removed.has(order.id));
        const removedAmount = orders
          .filter((order) => removed.has(order.id))
          .reduce((sum, order) => sum + order.total, 0);
        setList({
          status: 'ready',
          orders: shown,
          count: count - (orders.length - shown.length),
          amount: amount - removedAmount,
          hasMore,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setList((current) =>
          current.status === 'ready'
            ? { ...current, error: err }
            : { ...current, status: 'error', error: err },
        );
      });
    return () => controller.abort();
  }, [withAuth, loadCount]);

  const reload = useCallback(() => setLoadCount((count) => count + 1), []);
  // Takes an order off the list and out of the count and total to collect.
  const removeOrder = useCallback((orderId) => {
    removedDuringLoad.current.add(orderId);
    setList((current) => {
      const order = current.orders.find((item) => item.id === orderId);
      if (!order) return current;
      return {
        ...current,
        orders: current.orders.filter((item) => item.id !== orderId),
        count: current.count - 1,
        amount: current.amount - order.total,
      };
    });
  }, []);

  useSocket(token ? { token } : null, {
    onConnect: reload,
    // The login is no longer valid: loading the list answers 401, which logs out.
    onRefused: reload,
    // The event has only the id and number, so load the list again to get the whole order.
    'order:ready': reload,
    'order:paid': ({ orderId }) => removeOrder(orderId),
    'order:cancelled': ({ orderId }) => removeOrder(orderId),
  });

  // When this screen's own button removes an order, focus moves to the order that takes its
  // place (or the heading), so keyboard and screen reader users are not lost.
  useEffect(() => {
    const index = focusIndexAfterRemoval.current;
    if (index === null) return;
    focusIndexAfterRemoval.current = null;
    const next = list.orders[Math.min(index, list.orders.length - 1)];
    (next ? firstButtonRefs.current.get(next.id) : headingRef.current)?.focus();
  }, [list.orders]);

  const setBusy = (orderId, isBusy) =>
    setBusyIds((current) => {
      const next = new Set(current);
      if (isBusy) next.add(orderId);
      else next.delete(orderId);
      return next;
    });

  const markPaid = async (order, method) => {
    if (busyIds.has(order.id)) return;
    setBusy(order.id, true);
    try {
      await withAuth(markOrderPaid, order.id, method);
      focusIndexAfterRemoval.current = list.orders.findIndex((item) => item.id === order.id);
      removeOrder(order.id);
      showToast(`Order #${order.orderNumber} paid ${method === 'cash' ? 'in cash' : 'by UPI'}`);
    } catch (err) {
      showToast(err.message, 'error');
      // Already paid or cancelled elsewhere: take it off this list too.
      if (err.code === 'INVALID_STATUS_CHANGE' || err.status === 404) removeOrder(order.id);
    } finally {
      setBusy(order.id, false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 ref={headingRef} tabIndex={-1} className="text-h1 font-bold outline-none">
          Unpaid
        </h1>
        <p className="text-text-muted">
          Orders that are ready but not paid yet. Customers can mark them paid on their phone, or
          you can here.
        </p>
      </div>

      {list.status === 'loading' && (
        <p className="flex items-center gap-3 text-text-muted" role="status">
          <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          Loading unpaid orders…
        </p>
      )}

      {list.status === 'error' && (
        <div className="flex flex-col gap-3">
          <Alert>{list.error.message}</Alert>
          <Button variant="secondary" isFullWidth={false} onClick={reload}>
            <RotateCw size={24} aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}

      {list.status === 'ready' && (
        <>
          {list.error && <Alert>Could not refresh the list. {list.error.message}</Alert>}
          <Card className="flex items-baseline justify-between gap-3">
            <span className="font-semibold">
              {list.count === 1 ? '1 order' : `${list.count} orders`} to collect
            </span>
            <span className="font-display text-h1 font-bold tabular-nums">
              {formatRupees(list.amount)}
            </span>
          </Card>

          {list.hasMore && (
            <Alert>
              Showing the newest {list.orders.length} of {list.count} unpaid orders. Mark some paid
              to see older ones.
            </Alert>
          )}
          {list.orders.length === 0 ? (
            <p className="text-text-muted">
              Nothing unpaid. An order shows here after you tap Ready, until it is paid.
            </p>
          ) : (
            <ul className="flex flex-col gap-3" aria-label="Unpaid orders, newest first">
              {list.orders.map((order) => {
                const isBusy = busyIds.has(order.id);
                return (
                  <li key={order.id}>
                    <Card className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col">
                          <span className="font-display text-h1 leading-tight font-bold tabular-nums">
                            #{order.orderNumber}{' '}
                            <span className="font-sans text-h2 font-semibold break-words">
                              {order.customerName}
                            </span>
                          </span>
                          <span className="text-text-muted">{readyLabel(order, now)}</span>
                        </div>
                        <span className="shrink-0 font-display text-h2 font-bold tabular-nums">
                          {formatRupees(order.total)}
                        </span>
                      </div>
                      <p className="break-words text-text-muted">
                        {order.items.map((item) => `${item.qty} × ${item.name}`).join(', ')}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          ref={(node) => {
                            if (node) firstButtonRefs.current.set(order.id, node);
                            else firstButtonRefs.current.delete(order.id);
                          }}
                          variant="secondary"
                          aria-disabled={isBusy || undefined}
                          onClick={() => markPaid(order, 'upi')}
                        >
                          <Smartphone size={24} aria-hidden="true" />
                          Paid UPI<span className="sr-only"> for order {order.orderNumber}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          aria-disabled={isBusy || undefined}
                          onClick={() => markPaid(order, 'cash')}
                        >
                          <Banknote size={24} aria-hidden="true" />
                          Paid cash<span className="sr-only"> for order {order.orderNumber}</span>
                        </Button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
