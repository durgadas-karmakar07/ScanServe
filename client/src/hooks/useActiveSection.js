import { useCallback, useEffect, useRef, useState } from 'react';

// How long scrolling must stay quiet before a tapped tab lets the page choose again.
const SETTLE_MS = 300;

// Which menu category is on screen, for the sticky tabs. Watches the sections with ids
// `${prefix}-0`, `${prefix}-1`, ... and picks the first one inside the band under the tabs.
// Returns [activeIndex, select]: select(index) is for a tapped tab. That tab stays chosen while
// the page scrolls to it (even if the page bottoms out first). The pin ends when that scroll
// settles, or at once when the customer scrolls, taps or presses a key; screen reader
// scrolling sends none of those, which is why the settle timer is needed too.
export function useActiveSection(prefix, count) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isPinned = useRef(false);
  const settleTimer = useRef(0);

  const settle = useCallback(() => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      isPinned.current = false;
    }, SETTLE_MS);
  }, []);

  const select = useCallback(
    (index) => {
      isPinned.current = true;
      setActiveIndex(index);
      settle();
    },
    [settle],
  );

  useEffect(() => {
    if (count === 0) return undefined;
    const sections = Array.from({ length: count }, (_, index) =>
      document.getElementById(`${prefix}-${index}`),
    ).filter(Boolean);

    // The observer only reports sections that changed, so keep the full set of visible ones;
    // otherwise a short section leaving the band could hand the tab to the wrong category.
    const visible = new Set();
    // A short last category can never reach the band, so at the very bottom it wins.
    // (scrollY > 0 keeps a menu shorter than the screen on its first category.)
    const pick = () => {
      if (isPinned.current) return;
      const root = document.documentElement;
      const isAtBottom =
        window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      if (isAtBottom) setActiveIndex(sections.length - 1);
      else if (visible.size > 0) setActiveIndex(Math.min(...visible));
    };
    const handleScroll = () => {
      if (isPinned.current) settle();
      else pick();
    };
    const unpin = () => {
      isPinned.current = false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sections.indexOf(entry.target);
          if (entry.isIntersecting) visible.add(index);
          else visible.delete(index);
        });
        pick();
      },
      { rootMargin: '-72px 0px -60% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    window.addEventListener('scroll', handleScroll, { passive: true });
    const userInput = ['wheel', 'pointerdown', 'keydown'];
    userInput.forEach((type) => window.addEventListener(type, unpin, { passive: true }));
    return () => {
      observer.disconnect();
      clearTimeout(settleTimer.current);
      window.removeEventListener('scroll', handleScroll);
      userInput.forEach((type) => window.removeEventListener(type, unpin));
    };
  }, [prefix, count, settle]);

  return [activeIndex, select];
}
