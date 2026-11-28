import { Banknote, Copy, LoaderCircle, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../hooks/useToast.js';
import { formatRupees } from '../../lib/format.js';
import { upiPayLink } from '../../lib/upi.js';

const BUTTON_CLASSES =
  'inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-lg font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

// Pay after eating (PRD): shown once the order is ready. "Pay with UPI" opens the UPI app with
// the café's UPI ID and the amount filled in; afterwards the customer taps "I've paid by UPI".
// "Paying cash" is for paying at the counter. Both are trust-based: the owner sees the order
// leave the unpaid list. onPaid(method) marks it paid and throws a plain-language Error if not.
export default function PayPanel({ order, restaurant, onPaid }) {
  const { showToast } = useToast();
  const [payingWith, setPayingWith] = useState(null);
  const [error, setError] = useState('');
  const alertRef = useRef(null);

  useEffect(() => {
    if (error) alertRef.current?.focus();
  }, [error]);

  const upiLink = upiPayLink({
    upiId: restaurant.upiId,
    payeeName: restaurant.name,
    amount: order.total,
    note: `Order ${order.orderNumber}`,
  });

  const pay = async (method) => {
    if (payingWith) return;
    setPayingWith(method);
    setError('');
    try {
      await onPaid(method);
    } catch (err) {
      setError(err.message);
    } finally {
      setPayingWith(null);
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(restaurant.upiId);
      showToast('UPI ID copied');
    } catch {
      showToast('Could not copy. Please type the UPI ID.', 'error');
    }
  };

  return (
    <section
      aria-labelledby="pay-title"
      className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card"
    >
      <h2 id="pay-title" className="text-h1">
        Pay after eating
      </h2>
      <p className="text-[2.75rem] leading-none font-bold tabular-nums">
        {formatRupees(order.total)}
      </p>

      <a href={upiLink} className={BUTTON_CLASSES}>
        <Smartphone size={24} aria-hidden="true" />
        Pay with UPI
      </a>
      <div className="flex flex-wrap items-center gap-x-2 text-text-muted">
        <span>
          No UPI app opened? Pay {formatRupees(order.total)} to{' '}
          <strong className="wrap-anywhere text-text">{restaurant.upiId}</strong>
        </span>
        <button
          type="button"
          onClick={copyUpiId}
          className="inline-flex min-h-12 items-center gap-1 font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Copy size={20} aria-hidden="true" />
          Copy UPI ID
        </button>
      </div>

      {error && <Alert ref={alertRef}>{error}</Alert>}

      <p className="pt-2 font-semibold">After paying, tap one:</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          aria-disabled={payingWith !== null || undefined}
          onClick={() => pay('upi')}
        >
          {payingWith === 'upi' ? (
            <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          ) : (
            <Smartphone size={24} aria-hidden="true" />
          )}
          I&apos;ve paid by UPI
        </Button>
        <Button
          variant="secondary"
          aria-disabled={payingWith !== null || undefined}
          onClick={() => pay('cash')}
        >
          {payingWith === 'cash' ? (
            <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          ) : (
            <Banknote size={24} aria-hidden="true" />
          )}
          Paying cash
        </Button>
      </div>
    </section>
  );
}
