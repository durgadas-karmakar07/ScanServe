import { ShoppingBag } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Button from '../../components/ui/Button.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import VegMark from '../../components/ui/VegMark.jsx';
import { formatRupees } from '../../lib/format.js';

// The order list with steppers and the total, used in the phone sheet and the desktop panel.
// Placing the order arrives with step 1.5; until then the list can be shown at the counter.
export default function OrderSummary({ cart, maxQuantity, onChangeQuantity }) {
  const rootRef = useRef(null);
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
    onChangeQuantity(itemId, next);
  };

  return (
    <div ref={rootRef} tabIndex={-1} className="outline-none">
      {cart.entries.length === 0 ? (
        <p className="text-text-muted">
          Your order is empty. Tap <strong className="text-text">Add</strong> on a dish to start.
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
            <span className="font-display text-h1 font-bold tabular-nums">
              {formatRupees(cart.total)}
            </span>
          </div>
          <Button variant="accent" disabled>
            <ShoppingBag size={24} aria-hidden="true" />
            Place order
          </Button>
          <p className="text-sm text-text-muted">
            Online ordering opens soon. For now, show this list at the counter.
          </p>
        </div>
      )}
    </div>
  );
}
