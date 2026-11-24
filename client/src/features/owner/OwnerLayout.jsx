import { ChefHat, LogOut, QrCode, Settings, UtensilsCrossed } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import Button from '../../components/ui/Button.jsx';
import Wordmark from '../../components/Wordmark.jsx';
import { useAuth } from '../../hooks/useAuth.js';

// Kitchen opens the full-screen live board (/kitchen) for the cooking counter.
const TABS = [
  { to: '/kitchen', label: 'Kitchen', Icon: ChefHat },
  { to: '/owner/menu', label: 'Menu', Icon: UtensilsCrossed },
  { to: '/owner/qr', label: 'QR poster', Icon: QrCode },
  { to: '/owner/settings', label: 'Settings', Icon: Settings },
];

const tabClass = ({ isActive }) =>
  `flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-full lg:px-4 lg:text-lg ${isActive ? 'text-primary lg:bg-primary-soft' : 'text-text-muted hover:text-text'}`;

// Owner area frame (Design.md): bottom tabs on phones and tablets, a side menu on desktop.
export default function OwnerLayout() {
  const { restaurant, logout } = useAuth();
  const initial = restaurant.name.trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[1024px] lg:flex lg:gap-8 lg:px-6">
      <nav
        aria-label="Owner sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-0 lg:bg-transparent lg:py-8 print:hidden"
      >
        <div className="mb-8 hidden lg:block">
          <Wordmark />
        </div>
        <ul className="grid grid-cols-4 lg:flex lg:flex-col lg:gap-1">
          {TABS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink to={to} className={tabClass}>
                <Icon size={24} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto flex w-full max-w-[640px] min-w-0 flex-col gap-6 px-4 pt-5 pb-28 lg:max-w-none lg:px-0 lg:py-8 print:max-w-none print:p-0">
        <header className="flex items-center gap-3 print:hidden">
          {restaurant.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt=""
              className="size-12 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-h2 font-bold text-white"
            >
              {initial}
            </span>
          )}
          <p className="line-clamp-2 min-w-0 flex-1 font-display text-h2 leading-tight font-bold break-words">
            {restaurant.name}
          </p>
          <Button variant="secondary" isFullWidth={false} onClick={logout}>
            <LogOut size={24} aria-hidden="true" />
            Log out
          </Button>
        </header>
        <main className="flex flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
