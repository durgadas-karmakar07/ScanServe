import { useEffect, useRef } from 'react';

// After a failed submit, move focus to the first invalid field, or to the form-level alert when
// no field is marked. Focusing also scrolls it into view, so on a phone the owner sees the error
// instead of an unchanged screen. `error` must be a new object for every failed attempt.
export function useFocusFirstError(error) {
  const formRef = useRef(null);
  const alertRef = useRef(null);

  useEffect(() => {
    if (!error) return;
    const firstInvalid = formRef.current?.querySelector('[aria-invalid="true"]');
    (firstInvalid ?? alertRef.current)?.focus();
  }, [error]);

  return { formRef, alertRef };
}
