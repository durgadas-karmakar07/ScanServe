import { Check, LoaderCircle } from 'lucide-react';
import { formatRupees } from '../../lib/format.js';

// Orders waiting longer than this show their time in amber (with the minutes, never colour alone).
const SLOW_MINUTES = 10;

function waitingFor(createdAt, now) {
  const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));
  return { minutes, label: minutes === 0 ? 'Just now' : `${minutes} min` };
}

// One order on the kitchen board (Design.md: dark card, huge number, one big Ready button).
export default function OrderCard({ order, now, isBusy, readyRef, onReady, onCancel }) {
  const waiting = waitingFor(order.createdAt, now);
  const isSlow = waiting.minutes >= SLOW_MINUTES;

  return (
    <li
      className="flex flex-col gap-4 rounded-card border border-stone-800 bg-kitchen-card p-4"
      aria-label={`Order ${order.orderNumber} for ${order.customerName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-display leading-none font-bold tabular-nums">
            #{order.orderNumber}
          </span>
          <span className="text-h2 font-semibold break-words">{order.customerName}</span>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-base font-semibold tabular-nums ${isSlow ? 'bg-warning text-white' : 'bg-stone-800 text-stone-300'}`}
        >
          {waiting.label}
          <span className="sr-only"> waiting</span>
        </span>
      </div>

      <ul className="flex flex-col gap-1 text-xl">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="break-words">
            <span className="font-bold tabular-nums">{item.qty} ×</span> {item.name}
          </li>
        ))}
      </ul>
      <p className="text-stone-400 tabular-nums">Total {formatRupees(order.total)}</p>

      <div className="mt-auto flex flex-col gap-2">
        <button
          ref={readyRef}
          type="button"
          aria-disabled={isBusy || undefined}
          onClick={() => !isBusy && onReady(order)}
          className="flex min-h-18 w-full items-center justify-center gap-3 rounded-full bg-success text-2xl font-bold text-white hover:bg-success/90 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isBusy ? (
            <LoaderCircle size={28} className="animate-spin" aria-hidden="true" />
          ) : (
            <Check size={28} aria-hidden="true" />
          )}
          Ready
          <span className="sr-only">: order {order.orderNumber}</span>
        </button>
        <button
          type="button"
          onClick={() => !isBusy && onCancel(order)}
          className="min-h-12 rounded-full text-lg font-semibold text-stone-400 underline underline-offset-4 hover:text-stone-50 focus-visible:outline-2 focus-visible:outline-white"
        >
          Cancel order<span className="sr-only"> {order.orderNumber}</span>
        </button>
      </div>
    </li>
  );
}
