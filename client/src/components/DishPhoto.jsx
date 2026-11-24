// A dish photo, or a tile with the dish's first letter in the serif face when there is no
// photo, so the menu never shows a broken image.
// variant: 'card' (4:3, fills a dish card), 'hero' (the dish page, square-ish, rounded bottom),
// 'thumb' (72px square in owner lists). tone: 'light' on cream, 'dark' inside dark cards.
const FRAMES = {
  card: 'aspect-[4/3] w-full',
  hero: 'aspect-square max-h-[52dvh] w-full rounded-b-[2rem] sm:aspect-[4/3]',
  thumb: 'size-18 shrink-0 rounded-xl',
};

const TILES = {
  light: 'bg-primary-soft text-primary/60',
  dark: 'bg-night-soft text-white/40',
};

export default function DishPhoto({
  name,
  photoUrl,
  isSoldOut = false,
  variant = 'card',
  tone = 'light',
}) {
  const frame = FRAMES[variant];
  const dimmed = isSoldOut ? 'opacity-50 grayscale' : '';
  const isThumb = variant === 'thumb';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        loading={variant === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
        width={isThumb ? 72 : 640}
        height={isThumb ? 72 : 480}
        className={`${frame} object-cover ${TILES[tone]} ${dimmed}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${frame} flex items-center justify-center font-serif ${TILES[tone]} ${isThumb ? 'text-h1' : 'text-[4rem]'} ${dimmed}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}
