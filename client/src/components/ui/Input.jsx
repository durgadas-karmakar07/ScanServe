// Text input with a visible label above (Design.md: no placeholder-only labels), an optional
// hint and an error message, both linked for screen readers.
export default function Input({ id, label, hint, error, ...props }) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-13 w-full rounded-xl border bg-surface px-4 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${error ? 'border-danger' : 'border-border'}`}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-sm break-words text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
