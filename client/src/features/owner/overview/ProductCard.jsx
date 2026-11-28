import DishPhoto from '../../../components/DishPhoto.jsx';
import Switch from '../../../components/ui/Switch.jsx';
import VegMark from '../../../components/ui/VegMark.jsx';
import { formatRupees } from '../../../lib/format.js';

// A dish on the dashboard (Design.md, product card): inset photo with the price, "Sold out"
// chip, name, one line of description and the "Available today" switch.
export default function ProductCard({ item, isUpdating, onToggle }) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card">
      <div className="relative p-2 pb-0">
        <div className="overflow-hidden rounded-xl">
          <DishPhoto name={item.name} photoUrl={item.photoUrl} isSoldOut={!item.isAvailable} />
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-surface px-3 py-1 text-base font-bold tabular-nums shadow-card">
          {formatRupees(item.price)}
        </span>
        {!item.isAvailable && (
          <span className="absolute top-4 right-4 rounded-full bg-night px-3 py-1 text-sm font-semibold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4 pt-3">
        <p className="flex items-start gap-2 text-lg font-semibold">
          <span className="mt-1">
            <VegMark isVeg={item.isVeg} size={18} />
          </span>
          <span className="min-w-0 break-words">{item.name}</span>
        </p>
        {item.description && (
          <p className="line-clamp-1 text-sm break-words text-text-muted">{item.description}</p>
        )}
        <div className="mt-auto pt-2">
          <Switch
            label="Available today"
            accessibleName={`${item.name} available today`}
            checked={item.isAvailable}
            disabled={isUpdating}
            onChange={() => onToggle(item)}
          />
        </div>
      </div>
    </li>
  );
}
