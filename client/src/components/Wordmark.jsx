// ScanServe logo: a small chalkboard tile with a marigold dot (the "order" colour), then the name
// in Baloo. Used instead of all-caps labels at the top of pages.
export default function Wordmark({ size = 'md' }) {
  const isLarge = size === 'lg';

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={isLarge ? 36 : 28}
        height={isLarge ? 36 : 28}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
        <rect x="7" y="7" width="7" height="7" rx="2" fill="#ffffff" />
        <rect x="18" y="7" width="7" height="7" rx="2" fill="#ffffff" />
        <rect x="7" y="18" width="7" height="7" rx="2" fill="#ffffff" />
        <circle cx="21.5" cy="21.5" r="4" fill="var(--color-accent)" />
      </svg>
      <span
        className={`font-display leading-none font-bold text-primary ${isLarge ? 'text-h1' : 'text-h2'}`}
      >
        ScanServe
      </span>
    </span>
  );
}
