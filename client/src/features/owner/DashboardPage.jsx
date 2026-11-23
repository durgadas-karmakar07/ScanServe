import { LogOut } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../hooks/useAuth.js';

// First version of the owner dashboard (step 1.2): café details and log out.
// The menu editor, QR poster and settings tabs arrive in step 1.3.
export default function DashboardPage() {
  const { staff, restaurant, logout } = useAuth();
  const menuLink = `${window.location.host}/m/${restaurant.slug}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Owner dashboard
          </p>
          <h1 className="text-h1 font-bold break-words">{restaurant.name}</h1>
          <p className="text-text-muted">Welcome, {staff.name}</p>
        </div>
        <Button variant="secondary" isFullWidth={false} onClick={logout}>
          <LogOut size={24} aria-hidden="true" />
          Log out
        </Button>
      </header>

      <Card className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">Café details</h2>
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-sm text-text-muted">Menu link for customers</dt>
            <dd className="font-semibold break-all">{menuLink}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">UPI ID for payments</dt>
            <dd className="font-semibold break-all">{restaurant.upiId}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Taking orders</dt>
            <dd className="mt-1">
              <Badge tone={restaurant.isAcceptingOrders ? 'success' : 'neutral'}>
                {restaurant.isAcceptingOrders ? 'Open' : 'Closed'}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Owner login</dt>
            <dd className="font-semibold break-all">{staff.email}</dd>
          </div>
        </dl>
      </Card>

      <Card className="flex flex-col gap-1">
        <h2 className="text-h2 font-semibold">Coming next</h2>
        <p className="text-text-muted">
          Menu editor, printable QR poster and settings. Customers can use the menu link once the
          menu is ready.
        </p>
      </Card>
    </main>
  );
}
