const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-text hover:bg-bg',
};

export default function Button({
  variant = 'primary',
  type = 'button',
  isFullWidth = true,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-5 text-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${isFullWidth ? 'w-full' : 'w-auto'} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
