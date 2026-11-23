// A dish photo, or a tile with the dish's first letter in Baloo when there is no photo, so the
// menu never shows a broken image. `variant`: 'card' (4:3, full width) or 'thumb' (72px square).
export default function DishPhoto({ name, photoUrl, isSoldOut = false, variant = 'card' }) {
  const isThumb = variant === 'thumb';
  const frame = isThumb ? 'size-18 shrink-0 rounded-xl' : 'aspect-[4/3] w-full rounded-card';
  const dimmed = isSoldOut ? 'opacity-60 grayscale' : '';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        loading="lazy"
        decoding="async"
        width={isThumb ? 72 : 640}
        height={isThumb ? 72 : 480}
        className={`${frame} bg-primary-soft object-cover ${dimmed}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${frame} flex items-center justify-center bg-primary-soft font-display font-bold text-primary/50 ${isThumb ? 'text-h1' : 'text-[3.5rem]'} ${dimmed}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}
