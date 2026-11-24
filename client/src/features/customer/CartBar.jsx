import { ArrowRight } from 'lucide-react';
import { formatRupees } from '../../lib/format.js';

// Phones and tablets: a dark pill at the bottom with the count and total, and an orange
// "View order" that opens the order sheet.
export default function CartBar({ count, total, onOpen }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden">
      <div className="mx-auto flex max-w-[640px] items-center justify-between gap-3 rounded-full bg-night py-2 pr-2 pl-6 text-white shadow-[0_12px_32px_rgb(28_23_20/0.35)]">
        <p className="flex flex-col leading-tight">
          <span className="text-sm text-white/70">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          <span className="text-xl font-bold tabular-nums">{formatRupees(total)}</span>
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-13 items-center gap-2 rounded-full bg-accent pr-2 pl-5 text-lg font-semibold hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          View order
          <span className="flex size-9 items-center justify-center rounded-full bg-night/30">
            <ArrowRight size={20} aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  );
}
