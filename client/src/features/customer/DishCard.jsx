import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import DishPhoto from '../../components/DishPhoto.jsx';
import Button from '../../components/ui/Button.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import VegMark from '../../components/ui/VegMark.jsx';
import { formatRupees } from '../../lib/format.js';

// One dish on the customer menu: photo (or letter tile), veg mark, name, one line about it,
// price, and the marigold Add button that turns into a − 2 + stepper.
export default function DishCard({
  item,
  quantity,
  maxQuantity,
  isOrderingOpen,
  onChangeQuantity,
}) {
  const isSoldOut = !item.isAvailable;
  const addRef = useRef(null);
  const plusRef = useRef(null);
  // Add and the stepper swap places, so the button that was pressed disappears. Focus moves
  // to the control that replaced it, but only when this card caused the change (not the sheet).
  const focusNext = useRef(null);

  useEffect(() => {
    const target = focusNext.current === 'add' ? addRef : plusRef;
    if (focusNext.current) target.current?.focus();
    focusNext.current = null;
  }, [quantity]);

  // onChangeQuantity returns false when the cart refused the change (order already full).
  const handleChange = (next) => {
    if (onChangeQuantity(next) === false) return;
    if (quantity === 0 && next > 0) focusNext.current = 'plus';
    if (quantity > 0 && next === 0) focusNext.current = 'add';
  };

  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-surface p-2 pb-3">
      <div className="relative">
        <DishPhoto name={item.name} photoUrl={item.photoUrl} isSoldOut={isSoldOut} />
        {isSoldOut && (
          <span className="absolute top-2 left-2 rounded-full bg-text/85 px-3 py-1 text-sm font-semibold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1">
        <h3 className="flex items-start gap-2 font-sans text-lg leading-snug font-semibold">
          <span className="mt-1">
            <VegMark isVeg={item.isVeg} />
          </span>
          <span
            className={`line-clamp-2 min-w-0 break-words ${isSoldOut ? 'text-text-muted' : ''}`}
          >
            {item.name}
          </span>
        </h3>
        {item.description && (
          <p className="line-clamp-2 text-sm break-words text-text-muted">{item.description}</p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <p className="font-display text-h2 font-bold tabular-nums">{formatRupees(item.price)}</p>
          {!isSoldOut &&
            isOrderingOpen &&
            (quantity > 0 ? (
              <QuantityStepper
                itemName={item.name}
                quantity={quantity}
                max={maxQuantity}
                onChange={handleChange}
                plusRef={plusRef}
              />
            ) : (
              <Button
                ref={addRef}
                variant="accent"
                aria-label={`Add ${item.name}`}
                onClick={() => handleChange(1)}
              >
                <Plus size={24} aria-hidden="true" />
                Add
              </Button>
            ))}
        </div>
      </div>
    </li>
  );
}
