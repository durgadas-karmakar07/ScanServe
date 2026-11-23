import { ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { formatRupees } from '../../lib/format.js';

// Phones and tablets: chalkboard bar at the bottom with the count, total and "View order".
export default function CartBar({ count, total, onOpen }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden">
      <div className="mx-auto flex max-w-[640px] items-center justify-between gap-3 rounded-full bg-primary py-2 pr-2 pl-6 text-white shadow-lg">
        <p className="flex flex-col leading-tight">
          <span className="text-sm text-white/80">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          <span className="font-display text-h2 font-bold tabular-nums">{formatRupees(total)}</span>
        </p>
        <Button variant="accent" isFullWidth={false} onClick={onOpen}>
          <ShoppingBag size={24} aria-hidden="true" />
          View order
        </Button>
      </div>
    </div>
  );
}
