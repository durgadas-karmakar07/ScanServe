import { useEffect, useRef } from 'react';

// Opens a native <dialog> as a modal when the component mounts. The browser keeps keyboard
// focus inside it and closes it on Escape or the Android back gesture. When it goes away, focus
// returns to the button that opened it (if that button still exists). Returns the dialog ref.
export function useModalDialog() {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    // Remember the opener only once: StrictMode runs this effect twice.
    if (!openerRef.current) openerRef.current = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  return dialogRef;
}
