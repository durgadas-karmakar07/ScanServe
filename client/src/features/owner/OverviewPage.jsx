import {
  ArrowRight,
  ChefHat,
  ExternalLink,
  IndianRupee,
  LoaderCircle,
  QrCode,
  ReceiptIndianRupee,
  ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { getMenu, updateMenuItem } from '../../api/menu.js';
import { getOrderQueue } from '../../api/orders.js';
import DishPhoto from '../../components/DishPhoto.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Switch from '../../components/ui/Switch.jsx';
import VegMark from '../../components/ui/VegMark.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { formatRupees } from '../../lib/format.js';
import { groupByCategory } from '../../lib/menu.js';

const CLOCK_TICK_MS = 30_000;

function greeting(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function minutesAgo(iso, now) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  return minutes === 0 ? 'Just now' : `${minutes} min ago`;
}

// One number on the dashboard: an icon in a soft circle, the label, the value and a short hint.
// With `to`, the whole card is a link to the page about it.
function StatCard({ Icon, label, value, hint, to }) {
  const body = (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="text-base text-text-muted">{label}</span>
      <span className="text-[1.75rem] leading-none font-bold tabular-nums">{value}</span>
      {hint && <span className="text-sm text-text-muted">{hint}</span>}
    </>
  );
  const classes =
    'flex min-w-0 flex-col items-start gap-2 rounded-card bg-surface p-4 shadow-card sm:p-5';
  return to ? (
    <Link
      to={to}
      className={`${classes} hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
    >
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

// An order in the live queue: number and time, the customer's name, its status and size.
function QueueCard({ order, now }) {
  const isReady = order.status === 'ready';
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  return (
    <li className="w-64 shrink-0 snap-start">
      <Link
        to={isReady ? '/owner/unpaid' : '/kitchen'}
        className="flex h-full flex-col gap-3 rounded-card bg-surface p-4 shadow-card hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex items-center justify-between gap-2 text-sm">
          <span className="font-bold text-accent tabular-nums">#{order.orderNumber}</span>
          <span className="text-text-muted">{minutesAgo(order.createdAt, now)}</span>
        </span>
        <span className="line-clamp-1 text-lg font-semibold break-words">{order.customerName}</span>
        <span className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isReady ? 'bg-success/12 text-success' : 'bg-accent-soft text-accent'}`}
          >
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${isReady ? 'bg-success' : 'animate-pulse bg-accent'}`}
            />
            {isReady ? 'Ready · unpaid' : 'Cooking'}
          </span>
          <span className="text-sm text-text-muted tabular-nums">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatRupees(order.total)}
          </span>
        </span>
      </Link>
    </li>
  );
}

// /owner/overview — the owner's dashboard (Design.md): today's numbers, the live order queue
// and the menu as product cards with a quick "available" switch. Live updates come from the
// layout's connection (liveTick changes on every order event).
export default function OverviewPage() {
  const { staff, restaurant, withAuth } = useAuth();
  const { summary, liveTick } = useOutletContext();
  const { showToast } = useToast();
  const [queue, setQueue] = useState({ status: 'loading', orders: [], error: null });
  const [menu, setMenu] = useState({ status: 'loading', items: [], error: null });
  const [category, setCategory] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = `Overview · ${restaurant.name}`;
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, [restaurant.name]);

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getOrderQueue, { signal: controller.signal })
      .then(({ orders }) => setQueue({ status: 'ready', orders, error: null }))
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setQueue((current) => ({ ...current, status: 'error', error: err }));
      });
    return () => controller.abort();
  }, [withAuth, liveTick]);

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getMenu, { signal: controller.signal })
      .then(({ items }) => setMenu({ status: 'ready', items, error: null }))
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setMenu({ status: 'error', items: [], error: err });
      });
    return () => controller.abort();
  }, [withAuth]);

  const toggleAvailable = async (item) => {
    setUpdatingId(item.id);
    try {
      const { item: saved } = await withAuth(updateMenuItem, item.id, {
        isAvailable: !item.isAvailable,
      });
      setMenu((current) => ({
        ...current,
        items: current.items.map((entry) => (entry.id === saved.id ? saved : entry)),
      }));
      showToast(saved.isAvailable ? `${saved.name} is available` : `${saved.name} is sold out`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const groups = groupByCategory(menu.items);
  const categories = groups.map(([name]) => name);
  const shownItems =
    category && categories.includes(category)
      ? menu.items.filter((item) => item.category === category)
      : menu.items;
  const firstName = staff.name.trim().split(/\s+/)[0];
  const today = new Date(now);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-eyebrow font-semibold text-text-muted uppercase">
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-h1 break-words">
            {greeting(today)}, {firstName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/kitchen"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChefHat size={20} aria-hidden="true" />
            Open kitchen
          </Link>
          <a
            href={`/m/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-5 font-semibold hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ExternalLink size={20} aria-hidden="true" />
            Customer menu
          </a>
          <Link
            to="/owner/qr"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-5 font-semibold hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <QrCode size={20} aria-hidden="true" />
            QR poster
          </Link>
        </div>
      </div>

      <section aria-label="Today" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          Icon={ShoppingBag}
          label="Orders today"
          value={summary ? summary.today.orders : '…'}
          hint={
            summary?.today.cancelled
              ? `${summary.today.cancelled} cancelled`
              : 'Order numbers start at 1 each day'
          }
        />
        <StatCard
          Icon={IndianRupee}
          label="Collected today"
          value={summary ? formatRupees(summary.today.paidAmount) : '…'}
          hint={
            summary
              ? `Cash ${formatRupees(summary.today.cashAmount)} · UPI ${formatRupees(summary.today.upiAmount)}`
              : null
          }
        />
        <StatCard
          Icon={ReceiptIndianRupee}
          label="Unpaid"
          value={summary ? formatRupees(summary.open.unpaidAmount) : '…'}
          hint={
            summary
              ? `${summary.open.readyCount} ${summary.open.readyCount === 1 ? 'order' : 'orders'} to collect`
              : null
          }
          to="/owner/unpaid"
        />
        <StatCard
          Icon={ChefHat}
          label="In the kitchen"
          value={summary ? summary.open.newCount : '…'}
          hint="Waiting to be made"
          to="/kitchen"
        />
      </section>

      <section aria-labelledby="queue-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="queue-title" className="flex items-center gap-3 text-h1">
            Order queue
            {queue.status === 'ready' && queue.orders.length > 0 && (
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
        {queue.status === 'error' && <Alert>{queue.error.message}</Alert>}
        {queue.status === 'ready' && queue.orders.length === 0 && (
          <p className="rounded-card bg-surface p-5 text-text-muted shadow-card">
            No open orders right now. New orders appear here by themselves.
          </p>
        )}
        {queue.status === 'ready' && queue.orders.length > 0 && (
          <ul
            aria-label="Open orders, oldest first"
            className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] lg:mx-0 lg:scroll-px-0 lg:px-0"
          >
            {queue.orders.map((order) => (
              <QueueCard key={order.id} order={order} now={now} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="products-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="products-title" className="text-h1">
            Your menu
          </h2>
          <Link
            to="/owner/menu"
            className="inline-flex min-h-12 items-center gap-1 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Manage menu
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>

        {menu.status === 'loading' && (
          <p className="flex items-center gap-3 text-text-muted" role="status">
            <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
            Loading your menu…
          </p>
        )}
        {menu.status === 'error' && <Alert>{menu.error.message}</Alert>}
        {menu.status === 'ready' && menu.items.length === 0 && (
          <p className="rounded-card bg-surface p-5 text-text-muted shadow-card">
            No dishes yet.{' '}
            <Link to="/owner/menu" className="font-semibold text-primary underline">
              Add your first dish
            </Link>{' '}
            to start taking orders.
          </p>
        )}

        {menu.status === 'ready' && menu.items.length > 0 && (
          <>
            <div
              role="group"
              aria-label="Menu categories"
              className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
            >
              {[null, ...categories].map((name) => {
                const isActive =
                  (category ?? null) === name || (name === null && !categories.includes(category));
                return (
                  <button
                    key={name ?? 'all'}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setCategory(name)}
                    className={`min-h-11 shrink-0 rounded-full px-4 text-base font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isActive ? 'bg-night text-white' : 'border border-border bg-surface hover:bg-surface-warm'}`}
                  >
                    {name ?? `All (${menu.items.length})`}
                  </button>
                );
              })}
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shownItems.map((item) => (
                <li
                  key={item.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card"
                >
                  <div className="relative p-2 pb-0">
                    <div className="overflow-hidden rounded-xl">
                      <DishPhoto
                        name={item.name}
                        photoUrl={item.photoUrl}
                        isSoldOut={!item.isAvailable}
                      />
                    </div>
                    <span className="absolute top-4 left-4 rounded-full bg-surface px-3 py-1 text-base font-bold tabular-nums shadow-card">
                      {formatRupees(item.price)}
                    </span>
                    {!item.isAvailable && (
                      <span className="absolute top-4 right-4 rounded-full bg-night px-3 py-1 text-sm font-semibold text-white">
                        Sold out
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4 pt-3">
                    <p className="flex items-start gap-2 text-lg font-semibold">
                      <span className="mt-1">
                        <VegMark isVeg={item.isVeg} size={18} />
                      </span>
                      <span className="min-w-0 break-words">{item.name}</span>
                    </p>
                    {item.description && (
                      <p className="line-clamp-1 text-sm break-words text-text-muted">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-auto pt-2">
                      <Switch
                        label="Available today"
                        accessibleName={`${item.name} available today`}
                        checked={item.isAvailable}
                        disabled={updatingId === item.id}
                        onChange={() => toggleAvailable(item)}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
