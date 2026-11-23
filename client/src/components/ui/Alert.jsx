import { CircleAlert } from 'lucide-react';

// Error message in plain language, announced by screen readers when it appears. tabIndex -1 lets
// a form move focus here (and scroll it into view) when there is no single field to point at.
export default function Alert({ ref, children }) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-danger focus-visible:outline-2 focus-visible:outline-danger"
    >
      <CircleAlert size={24} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
