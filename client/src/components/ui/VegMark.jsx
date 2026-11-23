// Indian food mark: green square with a dot = veg, red square with a triangle = non-veg.
// The shapes differ too, so it never relies on colour alone. Set isDecorative when the word
// "Veg" / "Non-veg" is already written next to it, so screen readers do not say it twice.
export default function VegMark({ isVeg, size = 20, isDecorative = false }) {
  const label = isVeg ? 'Veg' : 'Non-veg';

  return (
    <span
      className={`inline-flex shrink-0 ${isVeg ? 'text-veg' : 'text-danger'}`}
      title={isDecorative ? undefined : label}
      aria-hidden={isDecorative ? true : undefined}
    >
      <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
        <rect
          x="1"
          y="1"
          width="18"
          height="18"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {isVeg ? (
          <circle cx="10" cy="10" r="5" fill="currentColor" />
        ) : (
          <path d="M10 4.5 15.5 14.5H4.5Z" fill="currentColor" />
        )}
      </svg>
      {!isDecorative && <span className="sr-only">{label}</span>}
    </span>
  );
}
