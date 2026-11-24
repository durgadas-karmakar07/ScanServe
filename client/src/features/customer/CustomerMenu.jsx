import { ChevronRight, LoaderCircle, ReceiptText, RotateCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getMyOpenOrders, placeOrder as sendOrder } from '../../api/orders.js';
import { getPublicMenu } from '../../api/public.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Sheet from '../../components/ui/Sheet.jsx';
import { useActiveSection } from '../../hooks/useActiveSection.js';
import { useCart } from '../../hooks/useCart.js';
import { useDevice } from '../../hooks/useDevice.js';
import { useToast } from '../../hooks/useToast.js';
import { groupByCategory } from '../../lib/menu.js';
import { readDeviceId } from '../../lib/deviceStorage.js';
import CartBar from './CartBar.jsx';
import CategoryTabs from './CategoryTabs.jsx';
import DishCard from './DishCard.jsx';
import MenuHero from './MenuHero.jsx';
import OrderSummary from './OrderSummary.jsx';

const SECTION_PREFIX = 'category';
const LOADING = { status: 'loading', restaurant: null, items: [], error: null };
// The phone's device ID was not accepted: get a new one and try once more.
const DEVICE_ERRORS = ['DEVICE_REQUIRED', 'DEVICE_UNKNOWN'];
// The menu changed since it was loaded: reload it so the cart and dishes are up to date.
const MENU_ERRORS = ['ITEM_UNAVAILABLE', 'MENU_CHANGED', 'NOT_ACCEPTING_ORDERS'];

// The one place cart changes are read out. A second copy lives inside the order sheet, because
// an open modal sheet hides the rest of the page from screen readers.
function CartAnnouncer({ message }) {
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {message}
    </p>
  );
}

export default function CustomerMenu({ slug }) {
  const { lines, setQuantity, clearCart, maxQuantity, maxLines } = useCart();
  const { name: customerName, saveName, ensureDeviceId } = useDevice();
  const { showToast } = useToast();
  const navigate = useNavigate();
  // This phone's open orders here (from the server), shown as links above the menu.
  const [openOrders, setOpenOrders] = useState([]);
  const [openOrdersLoad, setOpenOrdersLoad] = useState(0);
  // One id per checkout: if the answer to Place order is lost and the customer taps again, the
  // server returns the order it already saved instead of making a second one. A new id is made
  // whenever the cart changes.
  const checkoutId = useRef(crypto.randomUUID());

  useEffect(() => {
    checkoutId.current = crypto.randomUUID();
  }, [lines]);

  useEffect(() => {
    const deviceId = readDeviceId();
    if (!deviceId) return undefined;
    const controller = new AbortController();
    getMyOpenOrders(slug, deviceId, { signal: controller.signal })
      .then(({ orders }) => setOpenOrders(orders))
      // Not critical: without the list the menu still works.
      .catch(() => {});
    return () => controller.abort();
  }, [slug, openOrdersLoad]);
  const [menu, setMenu] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const mainRef = useRef(null);
  const wasOrderOpen = useRef(false);

  // Closing the sheet hands focus back to View order, but that bar is gone once the order is
  // empty. Then focus goes to the menu instead of being lost.
  useEffect(() => {
    if (wasOrderOpen.current && !isOrderOpen) {
      const active = document.activeElement;
      if (!active || active === document.body) mainRef.current?.focus({ preventScroll: true });
    }
    wasOrderOpen.current = isOrderOpen;
  }, [isOrderOpen]);

  useEffect(() => {
    const controller = new AbortController();
    getPublicMenu(slug, { signal: controller.signal })
      .then(({ restaurant, items }) => {
        setMenu({ status: 'ready', restaurant, items, error: null });
        document.title = `${restaurant.name} menu`;
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setMenu({ status: 'error', restaurant: null, items: [], error: err });
      });
    return () => controller.abort();
  }, [slug, attempt]);

  const groups = useMemo(() => groupByCategory(menu.items), [menu.items]);
  const [activeIndex, selectSection] = useActiveSection(SECTION_PREFIX, groups.length);

  // Dishes that were deleted or sold out since they were added stay hidden from the order, so
  // drop them from the cart too; otherwise they would still count towards the 30-dish limit.
  useEffect(() => {
    if (menu.status !== 'ready') return;
    const orderable = new Set(menu.items.filter((item) => item.isAvailable).map((item) => item.id));
    Object.keys(lines)
      .filter((itemId) => !orderable.has(itemId))
      .forEach((itemId) => setQuantity(itemId, 0));
  }, [menu.status, menu.items, lines, setQuantity]);

  // Only dishes that are on the menu and available count; prices always come from the menu.
  const cart = useMemo(() => {
    const entries = menu.items
      .filter((item) => item.isAvailable && lines[item.id] > 0)
      .map((item) => ({ item, quantity: lines[item.id] }));
    return {
      entries,
      count: entries.reduce((sum, entry) => sum + entry.quantity, 0),
      total: entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0),
    };
  }, [menu.items, lines]);

  // Returns false when the cart refuses a new dish because the order already has the most
  // different dishes allowed; the toast says why (and is read out) instead of a false "added".
  const changeQuantity = (itemId, quantity) => {
    const isNewLine = quantity > 0 && !(itemId in lines);
    if (isNewLine && Object.keys(lines).length >= maxLines) {
      showToast(`${maxLines} different dishes is the most for one order.`);
      return false;
    }
    setQuantity(itemId, quantity);
    const item = menu.items.find((entry) => entry.id === itemId);
    if (item) {
      setAnnouncement(
        quantity > 0
          ? `${Math.min(quantity, maxQuantity)} ${item.name} in your order`
          : `${item.name} removed from your order`,
      );
    }
    return true;
  };

  const openOrder = (isOpen) => {
    setAnnouncement('');
    setIsOrderOpen(isOpen);
  };

  const jumpTo = (index) => {
    selectSection(index);
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(`${SECTION_PREFIX}-${index}`)
      ?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  };

  // Sends the cart as an order. On success the cart empties and the order status page opens.
  // A failure is thrown back to OrderSummary, which shows its message.
  const placeOrder = async (name) => {
    const order = {
      customerName: name,
      checkoutId: checkoutId.current,
      items: cart.entries.map(({ item, quantity }) => ({ menuItemId: item.id, qty: quantity })),
    };
    const send = async (isFresh) => sendOrder(slug, await ensureDeviceId({ isFresh }), order);
    try {
      let result;
      try {
        result = await send(false);
      } catch (err) {
        if (!DEVICE_ERRORS.includes(err.code)) throw err;
        result = await send(true);
      }
      clearCart();
      navigate(`/m/${slug}/order/${result.order.id}`);
    } catch (err) {
      // Reload the menu in place (no loading screen): sold-out dishes then leave the cart.
      if (MENU_ERRORS.includes(err.code)) setAttempt((count) => count + 1);
      // Show the links to the orders that are still open, so one can be paid.
      if (err.code === 'TOO_MANY_OPEN_ORDERS') setOpenOrdersLoad((count) => count + 1);
      throw err;
    }
  };

  if (menu.status === 'loading') {
    return (
      <div aria-busy="true">
        <div className="h-[280px] animate-pulse bg-primary sm:h-[340px]" />
        <p className="flex items-center justify-center gap-3 p-8 text-text-muted" role="status">
          <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          Opening the menu…
        </p>
      </div>
    );
  }

  if (menu.status === 'error') {
    const isMissing = menu.error.status === 404 || menu.error.status === 400;
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4">
        <h1 className="text-h1 font-bold">
          {isMissing ? 'We could not find this café' : 'The menu did not load'}
        </h1>
        {isMissing ? (
          <p className="text-text-muted">Check that you scanned the café's QR code.</p>
        ) : (
          <>
            <Alert>{menu.error.message}</Alert>
            <Button
              onClick={() => {
                setMenu(LOADING);
                setAttempt((count) => count + 1);
              }}
            >
              <RotateCw size={24} aria-hidden="true" />
              Try again
            </Button>
          </>
        )}
      </main>
    );
  }

  const { restaurant } = menu;
  const isOrderingOpen = restaurant.isAcceptingOrders;
  const orderSummary = (
    <OrderSummary
      cart={cart}
      maxQuantity={maxQuantity}
      isOrderingOpen={isOrderingOpen}
      customerName={customerName}
      onChangeQuantity={changeQuantity}
      onSaveName={saveName}
      onPlaceOrder={placeOrder}
    />
  );

  return (
    <>
      <MenuHero restaurant={restaurant} />
      {groups.length > 0 && (
        <CategoryTabs
          categories={groups.map(([category]) => category)}
          activeIndex={activeIndex}
          onSelect={jumpTo}
        />
      )}

      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-32 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:pb-12">
        <main ref={mainRef} tabIndex={-1} className="flex flex-col gap-8 outline-none">
          {openOrders.length > 0 && (
            <nav aria-label="Your orders" className="flex flex-col gap-2">
              {openOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/m/${slug}/order/${order.id}`}
                  className="flex min-h-13 items-center gap-3 rounded-card border border-border bg-surface p-4 font-semibold hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <ReceiptText size={24} className="shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    Your order <span className="tabular-nums">#{order.orderNumber}</span>:{' '}
                    {order.status === 'ready' ? 'ready, collect and pay' : 'being cooked'}
                  </span>
                  <ChevronRight size={24} className="shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          )}
          {!isOrderingOpen && (
            <Alert>This café is not taking orders right now. You can still look at the menu.</Alert>
          )}
          {groups.length === 0 && (
            <p className="text-text-muted">The menu is being prepared. Please check back soon.</p>
          )}
          {groups.map(([category, items], index) => (
            <section
              key={category}
              id={`${SECTION_PREFIX}-${index}`}
              aria-labelledby={`${SECTION_PREFIX}-${index}-title`}
              className="flex scroll-mt-16 flex-col gap-3"
            >
              <h2 id={`${SECTION_PREFIX}-${index}-title`} className="text-h2 font-bold break-words">
                {category}
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((item) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    quantity={lines[item.id] ?? 0}
                    maxQuantity={maxQuantity}
                    isOrderingOpen={isOrderingOpen}
                    onChangeQuantity={(quantity) => changeQuantity(item.id, quantity)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </main>

        <aside className="hidden lg:block" aria-label="Your order">
          <Card className="sticky top-20 flex flex-col gap-3">
            <h2 className="text-h2 font-bold">Your order</h2>
            {orderSummary}
          </Card>
        </aside>
      </div>

      <footer className="pb-28 text-center text-sm text-text-muted lg:pb-8">
        Menu by ScanServe
      </footer>

      <CartAnnouncer message={announcement} />
      {cart.count > 0 && (
        <CartBar count={cart.count} total={cart.total} onOpen={() => openOrder(true)} />
      )}
      {isOrderOpen && (
        <Sheet title="Your order" onClose={() => openOrder(false)}>
          <CartAnnouncer message={announcement} />
          {orderSummary}
          <Button variant="secondary" onClick={() => openOrder(false)}>
            Back to menu
          </Button>
        </Sheet>
      )}
    </>
  );
}
