import { Minus, Plus } from 'lucide-react';

// − 2 + control on a marigold wash. Each button is 48px for thumbs. The page announces changes
// in one shared live region, so this control has none of its own.
// At the limit, + stays focusable (aria-disabled) instead of `disabled`, which would drop focus.
export default function QuantityStepper({ itemName, quantity, max, onChange, plusRef }) {
  const isAtMax = quantity >= max;
  const buttonClass =
    'flex size-12 items-center justify-center rounded-full text-text focus-visible:outline-2 focus-visible:outline-primary';

  return (
    <div className="flex w-full items-center justify-between rounded-full bg-accent-soft">
      <button
        type="button"
        className={`${buttonClass} hover:bg-accent`}
        aria-label={`Remove one ${itemName}`}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus size={24} aria-hidden="true" />
      </button>
      <span className="font-display text-h2 font-bold tabular-nums">
        {quantity}
        <span className="sr-only"> {itemName} in your order</span>
      </span>
      <button
        ref={plusRef}
        type="button"
        className={`${buttonClass} ${isAtMax ? 'cursor-not-allowed' : 'hover:bg-accent'}`}
        aria-label={
          isAtMax ? `Add one more ${itemName}, ${max} is the most` : `Add one more ${itemName}`
        }
        aria-disabled={isAtMax || undefined}
        onClick={() => !isAtMax && onChange(quantity + 1)}
      >
        {/* Only the icon fades at the limit, so the focus ring stays full strength. */}
        <Plus size={24} aria-hidden="true" className={isAtMax ? 'opacity-40' : undefined} />
      </button>
    </div>
  );
}
