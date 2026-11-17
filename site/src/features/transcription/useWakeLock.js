import { useEffect } from 'react';

// Keep the screen awake while `active` is true (e.g. during a recording) so the
// phone doesn't sleep and tear down the mic/socket mid-session. Uses the Screen
// Wake Lock API where available and silently no-ops otherwise.
//
// The browser automatically drops the lock when the tab is hidden, so we
// re-acquire it whenever the page becomes visible again.
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let sentinel = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        // Denied (e.g. low battery) or not permitted in this context; ignore.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
