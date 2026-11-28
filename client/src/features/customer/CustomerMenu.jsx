import { ChevronRight, LoaderCircle, ReceiptText, RotateCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getMyOpenOrders, placeOrder as sendOrder } from '../../api/orders.js';
import { getPublicMenu } from '../../api/public.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Sheet from '../../components/ui/Sheet.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useDevice } from '../../hooks/useDevice.js';
import { useToast } from '../../hooks/useToast.js';
import { groupByCategory } from '../../lib/menu.js';
import { readDeviceId } from '../../lib/deviceStorage.js';
import CartBar from './CartBar.jsx';
import CategoryChips from './CategoryChips.jsx';
import DishCard from './DishCard.jsx';
import DishDetail from './DishDetail.jsx';
import MenuHero from './MenuHero.jsx';
import OrderSummary from './OrderSummary.jsx';

const MENU_ID = 'our-menu';
// Height of the sticky chip bar (48px chips + 12px padding above and below); the sections'
// scroll-mt-18 (72px) keeps a scrolled-to section from hiding under it.
const CHIPS_HEIGHT_PX = 72;
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
  // null = All. A category that disappears after a menu reload falls back to All.
  const [category, setCategory] = useState(null);
  const visibleGroups = groups.filter(([name]) => category === null || name === category);
  const shownGroups = visibleGroups.length > 0 ? visibleGroups : groups;
  const listStartRef = useRef(null);

  // If the customer has scrolled into the list (the chips are stuck at the top), bring the start
  // of the chosen category back up under the chips; otherwise they land mid-list.
  const chooseCategory = (name) => {
    setCategory(name);
    requestAnimationFrame(() => {
      const listStart = listStartRef.current;
      if (!listStart || listStart.getBoundingClientRect().top >= CHIPS_HEIGHT_PX) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      listStart.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  };
  // The dish whose page is open, if any.
  const [detailItem, setDetailItem] = useState(null);

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
        <div className="h-[min(64dvh,560px)] animate-pulse bg-night" />
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
        <h1 className="text-h1">
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
      <MenuHero restaurant={restaurant} menuId={MENU_ID} />

      {/* The cream menu panel slides up over the photo, like the reference layout. */}
      <div className="relative z-10 -mt-8 rounded-t-[2rem] bg-bg">
        <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-32 sm:px-8 lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 lg:pb-12">
          <main
            id={MENU_ID}
            ref={mainRef}
            tabIndex={-1}
            className="flex min-w-0 scroll-mt-0 flex-col gap-5 outline-none"
          >
            {openOrders.length > 0 && (
              <nav aria-label="Your orders" className="flex flex-col gap-2">
                {openOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/m/${slug}/order/${order.id}`}
                    className="flex min-h-13 items-center gap-3 rounded-card bg-surface p-4 font-semibold shadow-card hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <ReceiptText size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      Your order <span className="tabular-nums">#{order.orderNumber}</span>
                      <span className="block text-base font-normal text-text-muted">
                        {order.status === 'ready' ? 'Ready: collect it, then pay' : 'Being cooked'}
                      </span>
                    </span>
                    <ChevronRight
                      size={24}
                      className="shrink-0 text-text-muted"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            )}
            {!isOrderingOpen && (
              <Alert>
                This café is not taking orders right now. You can still look at the menu.
              </Alert>
            )}

            <div className="flex flex-col gap-1">
              <h2 className="text-h1">Our menu</h2>
              <p className="text-text-muted">
                {menu.items.length === 1 ? '1 dish' : `${menu.items.length} dishes`} · Order now,
                pay after eating
              </p>
            </div>

            {groups.length > 0 && (
              <CategoryChips
                categories={groups.map(([name]) => name)}
                selected={visibleGroups.length > 0 ? category : null}
                onSelect={chooseCategory}
              />
            )}

            {groups.length === 0 && (
              <p className="text-text-muted">The menu is being prepared. Please check back soon.</p>
            )}
            {shownGroups.map(([name, items], index) => (
              <section
                key={name}
                ref={index === 0 ? listStartRef : undefined}
                aria-label={name}
                className="flex scroll-mt-18 flex-col gap-3"
              >
                <h3 className="font-serif text-h2 break-words">{name}</h3>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {items.map((item) => (
                    <DishCard
                      key={item.id}
                      item={item}
                      quantity={lines[item.id] ?? 0}
                      maxQuantity={maxQuantity}
                      isOrderingOpen={isOrderingOpen}
                      onChangeQuantity={(quantity) => changeQuantity(item.id, quantity)}
                      onOpen={setDetailItem}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </main>

          <aside className="hidden lg:block" aria-label="Your order">
            <Card className="sticky top-6 flex flex-col gap-3 shadow-card">
              <h2 className="text-h1">Your order</h2>
              {orderSummary}
            </Card>
          </aside>
        </div>

        <footer className="pb-28 text-center text-sm text-text-muted lg:pb-8">
          Menu by ScanServe
        </footer>
      </div>

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
      {detailItem && (
        <DishDetail
          item={detailItem}
          quantity={lines[detailItem.id] ?? 0}
          maxQuantity={maxQuantity}
          maxLines={maxLines}
          isOrderFull={!(detailItem.id in lines) && Object.keys(lines).length >= maxLines}
          isOrderingOpen={isOrderingOpen}
          onSetQuantity={(quantity) => changeQuantity(detailItem.id, quantity)}
          onClose={() => setDetailItem(null)}
        />
      )}
    </>
  );
}
