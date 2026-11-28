import { Link } from 'react-router';
import { formatRupees } from '../../../lib/format.js';
import { timeAgo } from '../../../lib/timeAgo.js';

// An order in the live queue: number and time, the customer's name, its status and size.
// Cooking cards say when the order was placed; ready cards say when it became ready (they can
// wait days to be paid). Chip text is dark enough on its tint for WCAG AA.
export default function QueueCard({ order, now }) {
  const isReady = order.status === 'ready';
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const when = isReady
    ? `Ready ${timeAgo(order.readyAt ?? order.createdAt, now)}`
    : timeAgo(order.createdAt, now);
  return (
    <li className="w-64 shrink-0 snap-start">
      <Link
        to={isReady ? '/owner/unpaid' : '/kitchen'}
        className="flex h-full flex-col gap-3 rounded-card bg-surface p-4 shadow-card hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex items-center justify-between gap-2 text-sm">
          <span className="font-bold text-accent tabular-nums">#{order.orderNumber}</span>
          <span className="text-text-muted first-letter:uppercase">{when}</span>
        </span>
        <span className="line-clamp-1 text-lg font-semibold break-words">{order.customerName}</span>
        <span className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isReady ? 'bg-success text-white' : 'bg-accent-soft text-accent-hover'}`}
          >
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${isReady ? 'bg-white' : 'animate-pulse bg-accent'}`}
            />
            {isReady ? 'Ready · unpaid' : 'Cooking'}
          </span>
          <span className="text-sm text-text-muted tabular-nums">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatRupees(order.total)}
          </span>
        </span>
      </Link>
    </li>
  );
}
