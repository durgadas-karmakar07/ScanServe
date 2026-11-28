import { ChefHat, ExternalLink, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import MenuSection from './overview/MenuSection.jsx';
import OrderQueue from './overview/OrderQueue.jsx';
import TodayStats from './overview/TodayStats.jsx';

const CLOCK_TICK_MS = 30_000;

function greeting(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// /owner/overview — the owner's dashboard (Design.md): today's numbers, the live order queue
// and the menu as product cards with a quick "available" switch. Live updates come from the
// layout's connection (liveTick changes after order events).
export default function OverviewPage() {
  const { staff, restaurant } = useAuth();
  const { summary, summaryError, refreshSummary, liveTick } = useOutletContext();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = `Overview · ${restaurant.name}`;
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, [restaurant.name]);

  const firstName = staff.name.trim().split(/\s+/)[0];
  const today = new Date(now);
  const secondaryLink =
    'inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-5 font-semibold hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-eyebrow font-semibold text-text-muted uppercase">
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-h1 break-words">
            {greeting(today)}, {firstName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/kitchen"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChefHat size={20} aria-hidden="true" />
            Open kitchen
          </Link>
          <a
            href={`/m/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryLink}
          >
            <ExternalLink size={20} aria-hidden="true" />
            Customer menu
          </a>
          <Link to="/owner/qr" className={secondaryLink}>
            <QrCode size={20} aria-hidden="true" />
            QR poster
          </Link>
        </div>
      </div>

      <TodayStats summary={summary} error={summaryError} onRetry={refreshSummary} />
      <OrderQueue liveTick={liveTick} now={now} />
      <MenuSection />
    </>
  );
}
