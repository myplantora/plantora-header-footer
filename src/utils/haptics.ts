/**
 * Simple utility to trigger haptic feedback via the Web Vibrations API.
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40],
    };
    try {
      navigator.vibrate(patterns[type]);
    } catch (e) {
      // Ignore vibration failures (e.g. user gesture requirements)
    }
  }
};
