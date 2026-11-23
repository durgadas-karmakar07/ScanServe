import { Pencil, Trash2 } from 'lucide-react';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import Switch from '../../../components/ui/Switch.jsx';
import VegMark from '../../../components/ui/VegMark.jsx';
import { formatRupees } from '../../../lib/format.js';

export default function MenuItemRow({ item, isUpdating, onToggleAvailable, onEdit, onDelete }) {
  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-1">
          <VegMark isVeg={item.isVeg} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <span
            className={`font-semibold break-words ${item.isAvailable ? '' : 'text-text-muted'}`}
          >
            {item.name}
          </span>
          {!item.isAvailable && <Badge tone="neutral">Sold out</Badge>}
        </div>
        <span className="font-semibold tabular-nums">{formatRupees(item.price)}</span>
      </div>
      {/* Phones: switch on its own line, then Edit and Delete side by side. Wider: one line. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <Switch
            label="Available today"
            accessibleName={`${item.name} available today`}
            checked={item.isAvailable}
            disabled={isUpdating}
            onChange={() => onToggleAvailable(item)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            variant="secondary"
            isFullWidth={false}
            aria-label={`Edit ${item.name}`}
            onClick={() => onEdit(item)}
          >
            <Pencil size={24} aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="secondary"
            isFullWidth={false}
            aria-label={`Delete ${item.name}`}
            onClick={() => onDelete(item)}
          >
            <Trash2 size={24} aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}
