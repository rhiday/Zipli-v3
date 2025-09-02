/**
 * Device detection utilities
 */

/**
 * Detects if the current device is running iOS (iPhone, iPad, iPod)
 * Handles both old and new iPad detection (iOS 13+)
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13+ detection (reports as Mac but has touch)
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

/**
 * Detects if the current device is an Android device
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

/**
 * Detects if the current device is a mobile device
 */
export const isMobileDevice = (): boolean => {
  return isIOS() || isAndroid();
};
