import { LogOut, QrCode, Settings, UtensilsCrossed } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const TABS = [
  { to: '/owner/menu', label: 'Menu', Icon: UtensilsCrossed },
  { to: '/owner/qr', label: 'QR poster', Icon: QrCode },
  { to: '/owner/settings', label: 'Settings', Icon: Settings },
];

const tabClass = ({ isActive }) =>
  `flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-xl lg:px-4 lg:text-lg ${isActive ? 'text-primary lg:bg-primary-soft' : 'text-text-muted hover:text-text'}`;

// Owner area frame (Design.md): bottom tabs on phones and tablets, a side menu on desktop.
export default function OwnerLayout() {
  const { restaurant, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-[1024px] lg:flex lg:gap-8 lg:px-6">
      <nav
        aria-label="Owner sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:static lg:w-56 lg:shrink-0 lg:border-0 lg:bg-transparent lg:py-8 print:hidden"
      >
        <ul className="grid grid-cols-3 lg:flex lg:flex-col lg:gap-1">
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

      <div className="mx-auto flex w-full max-w-[640px] min-w-0 flex-col gap-6 px-4 pt-6 pb-28 lg:max-w-none lg:px-0 lg:py-8 print:max-w-none print:p-0">
        <header className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex min-w-0 flex-col">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Owner dashboard
            </p>
            <p className="font-semibold break-words">{restaurant.name}</p>
          </div>
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
