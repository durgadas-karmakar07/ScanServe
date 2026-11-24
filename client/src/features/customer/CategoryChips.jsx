// Category chips at the top of the menu panel (like a printed menu's sections): "All" plus each
// category. Choosing one shows only that category's dishes. Stays at the top while scrolling.
export default function CategoryChips({ categories, selected, onSelect }) {
  const chipClass = (isActive) =>
    `min-h-11 shrink-0 rounded-full px-4 text-base font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isActive ? 'bg-primary text-white' : 'border border-border bg-surface-warm text-text hover:bg-surface'}`;

  return (
    <div
      role="group"
      aria-label="Menu categories"
      className="sticky top-0 z-30 -mx-5 flex gap-2 overflow-x-auto bg-bg/95 px-5 py-3 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:px-8"
    >
      <button
        type="button"
        aria-pressed={selected === null}
        className={chipClass(selected === null)}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selected === category}
          className={chipClass(selected === category)}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
