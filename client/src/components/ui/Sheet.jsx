import { useEffect, useId, useRef } from 'react';

// Dialog that rises from the bottom on phones and sits in the middle on larger screens. The
// native <dialog> keeps keyboard focus inside and closes on Escape (or Android back). Render it
// only while it should be open; it opens itself when it mounts.
// isBusy: a save or delete is running, so Escape/back must not close it (the result would land
// after the sheet is gone and its error would be lost).
export default function Sheet({ title, onClose, isBusy = false, children }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    // Remember the button that opened the sheet (only once: StrictMode runs this twice).
    if (!openerRef.current) openerRef.current = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();

    // Closing by Cancel/Save/Delete removes the dialog without the browser's own focus return,
    // so send focus back to the opener ourselves when it still exists.
    return () => {
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  const handleCancel = (event) => {
    if (isBusy) event.preventDefault();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-full rounded-t-2xl bg-surface p-0 text-text backdrop:bg-text/50 sm:m-auto sm:max-w-[480px] sm:rounded-card"
    >
      <div className="flex flex-col gap-4 p-4 pb-6">
        <h2 id={titleId} className="text-h2 font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
