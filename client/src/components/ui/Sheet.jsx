import { useId } from 'react';
import { useModalDialog } from '../../hooks/useModalDialog.js';

// Dialog that rises from the bottom on phones and sits in the middle on larger screens. The
// native <dialog> keeps keyboard focus inside and closes on Escape (or Android back). Render it
// only while it should be open; it opens itself when it mounts.
// isBusy: a save or delete is running, so Escape/back must not close it (the result would land
// after the sheet is gone and its error would be lost).
export default function Sheet({ title, onClose, isBusy = false, children }) {
  const dialogRef = useModalDialog();
  const titleId = useId();

  const handleCancel = (event) => {
    if (isBusy) event.preventDefault();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-full rounded-t-[1.75rem] bg-surface-warm p-0 text-text backdrop:bg-night/60 sm:m-auto sm:max-w-[480px] sm:rounded-card"
    >
      <div className="flex flex-col gap-4 p-5 pb-6">
        <span
          aria-hidden="true"
          className="mx-auto -mt-1 h-1.5 w-12 rounded-full bg-border sm:hidden"
        />
        <h2 id={titleId} className="text-h1">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
