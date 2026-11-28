import { LoaderCircle, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import VegMark from '../../components/ui/VegMark.jsx';
import { formatRupees } from '../../lib/format.js';
import NameStep from './NameStep.jsx';

// The order list with steppers, the total and Place order, used in the phone sheet and the
// desktop panel. The first order asks for a name (NameStep); after that the saved name is used.
// onPlaceOrder(name) places the order and throws an Error with a plain message if it fails.
export default function OrderSummary({
  cart,
  maxQuantity,
  isOrderingOpen,
  customerName,
  onChangeQuantity,
  onSaveName,
  onPlaceOrder,
}) {
  const rootRef = useRef(null);
  const alertRef = useRef(null);
  const [isAskingName, setIsAskingName] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const placeButtonRef = useRef(null);
  // Back on the name step removes that form, so focus returns to Place order.
  const focusPlaceNext = useRef(false);

  useEffect(() => {
    if (isAskingName || !focusPlaceNext.current) return;
    focusPlaceNext.current = false;
    placeButtonRef.current?.focus();
  }, [isAskingName]);
  // When − removes a line, its buttons vanish. Focus moves to the line that took its place,
  // or the one above, or the empty message, so keyboard and screen reader users are not lost.
  const removedIndex = useRef(null);

  useEffect(() => {
    if (removedIndex.current === null) return;
    const lines = rootRef.current?.querySelectorAll('li') ?? [];
    const line = lines[Math.min(removedIndex.current, lines.length - 1)];
    (line?.querySelector('button') ?? rootRef.current)?.focus();
    removedIndex.current = null;
  }, [cart.entries.length]);

  const handleChange = (index, itemId, next) => {
    if (next === 0) removedIndex.current = index;
    setPlaceError('');
    onChangeQuantity(itemId, next);
  };

  useEffect(() => {
    if (placeError) alertRef.current?.focus();
  }, [placeError]);

  // On success the page moves to the order status screen, so only failures update this view.
  const place = async (name) => {
    if (isPlacing) return;
    setIsPlacing(true);
    setPlaceError('');
    try {
      await onPlaceOrder(name);
    } catch (err) {
      setPlaceError(err.message);
      setIsPlacing(false);
    }
  };

  const handlePlaceClick = () => {
    if (customerName) place(customerName);
    else setIsAskingName(true);
  };

  const handleName = (name) => {
    onSaveName(name);
    setIsAskingName(false);
    place(name);
  };

  // The error stays above both views: a sold-out dish can empty the cart when the menu reloads,
  // and the customer still needs to see why.
  return (
    <div ref={rootRef} tabIndex={-1} className="flex flex-col gap-4 outline-none">
      {placeError && <Alert ref={alertRef}>{placeError}</Alert>}
      {cart.entries.length === 0 ? (
        <p className="text-text-muted">
          Your order is empty. Tap <strong className="text-text">+</strong> on a dish to start.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-border">
            {cart.entries.map(({ item, quantity }, index) => (
              <li key={item.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2">
                    <span className="mt-1">
                      <VegMark isVeg={item.isVeg} />
                    </span>
                    <span className="min-w-0 font-semibold break-words">{item.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatRupees(item.price * quantity)}
                  </span>
                </div>
                <div className="w-44">
                  <QuantityStepper
                    itemName={item.name}
                    quantity={quantity}
                    max={maxQuantity}
                    onChange={(next) => handleChange(index, item.id, next)}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="text-[1.75rem] leading-none font-bold tabular-nums">
              {formatRupees(cart.total)}
            </span>
          </div>
          {!isOrderingOpen ? (
            <p className="text-text-muted">This café is not taking orders right now.</p>
          ) : isAskingName ? (
            <NameStep
              initialName={customerName ?? ''}
              isPlacing={isPlacing}
              onSubmit={handleName}
              onCancel={() => {
                focusPlaceNext.current = true;
                setIsAskingName(false);
              }}
            />
          ) : (
            <>
              {customerName && (
                <p className="flex flex-wrap items-center gap-x-2 text-text-muted">
                  <span>
                    Order for <strong className="text-text">{customerName}</strong>
                  </span>
                  <button
                    type="button"
                    className="min-h-12 font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => !isPlacing && setIsAskingName(true)}
                  >
                    Change name
                  </button>
                </p>
              )}
              <Button
                ref={placeButtonRef}
                variant="primary"
                aria-disabled={isPlacing || undefined}
                onClick={handlePlaceClick}
              >
                {isPlacing ? (
                  <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
                ) : (
                  <ShoppingBag size={24} aria-hidden="true" />
                )}
                {isPlacing ? 'Placing order…' : 'Place order'}
              </Button>
            </>
          )}
          <p className="text-sm text-text-muted">You pay after eating: UPI or cash.</p>
        </div>
      )}
    </div>
  );
}
