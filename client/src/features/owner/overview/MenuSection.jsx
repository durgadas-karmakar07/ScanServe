import { ArrowRight, LoaderCircle, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMenu, updateMenuItem } from '../../../api/menu.js';
import Alert from '../../../components/ui/Alert.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { groupByCategory } from '../../../lib/menu.js';
import ProductCard from './ProductCard.jsx';

// "Your menu" on the dashboard: category chips and product cards with the sold-out switch.
export default function MenuSection() {
  const { withAuth } = useAuth();
  const { showToast } = useToast();
  const [menu, setMenu] = useState({ status: 'loading', items: [], error: null });
  const [retryCount, setRetryCount] = useState(0);
  const [category, setCategory] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getMenu, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted || !data) return;
        setMenu({ status: 'ready', items: data.items, error: null });
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setMenu({ status: 'error', items: [], error: err });
      });
    return () => controller.abort();
  }, [withAuth, retryCount]);

  const toggleAvailable = async (item) => {
    setUpdatingId(item.id);
    try {
      const { item: saved } = await withAuth(updateMenuItem, item.id, {
        isAvailable: !item.isAvailable,
      });
      setMenu((current) => ({
        ...current,
        items: current.items.map((entry) => (entry.id === saved.id ? saved : entry)),
      }));
      showToast(saved.isAvailable ? `${saved.name} is available` : `${saved.name} is sold out`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const categories = groupByCategory(menu.items).map(([name]) => name);
  // A category that no longer exists (its last dish was deleted) falls back to All.
  const activeCategory = categories.includes(category) ? category : null;
  const shownItems = activeCategory
    ? menu.items.filter((item) => item.category === activeCategory)
    : menu.items;

  return (
    <section aria-labelledby="products-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="products-title" className="text-h1">
          Your menu
        </h2>
        <Link
          to="/owner/menu"
          className="inline-flex min-h-12 items-center gap-1 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Manage menu
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </div>

      {menu.status === 'loading' && (
        <p className="flex items-center gap-3 text-text-muted" role="status">
          <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          Loading your menu…
        </p>
      )}
      {menu.status === 'error' && (
        <div className="flex flex-col gap-3">
          <Alert>{menu.error.message}</Alert>
          <Button
            variant="secondary"
            isFullWidth={false}
            onClick={() => setRetryCount((count) => count + 1)}
            className="self-start"
          >
            <RotateCw size={24} aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}
      {menu.status === 'ready' && menu.items.length === 0 && (
        <p className="rounded-card bg-surface p-5 text-text-muted shadow-card">
          No dishes yet.{' '}
          <Link to="/owner/menu" className="font-semibold text-primary underline">
            Add your first dish
          </Link>{' '}
          to start taking orders.
        </p>
      )}

      {menu.status === 'ready' && menu.items.length > 0 && (
        <>
          <div
            role="group"
            aria-label="Menu categories"
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
          >
            {[null, ...categories].map((name) => {
              const isActive = activeCategory === name;
              return (
                <button
                  key={name ?? 'all'}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategory(name)}
                  className={`min-h-12 shrink-0 rounded-full px-4 text-base font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isActive ? 'bg-night text-white' : 'border border-border bg-surface hover:bg-surface-warm'}`}
                >
                  {name ?? `All (${menu.items.length})`}
                </button>
              );
            })}
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shownItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                isUpdating={updatingId === item.id}
                onToggle={toggleAvailable}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
