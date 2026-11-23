// On/off control with its label (role="switch"), at least 48px tall for thumbs. Pass
// `accessibleName` when several switches share the same visible label (one per dish).
export default function Switch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  accessibleName,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={accessibleName}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold">{label}</span>
        {description && <span className="text-sm text-text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-success' : 'bg-text-muted'}`}
      >
        <span
          className={`inline-block size-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
        />
      </span>
    </button>
  );
}
