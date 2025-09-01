// =====================================================
// SESSION UTILITIES
// Handles "Remember Me" functionality at application level
// =====================================================

const REMEMBER_ME_KEY = 'zipli_remember_me';
const SESSION_TIMESTAMP_KEY = 'zipli_session_timestamp';
const REMEMBERED_EMAIL_KEY = 'zipli_remembered_email';

export interface RememberMePreference {
  rememberMe: boolean;
  timestamp: number;
}

/**
 * Store the user's "Remember Me" preference
 */
export function setRememberMePreference(rememberMe: boolean): void {
  try {
    const preference: RememberMePreference = {
      rememberMe,
      timestamp: Date.now(),
    };
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(preference));
  } catch (error) {
    console.warn('Failed to store remember me preference:', error);
  }
}

/**
 * Get the user's "Remember Me" preference
 */
export function getRememberMePreference(): RememberMePreference | null {
  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to read remember me preference:', error);
    return null;
  }
}

/**
 * Check if the current session should be maintained based on "Remember Me" setting
 */
export function shouldMaintainSession(): boolean {
  const preference = getRememberMePreference();

  // If no preference stored, default to maintaining session (backward compatibility)
  if (!preference) return true;

  // If user chose to be remembered, maintain session
  if (preference.rememberMe) return true;

  // If user chose not to be remembered, check if this is a new browser session
  // We consider it a new session if there's no session timestamp or it's very old
  const sessionTimestamp = getSessionTimestamp();
  const now = Date.now();

  // If no session timestamp, this might be a new browser session
  if (!sessionTimestamp) return false;

  // If the session timestamp is older than 30 minutes and remember me is false,
  // consider this a new session (user likely closed and reopened browser)
  const timeDifference = now - sessionTimestamp;
  const thirtyMinutes = 30 * 60 * 1000;

  return timeDifference <= thirtyMinutes;
}

/**
 * Set a session timestamp (used to detect browser restarts)
 */
export function setSessionTimestamp(): void {
  try {
    sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to set session timestamp:', error);
  }
}

/**
 * Get the session timestamp
 */
export function getSessionTimestamp(): number | null {
  try {
    const timestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.warn('Failed to read session timestamp:', error);
    return null;
  }
}

/**
 * Clear remember me preferences (call on logout)
 */
export function clearRememberMePreference(): void {
  try {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear remember me preference:', error);
  }
}

/**
 * Initialize session tracking (call on app start)
 */
export function initializeSessionTracking(): void {
  setSessionTimestamp();
}

/**
 * Store the user's email address for future logins (only if remember me is checked)
 */
export function setRememberedEmail(email: string, rememberMe: boolean): void {
  try {
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      // If remember me is false, clear any previously stored email
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  } catch (error) {
    console.warn('Failed to store remembered email:', error);
  }
}

/**
 * Get the remembered email address
 */
export function getRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  } catch (error) {
    console.warn('Failed to retrieve remembered email:', error);
    return '';
  }
}

/**
 * Clear the remembered email (call on manual logout or when user unchecks remember me)
 */
export function clearRememberedEmail(): void {
  try {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch (error) {
    console.warn('Failed to clear remembered email:', error);
  }
}
