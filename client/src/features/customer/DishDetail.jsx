import { ArrowLeft } from 'lucide-react';
import { useId, useState } from 'react';
import DishPhoto from '../../components/DishPhoto.jsx';
import Button from '../../components/ui/Button.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import VegMark from '../../components/ui/VegMark.jsx';
import { useModalDialog } from '../../hooks/useModalDialog.js';
import { formatRupees } from '../../lib/format.js';

// The dish page (Design.md): a full-screen view on phones (a centred card on larger screens)
// with the big photo, the name in the serif face, its category, price and description, and at
// the bottom a quantity control with "Add to order | ₹total". It is a native <dialog>, so the
// Android back gesture and Escape close it, and focus returns to the dish card.
// onSetQuantity(n) sets the dish's quantity in the cart and returns false if the cart refused.
// isOrderFull: the dish is not in the order and the order already has maxLines dishes.
// Everything outside a modal dialog is hidden (and drawn under it), so the page's toast and
// live region cannot be seen or heard here: this dialog says things itself.
export default function DishDetail({
  item,
  quantity,
  maxQuantity,
  maxLines,
  isOrderFull,
  isOrderingOpen,
  onSetQuantity,
  onClose,
}) {
  const dialogRef = useModalDialog();
  const titleId = useId();
  const isInCart = quantity > 0;
  const [count, setCount] = useState(isInCart ? quantity : 1);
  // Read out by screen readers after each + / −; empty on open so nothing is read then.
  const [countMessage, setCountMessage] = useState('');
  const [isRefused, setIsRefused] = useState(false);
  const canOrder = item.isAvailable && isOrderingOpen;
  const fullMessage = `Your order already has ${maxLines} different dishes, the most for one order. Place it, or remove a dish first.`;

  // Closing the dialog fires its close event, which calls onClose.
  const close = () => dialogRef.current?.close();

  const changeCount = (next) => {
    setCount(next);
    setCountMessage(`${next} ${item.name}, ${formatRupees(item.price * next)}`);
  };

  const confirm = () => {
    if (onSetQuantity(count) === false) {
      setIsRefused(true);
      return;
    }
    close();
  };

  const remove = () => {
    onSetQuantity(0);
    close();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-bg p-0 text-text backdrop:bg-night/70 sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:max-w-[520px] sm:rounded-[1.75rem]"
    >
      <div className="flex h-full flex-col sm:max-h-[92dvh]">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative">
            <DishPhoto
              name={item.name}
              photoUrl={item.photoUrl}
              isSoldOut={!item.isAvailable}
              variant="hero"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Back to the menu"
              className="absolute top-4 left-4 flex size-12 items-center justify-center rounded-full bg-white/90 text-text shadow-card backdrop-blur hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-3 px-5 pt-6 pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 id={titleId} className="text-h1 break-words">
                  {item.name}
                </h2>
                <p className="text-eyebrow font-semibold break-words text-text-muted uppercase">
                  {item.category}
                </p>
              </div>
              <VegMark isVeg={item.isVeg} size={24} />
            </div>
            <p className="text-h2 font-bold tabular-nums">{formatRupees(item.price)}</p>
            {item.description && <p className="break-words text-text-muted">{item.description}</p>}
            {!item.isAvailable && (
              <p className="font-semibold text-danger">
                Sold out today. Please choose another dish.
              </p>
            )}
            {item.isAvailable && !isOrderingOpen && (
              <p className="font-semibold text-text-muted">
                This café is not taking orders right now.
              </p>
            )}
            {canOrder && isInCart && (
              <button
                type="button"
                onClick={remove}
                className="min-h-12 self-start font-semibold text-danger underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-danger"
              >
                Remove from order
              </button>
            )}
          </div>
        </div>

        <p className="sr-only" role="status">
          {countMessage}
        </p>
        {canOrder && isOrderFull && (
          <p className="border-t border-border bg-surface-warm p-4 font-semibold">{fullMessage}</p>
        )}
        {canOrder && !isOrderFull && isRefused && (
          <p role="alert" className="border-t border-border px-4 pt-3 font-semibold text-danger">
            {fullMessage}
          </p>
        )}
        {canOrder && !isOrderFull && (
          <div className="flex items-center gap-2.5 border-t border-border bg-surface-warm p-4">
            {/* Two 48px buttons and the number: as narrow as it can be, so the button keeps its words at 360px */}
            <div className="w-31 shrink-0">
              <QuantityStepper
                itemName={item.name}
                quantity={count}
                min={1}
                max={maxQuantity}
                onChange={changeCount}
              />
            </div>
            <Button size="compact" onClick={confirm} className="min-w-0">
              <span className="truncate">{isInCart ? 'Update order' : 'Add to order'}</span>
              <span aria-hidden="true" className="h-5 w-px shrink-0 bg-white/40" />
              <span className="shrink-0 tabular-nums">{formatRupees(item.price * count)}</span>
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
