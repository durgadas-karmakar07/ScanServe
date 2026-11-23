import { LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteMenuItem } from '../../../api/menu.js';
import Alert from '../../../components/ui/Alert.jsx';
import Button from '../../../components/ui/Button.jsx';
import Sheet from '../../../components/ui/Sheet.jsx';
import { useAuth } from '../../../hooks/useAuth.js';

// Asks before deleting, because a deleted dish cannot be brought back.
export default function DeleteDishSheet({ dish, onClose, onDeleted }) {
  const { withAuth } = useAuth();
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await withAuth(deleteMenuItem, dish.id);
      onDeleted(dish);
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <Sheet title={`Delete ${dish.name}?`} onClose={onClose} isBusy={isDeleting}>
      {error && <Alert>{error}</Alert>}
      <p className="text-text-muted">
        Customers will no longer see this dish. This cannot be undone. If it is only sold out today,
        turn off “Available today” instead.
      </p>
      {/* Cancel comes first in the DOM so it gets the first focus: pressing Enter twice must
          not delete a dish. The CSS still shows Delete on top on phones and on the right. */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 size={24} aria-hidden="true" />
          )}
          {isDeleting ? 'Deleting…' : 'Delete dish'}
        </Button>
      </div>
    </Sheet>
  );
}
