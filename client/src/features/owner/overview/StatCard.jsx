import { Link } from 'react-router';

// One number on the dashboard: an icon in a soft circle, the label, the value and a short hint.
// With `to`, the whole card is a link to the page about it.
export default function StatCard({ Icon, label, value, hint, to }) {
  const body = (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="text-base text-text-muted">{label}</span>
      <span className="text-[1.75rem] leading-none font-bold tabular-nums">{value}</span>
      {hint && <span className="text-sm text-text-muted">{hint}</span>}
    </>
  );
  const classes =
    'flex min-w-0 flex-col items-start gap-2 rounded-card bg-surface p-4 shadow-card sm:p-5';
  return to ? (
    <Link
      to={to}
      className={`${classes} hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
    >
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
