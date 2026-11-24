// Button roles (Design.md):
// - primary (olive): the action that commits, e.g. Add to order, Place order, Save.
// - accent (burnt orange): the invitation that moves the customer on, e.g. Explore menu, View order.
// - secondary: white with a border, for everything else.
// - light: white on dark photos and dark cards.
// - danger: deleting or cancelling.
const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  accent: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'border border-border bg-surface text-text hover:bg-surface-warm',
  light: 'bg-white text-text hover:bg-white/90',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

// compact: less padding and 16px text on phones, for a button that shares its row (the dish
// page's "Add to order │ ₹240" next to the quantity control). Padding and text size live here
// because a px-* or text-* in className would clash with these instead of replacing them.
const SIZES = {
  md: 'px-6 text-lg',
  compact: 'px-4 text-base sm:text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  isFullWidth = true,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${SIZES[size]} ${isFullWidth ? 'w-full' : 'w-auto'} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
