import { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastContext } from './toastContext.js';

const TOAST_DURATION_MS = 3000;

// One short message at the bottom of the screen for 3 seconds (Design.md, Toast). Used for
// actions outside forms, like the sold-out switch; forms show their errors inline.
export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, tone = 'neutral') => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-6 print:hidden"
      >
        {toast && (
          <p
            key={toast.id}
            className={`max-w-[480px] rounded-xl px-4 py-3 font-semibold text-white shadow-lg ${toast.tone === 'error' ? 'bg-danger' : 'bg-text'}`}
          >
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext>
  );
}
