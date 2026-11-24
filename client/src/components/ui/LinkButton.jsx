import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

const CLASSES =
  'inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-lg font-semibold text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

// A link that looks like a secondary button (52px, pill). `to` moves within the app without
// reloading; `href` opens another page, in a new tab when isExternal (opened safely).
export default function LinkButton({ to, href, children, isExternal = false }) {
  if (to) {
    return (
      <Link to={to} className={CLASSES}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={CLASSES}
    >
      {isExternal && <ExternalLink size={24} aria-hidden="true" />}
      {children}
    </a>
  );
}
