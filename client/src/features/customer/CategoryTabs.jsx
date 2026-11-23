import { useEffect, useRef } from 'react';

// Sticky category tabs under the hero. The active tab (marigold underline) follows scrolling
// and slides into view when the list is wider than the screen.
export default function CategoryTabs({ categories, activeIndex, onSelect }) {
  const listRef = useRef(null);

  // Scrolls only the tab row sideways. scrollIntoView would also nudge the page up or down,
  // fighting the scroll that picked this tab.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.children[activeIndex];
    if (!active) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = active.getBoundingClientRect();
    const edge = 16;
    let shift = 0;
    if (tabBox.left < listBox.left + edge) shift = tabBox.left - listBox.left - edge;
    else if (tabBox.right > listBox.right - edge) shift = tabBox.right - listBox.right + edge;
    if (shift === 0) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: shift, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeIndex]);

  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur"
    >
      <ul
        ref={listRef}
        className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        {categories.map((category, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={category} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(index)}
                className={`min-h-13 border-b-4 px-3 text-lg font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${isActive ? 'border-accent text-primary' : 'border-transparent text-text-muted hover:text-text'}`}
              >
                {category}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
