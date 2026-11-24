import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import DishPhoto from '../../components/DishPhoto.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import VegMark from '../../components/ui/VegMark.jsx';
import { formatRupees } from '../../lib/format.js';

// One dish on the customer menu (Design.md, dish card): a dark card with the photo on top, the
// name and price in white, and a round white "+" that adds one. Once added, the "+" turns into
// a − 2 + stepper. Tapping the photo or name opens the dish page (onOpen).
export default function DishCard({
  item,
  quantity,
  maxQuantity,
  isOrderingOpen,
  onChangeQuantity,
  onOpen,
}) {
  const isSoldOut = !item.isAvailable;
  const canAdd = !isSoldOut && isOrderingOpen;
  const addRef = useRef(null);
  const plusRef = useRef(null);
  // "+" and the stepper swap places, so the button that was pressed disappears. Focus moves
  // to the control that replaced it, but only when this card caused the change.
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
    <li className="flex min-w-0 flex-col overflow-hidden rounded-card bg-night text-white shadow-card">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group flex flex-col text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
      >
        <span className="relative block overflow-hidden">
          <DishPhoto name={item.name} photoUrl={item.photoUrl} isSoldOut={isSoldOut} tone="dark" />
          <span className="absolute top-2 left-2 rounded-md bg-white p-0.5">
            <VegMark isVeg={item.isVeg} size={18} />
          </span>
          {isSoldOut && (
            <span className="absolute top-2 right-2 rounded-full bg-night/85 px-3 py-0.5 text-sm font-semibold">
              Sold out
            </span>
          )}
        </span>
        <span className="flex flex-col gap-0.5 px-3 pt-3">
          <span className="line-clamp-2 min-w-0 text-base leading-snug font-semibold break-words">
            {item.name}
            <span className="sr-only">: see details</span>
          </span>
        </span>
      </button>

      <div className="mt-auto flex flex-col gap-2 px-3 pt-1 pb-3">
        <div className="flex min-h-12 items-center justify-between gap-2">
          <span className="text-lg font-bold tabular-nums">{formatRupees(item.price)}</span>
          {canAdd && quantity === 0 && (
            <button
              ref={addRef}
              type="button"
              onClick={() => handleChange(1)}
              aria-label={`Add ${item.name}`}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-text hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Plus size={24} aria-hidden="true" />
            </button>
          )}
        </div>
        {canAdd && quantity > 0 && (
          <QuantityStepper
            tone="dark"
            itemName={item.name}
            quantity={quantity}
            max={maxQuantity}
            onChange={handleChange}
            plusRef={plusRef}
          />
        )}
      </div>
    </li>
  );
}
