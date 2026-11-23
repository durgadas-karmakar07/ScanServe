import { ExternalLink } from 'lucide-react';

// A link that looks like a secondary button (52px, pill). Opens another site or tab safely.
export default function LinkButton({ href, children, isExternal = false }) {
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-lg font-semibold text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isExternal && <ExternalLink size={24} aria-hidden="true" />}
      {children}
    </a>
  );
}
