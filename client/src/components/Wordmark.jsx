// ScanServe logo: a small night tile with three white squares and an orange dot (a QR code
// with one "order" dot), then the name in the serif face. tone: 'light' on cream, 'dark' on
// the night sidebar.
export default function Wordmark({ size = 'md', tone = 'light' }) {
  const isLarge = size === 'lg';
  const isDark = tone === 'dark';

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={isLarge ? 38 : 32}
        height={isLarge ? 38 : 32}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect
          width="32"
          height="32"
          rx="9"
          fill={isDark ? 'var(--color-accent)' : 'var(--color-night)'}
        />
        <rect x="7" y="7" width="7" height="7" rx="2" fill="#ffffff" />
        <rect x="18" y="7" width="7" height="7" rx="2" fill="#ffffff" />
        <rect x="7" y="18" width="7" height="7" rx="2" fill="#ffffff" />
        <circle
          cx="21.5"
          cy="21.5"
          r="4"
          fill={isDark ? 'var(--color-night)' : 'var(--color-accent)'}
        />
      </svg>
      <span
        className={`font-serif leading-none ${isDark ? 'text-white' : 'text-text'} ${isLarge ? 'text-h1' : 'text-h2'}`}
      >
        ScanServe
      </span>
    </span>
  );
}
