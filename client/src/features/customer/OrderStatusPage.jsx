import {
  ArrowLeft,
  ChefHat,
  CircleCheckBig,
  CircleX,
  HandCoins,
  LoaderCircle,
  RotateCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getMyOrder } from '../../api/orders.js';
import Alert from '../../components/ui/Alert.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import LinkButton from '../../components/ui/LinkButton.jsx';
import { readDeviceId } from '../../lib/deviceStorage.js';
import { formatRupees } from '../../lib/format.js';

// Status in colour and words (Design.md: never colour alone).
const STATUS = {
  new: {
    badge: 'New',
    tone: 'info',
    title: 'Being cooked',
    text: 'Keep this page open. Tap Check status to see if it is ready.',
    Icon: ChefHat,
    box: 'border-border bg-surface',
  },
  ready: {
    badge: 'Ready',
    tone: 'success',
    title: 'Ready, please collect',
    text: 'Show this order number at the counter.',
    Icon: CircleCheckBig,
    box: 'border-success bg-success/10',
  },
  paid: {
    badge: 'Paid',
    tone: 'neutral',
    title: 'Paid. Thank you!',
    text: 'Enjoy your food.',
    Icon: HandCoins,
    box: 'border-border bg-surface',
  },
  cancelled: {
    badge: 'Cancelled',
    tone: 'danger',
    title: 'Cancelled by the café',
    text: 'Please ask at the counter if you were not expecting this.',
    Icon: CircleX,
    box: 'border-danger/40 bg-danger/10',
  },
};

const LOADING = { status: 'loading', order: null, restaurant: null, error: null };

// /m/:slug/order/:orderId — the customer's order: number, status, items and total. Only the
// phone that placed it can open it. Live updates arrive with step 1.6; until then the page
// checks again when the customer comes back to it or taps Check status.
export default function OrderStatusPage() {
  const { slug, orderId } = useParams();
  const [deviceId] = useState(readDeviceId);
  const [state, setState] = useState(LOADING);
  const [checkCount, setCheckCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!deviceId) return undefined;
    const controller = new AbortController();
    getMyOrder(orderId, deviceId, { signal: controller.signal })
      .then(({ order, restaurant }) => {
        setState({ status: 'ready', order, restaurant, error: null });
        document.title = `Order #${order.orderNumber}${restaurant ? ` · ${restaurant.name}` : ''}`;
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        // A failed re-check keeps the order on screen and says so.
        setState((current) =>
          current.status === 'ready'
            ? { ...current, error: err }
            : { ...LOADING, status: 'error', error: err },
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsChecking(false);
      });
    return () => controller.abort();
  }, [orderId, deviceId, checkCount]);

  // Coming back to this tab (for example after switching apps) checks the order again.
  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === 'visible') setCheckCount((count) => count + 1);
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => document.removeEventListener('visibilitychange', handleVisible);
  }, []);

  const checkAgain = () => {
    if (isChecking) return;
    setIsChecking(true);
    setCheckCount((count) => count + 1);
  };

  const isNotFound =
    !deviceId || (state.status === 'error' && [400, 401, 404].includes(state.error.status));

  if (isNotFound) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4">
        <h1 className="text-h1 font-bold">We could not find this order</h1>
        <p className="text-text-muted">
          An order can only be seen on the phone that placed it. Ask at the counter if you need
          help.
        </p>
        <LinkButton to={`/m/${slug}`}>Back to the menu</LinkButton>
      </main>
    );
  }

  if (state.status === 'loading') {
    return (
      <main
        className="flex min-h-dvh items-center justify-center gap-3 text-text-muted"
        aria-busy="true"
      >
        <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
        <p role="status">Opening your order…</p>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4">
        <h1 className="text-h1 font-bold">Your order did not load</h1>
        <Alert>{state.error.message}</Alert>
        <Button onClick={checkAgain}>
          <RotateCw size={24} aria-hidden="true" />
          Try again
        </Button>
      </main>
    );
  }

  const { order, restaurant } = state;
  const status = STATUS[order.status] ?? STATUS.new;
  const menuPath = `/m/${restaurant?.slug ?? slug}`;
  const isOpen = order.status === 'new' || order.status === 'ready';

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col gap-5 px-4 pt-4 pb-10">
      <Link
        to={menuPath}
        className="inline-flex min-h-12 items-center gap-2 self-start font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ArrowLeft size={24} aria-hidden="true" />
        Back to the menu
      </Link>

      <header className="flex flex-col items-center gap-1 rounded-card bg-primary px-4 py-6 text-center text-white">
        {restaurant && <p className="text-lg break-words text-white/85">{restaurant.name}</p>}
        <h1 className="font-display text-display leading-tight font-bold tabular-nums">
          Order #{order.orderNumber}
        </h1>
        <p className="text-lg break-words">For {order.customerName}</p>
      </header>

      {/* Read out when a check finds a new status. */}
      <div role="status" className={`flex items-start gap-3 rounded-card border p-4 ${status.box}`}>
        <status.Icon size={32} className="mt-1 shrink-0" aria-hidden="true" />
        <div className="flex min-w-0 flex-col items-start gap-1">
          <Badge tone={status.tone}>{status.badge}</Badge>
          <p className="font-display text-h2 font-bold">{status.title}</p>
          <p className="text-text-muted">{status.text}</p>
        </div>
      </div>

      {state.error && <Alert>Could not check for a new status. {state.error.message}</Alert>}
      {isOpen && (
        <Button variant="secondary" aria-disabled={isChecking || undefined} onClick={checkAgain}>
          <RotateCw size={24} className={isChecking ? 'animate-spin' : ''} aria-hidden="true" />
          {isChecking ? 'Checking…' : 'Check status'}
        </Button>
      )}

      <Card className="flex flex-col gap-3">
        <h2 className="text-h2 font-bold">Your order</h2>
        <ul className="flex flex-col divide-y divide-border">
          {order.items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-start justify-between gap-3 py-2"
            >
              <span className="min-w-0 break-words">
                <span className="font-semibold tabular-nums">{item.qty} ×</span> {item.name}
              </span>
              <span className="shrink-0 tabular-nums">{formatRupees(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-display text-h1 font-bold tabular-nums">
            {formatRupees(order.total)}
          </span>
        </div>
      </Card>

      {isOpen && <p className="text-text-muted">Pay at the counter after eating: UPI or cash.</p>}
      <LinkButton to={menuPath}>Order something else</LinkButton>
    </main>
  );
}
