import { useEffect, useState } from 'react';

// Keeps the kitchen screen from going dark while the page is open (Screen Wake Lock API).
// Phones release the lock when the page is hidden, so it is asked for again when the page is
// shown. Returns true while the screen is being kept on; older browsers simply return false.
export function useWakeLock() {
  const [isAwake, setIsAwake] = useState(false);

  useEffect(() => {
    if (!('wakeLock' in navigator)) return undefined;
    let lock = null;
    let isActive = true;

    const request = async () => {
      try {
        const next = await navigator.wakeLock.request('screen');
        if (!isActive) {
          next.release();
          return;
        }
        lock = next;
        setIsAwake(true);
        next.addEventListener('release', () => setIsAwake(false));
      } catch {
        setIsAwake(false);
      }
    };
    const handleVisible = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisible);
      lock?.release();
    };
  }, []);

  return isAwake;
}
