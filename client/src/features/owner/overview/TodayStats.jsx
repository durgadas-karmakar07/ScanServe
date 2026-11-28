import { ChefHat, IndianRupee, ReceiptIndianRupee, RotateCw, ShoppingBag } from 'lucide-react';
import Alert from '../../../components/ui/Alert.jsx';
import Button from '../../../components/ui/Button.jsx';
import { formatRupees } from '../../../lib/format.js';
import StatCard from './StatCard.jsx';

// Today's numbers from GET /api/orders/summary (loaded by the owner layout). If the first load
// fails, say so with Try again instead of an endless "…"; if a refresh fails, keep the last
// numbers but say they may be out of date.
export default function TodayStats({ summary, error, onRetry }) {
  if (!summary && error) {
    return (
      <section aria-label="Today" className="flex flex-col gap-3">
        <Alert>Today&apos;s numbers did not load. {error.message}</Alert>
        <Button variant="secondary" isFullWidth={false} onClick={onRetry} className="self-start">
          <RotateCw size={24} aria-hidden="true" />
          Try again
        </Button>
      </section>
    );
  }

  const today = summary?.today;
  const open = summary?.open;
  return (
    <section aria-label="Today" className="flex flex-col gap-3">
      {summary && error && (
        <p className="flex flex-wrap items-center gap-x-3 text-text-muted" role="status">
          Could not refresh these numbers.
          <button
            type="button"
            onClick={onRetry}
            className="min-h-12 font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Try again
          </button>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          Icon={ShoppingBag}
          label="Orders today"
          value={today ? today.orders : '…'}
          hint={
            today?.cancelled ? `${today.cancelled} cancelled` : 'Order numbers start at 1 each day'
          }
        />
        <StatCard
          Icon={IndianRupee}
          label="Collected today"
          value={today ? formatRupees(today.paidAmount) : '…'}
          hint={
            today
              ? `Cash ${formatRupees(today.cashAmount)} · UPI ${formatRupees(today.upiAmount)}`
              : null
          }
        />
        <StatCard
          Icon={ReceiptIndianRupee}
          label="Unpaid"
          value={open ? formatRupees(open.unpaidAmount) : '…'}
          hint={
            open
              ? `${open.readyCount} ${open.readyCount === 1 ? 'order' : 'orders'} to collect`
              : null
          }
          to="/owner/unpaid"
        />
        <StatCard
          Icon={ChefHat}
          label="In the kitchen"
          value={open ? open.newCount : '…'}
          hint="Waiting to be made"
          to="/kitchen"
        />
      </div>
    </section>
  );
}
