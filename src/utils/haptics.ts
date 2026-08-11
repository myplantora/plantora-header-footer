/**
 * Haptic feedback via the Web Vibration API.
 *
 * IMPORTANT: Browsers only honour navigator.vibrate() while a user activation
 * is still "fresh" — i.e. synchronously inside the click/tap handler. Calling
 * it after an awaited network request silently does nothing. Always call this
 * at the very start of the event handler, never after `await`.
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window === 'undefined') return;
  const nav = window.navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate !== 'function') return;

  const patterns: Record<typeof type, number[]> = {
    light: [12],
    medium: [22],
    heavy: [15, 30, 15],
  };

  try {
    nav.vibrate(0); // cancel any in-flight pattern so rapid taps still buzz
    nav.vibrate(patterns[type]);
  } catch {
    // Ignore: unsupported or blocked by user settings
  }
};
