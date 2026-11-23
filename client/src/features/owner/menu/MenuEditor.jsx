import { LoaderCircle, Plus, RotateCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getMenu, updateMenuItem } from '../../../api/menu.js';
import Alert from '../../../components/ui/Alert.jsx';
import Button from '../../../components/ui/Button.jsx';
import Card from '../../../components/ui/Card.jsx';
import LinkButton from '../../../components/ui/LinkButton.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { groupByCategory } from '../../../lib/menu.js';
import DeleteDishSheet from './DeleteDishSheet.jsx';
import DishSheet from './DishSheet.jsx';
import MenuItemRow from './MenuItemRow.jsx';

export default function MenuEditor() {
  const { restaurant, withAuth } = useAuth();
  const { showToast } = useToast();
  const [menu, setMenu] = useState({ status: 'loading', items: [], error: '' });
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(null); // { dish } while the add/edit sheet is open
  const [deleting, setDeleting] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    withAuth(getMenu, { signal: controller.signal })
      .then(({ items }) => setMenu({ status: 'ready', items, error: '' }))
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setMenu({ status: 'error', items: [], error: err.message });
      });
    return () => controller.abort();
  }, [withAuth, attempt]);

  const groups = useMemo(() => groupByCategory(menu.items), [menu.items]);
  const categories = groups.map(([category]) => category);

  const replaceItem = (saved) =>
    setMenu((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === saved.id ? saved : item)),
    }));

  const handleSaved = (saved, isEdit) => {
    if (isEdit) replaceItem(saved);
    else setMenu((current) => ({ ...current, items: [...current.items, saved] }));
    // Close only the sheet that made this request, never a newer one.
    setEditing((current) =>
      (current?.dish?.id ?? 'new') === (isEdit ? saved.id : 'new') ? null : current,
    );
    showToast(isEdit ? `${saved.name} saved` : `${saved.name} added`);
  };

  const handleDeleted = (removed) => {
    setMenu((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== removed.id),
    }));
    setDeleting((current) => (current?.id === removed.id ? null : current));
    showToast(`${removed.name} deleted`);
  };

  const toggleAvailable = async (item) => {
    setUpdatingId(item.id);
    try {
      const { item: saved } = await withAuth(updateMenuItem, item.id, {
        isAvailable: !item.isAvailable,
      });
      replaceItem(saved);
      showToast(saved.isAvailable ? `${saved.name} is available` : `${saved.name} is sold out`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const retry = () => {
    setMenu({ status: 'loading', items: [], error: '' });
    setAttempt((count) => count + 1);
  };

  const addButton = (
    <Button isFullWidth={false} onClick={() => setEditing({ dish: null })}>
      <Plus size={24} aria-hidden="true" />
      Add dish
    </Button>
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-bold">Menu</h1>
          {menu.status === 'ready' && (
            <p className="text-text-muted">
              {menu.items.length} {menu.items.length === 1 ? 'dish' : 'dishes'}
            </p>
          )}
        </div>
        {menu.status === 'ready' && menu.items.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <LinkButton href={`/m/${restaurant.slug}`} isExternal>
              Preview
            </LinkButton>
            {addButton}
          </div>
        )}
      </div>

      {menu.status === 'loading' && (
        <p className="flex items-center gap-3 text-text-muted" role="status">
          <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          Loading your menu…
        </p>
      )}

      {menu.status === 'error' && (
        <div className="flex flex-col gap-3">
          <Alert>{menu.error}</Alert>
          <Button variant="secondary" onClick={retry}>
            <RotateCw size={24} aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}

      {menu.status === 'ready' && menu.items.length === 0 && (
        <Card className="flex flex-col items-start gap-3">
          <h2 className="text-h2 font-semibold">No dishes yet</h2>
          <p className="text-text-muted">
            Add your dishes with their price and veg tag. Customers will order from this menu.
          </p>
          {addButton}
        </Card>
      )}

      {groups.map(([category, items]) => (
        <Card key={category} className="flex flex-col">
          <h2 className="text-h2 font-semibold break-words">{category}</h2>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                isUpdating={updatingId === item.id}
                onToggleAvailable={toggleAvailable}
                onEdit={(dish) => setEditing({ dish })}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        </Card>
      ))}

      {editing && (
        <DishSheet
          key={editing.dish?.id ?? 'new'}
          dish={editing.dish}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <DeleteDishSheet
          key={deleting.id}
          dish={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
