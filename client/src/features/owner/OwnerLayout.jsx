import {
  ChefHat,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  QrCode,
  ReceiptIndianRupee,
  Settings,
  UtensilsCrossed,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { getOrderSummary } from '../../api/orders.js';
import Wordmark from '../../components/Wordmark.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocket } from '../../hooks/useSocket.js';

// isTab: also shown in the phone's bottom tabs (QR poster is reached from Overview and Settings
// there, so five tabs fit). badge: which live count to show next to it.
const NAV = [
  { to: '/owner/overview', label: 'Overview', Icon: LayoutDashboard, isTab: true },
  { to: '/kitchen', label: 'Kitchen', Icon: ChefHat, isTab: true, badge: 'newCount' },
  {
    to: '/owner/unpaid',
    label: 'Unpaid',
    Icon: ReceiptIndianRupee,
    isTab: true,
    badge: 'readyCount',
  },
  { to: '/owner/menu', label: 'Menu', Icon: UtensilsCrossed, isTab: true },
  { to: '/owner/qr', label: 'QR poster', Icon: QrCode, isTab: false },
  { to: '/owner/settings', label: 'Settings', Icon: Settings, isTab: true },
];

function CafeMark({ restaurant, className }) {
  if (restaurant.logoUrl) {
    return (
      <img
        src={restaurant.logoUrl}
        alt=""
        className={`shrink-0 rounded-full border border-white/20 bg-white object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-serif text-white ${className}`}
    >
      {restaurant.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

// Owner area frame (Design.md, owner dashboard): a dark sidebar on desktop like a kitchen
// dashboard, and on phones a top bar with bottom tabs. It keeps one live connection for the
// counts in the menu (orders waiting in the kitchen, ready but unpaid) and passes them, with a
// tick that changes on every live event, to the page inside (Outlet context).
export default function OwnerLayout() {
  const { restaurant, logout, token, withAuth } = useAuth();
  const location = useLocation();
  const [summary, setSummary] = useState(null);
  const [liveTick, setLiveTick] = useState(0);
  const bump = useCallback(() => setLiveTick((tick) => tick + 1), []);

  useSocket(token ? { token } : null, {
    onConnect: bump,
    // The login is no longer valid: the next request answers 401, which logs out.
    onRefused: bump,
    'order:new': bump,
    'order:ready': bump,
    'order:paid': bump,
    'order:cancelled': bump,
  });

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getOrderSummary, { signal: controller.signal })
      .then(setSummary)
      // The counts are a convenience; the pages show their own errors.
      .catch(() => {});
    return () => controller.abort();
  }, [withAuth, liveTick, location.pathname]);

  const countFor = (key) => (key && summary ? summary.open[key] : 0);
  const menuLink = `/m/${restaurant.slug}`;

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="hidden print:hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:shrink-0 lg:flex-col lg:bg-night lg:p-5 lg:text-white">
        <Wordmark tone="dark" />
        <p className="mt-9 mb-2 px-3 text-eyebrow font-semibold text-white/45 uppercase">Manage</p>
        <nav aria-label="Owner sections">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ to, label, Icon, badge }) => {
              const count = countFor(badge);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={22}
                          aria-hidden="true"
                          className={isActive ? 'text-[#f08a5d]' : undefined}
                        />
                        <span className="flex-1">{label}</span>
                        {count > 0 && (
                          <span className="min-w-7 rounded-full bg-accent px-2 text-center text-sm leading-6 tabular-nums">
                            {count}
                            <span className="sr-only"> waiting</span>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <CafeMark restaurant={restaurant} className="size-11 text-h2" />
            <p className="line-clamp-2 min-w-0 font-semibold break-words">{restaurant.name}</p>
          </div>
          <a
            href={menuLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 text-base font-semibold text-white/85 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ExternalLink size={18} aria-hidden="true" />
            Customer menu
          </a>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-base font-semibold text-white/65 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <LogOut size={18} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur print:hidden lg:hidden">
          <CafeMark restaurant={restaurant} className="size-10 text-lg" />
          <p className="line-clamp-1 min-w-0 flex-1 font-serif text-h2 break-words">
            {restaurant.name}
          </p>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-4 font-semibold hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-primary"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="max-[359px]:sr-only">Log out</span>
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pt-5 pb-28 lg:px-10 lg:py-8 print:max-w-none print:p-0">
          <Outlet context={{ summary, liveTick }} />
        </main>
      </div>

      <nav
        aria-label="Owner sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur print:hidden lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.filter((item) => item.isTab).map(({ to, label, Icon, badge }) => {
            const count = countFor(badge);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `relative flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${isActive ? 'text-primary' : 'text-text-muted hover:text-text'}`
                  }
                >
                  <span className="relative">
                    <Icon size={24} aria-hidden="true" />
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-3 min-w-5 rounded-full bg-accent px-1 text-center text-xs leading-5 text-white tabular-nums">
                        {count}
                        <span className="sr-only"> waiting</span>
                      </span>
                    )}
                  </span>
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
