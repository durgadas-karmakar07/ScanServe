import { Minus, Plus } from 'lucide-react';

const TONES = {
  // On cream or white: an olive wash.
  light: {
    wrap: 'bg-primary-soft text-text',
    button: 'hover:bg-primary hover:text-white focus-visible:outline-primary',
  },
  // On a dark dish card: a soft white wash.
  dark: {
    wrap: 'bg-white/12 text-white',
    button: 'hover:bg-white hover:text-text focus-visible:outline-white',
  },
};

// − 2 + control. Each button is 48px for thumbs. The page announces changes in one shared live
// region, so this control has none of its own. At the limit, + stays focusable (aria-disabled)
// instead of `disabled`, which would drop focus.
export default function QuantityStepper({
  itemName,
  quantity,
  max,
  onChange,
  plusRef,
  tone = 'light',
  min = 0,
}) {
  const isAtMax = quantity >= max;
  const isAtMin = quantity <= min;
  const colours = TONES[tone];
  const buttonClass = `flex size-12 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 ${colours.button}`;

  return (
    <div className={`flex w-full items-center justify-between rounded-full ${colours.wrap}`}>
      <button
        type="button"
        className={`${buttonClass} ${isAtMin ? 'cursor-not-allowed' : ''}`}
        aria-label={`Remove one ${itemName}`}
        aria-disabled={isAtMin || undefined}
        onClick={() => !isAtMin && onChange(quantity - 1)}
      >
        <Minus size={22} aria-hidden="true" className={isAtMin ? 'opacity-40' : undefined} />
      </button>
      <span className="text-xl font-bold tabular-nums">
        {quantity}
        <span className="sr-only"> {itemName}</span>
      </span>
      <button
        ref={plusRef}
        type="button"
        className={`${buttonClass} ${isAtMax ? 'cursor-not-allowed' : ''}`}
        aria-label={
          isAtMax ? `Add one more ${itemName}, ${max} is the most` : `Add one more ${itemName}`
        }
        aria-disabled={isAtMax || undefined}
        onClick={() => !isAtMax && onChange(quantity + 1)}
      >
        {/* Only the icon fades at the limit, so the focus ring stays full strength. */}
        <Plus size={22} aria-hidden="true" className={isAtMax ? 'opacity-40' : undefined} />
      </button>
    </div>
  );
}
