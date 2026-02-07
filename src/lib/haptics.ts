// ============================================
// HAPTIC FEEDBACK UTILITIES
// ============================================

/**
 * Trigger a light haptic tap (if supported by the device)
 */
export function hapticTap(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

/**
 * Trigger a medium haptic feedback
 */
export function hapticMedium(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(25);
  }
}

/**
 * Trigger a heavy haptic feedback
 */
export function hapticHeavy(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

/**
 * Trigger a success haptic pattern
 */
export function hapticSuccess(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([10, 50, 10]);
  }
}

/**
 * Trigger an error haptic pattern
 */
export function hapticError(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([50, 30, 50]);
  }
}
