// Define token type
export interface TokenData {
  user_email: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

// Create a persistent token storage that won't be reset by Hot Module Replacement (HMR)
// This is a better approach for development, though in production you should use a database

// For server-side storage
// @ts-ignore - Define the global tokens object
if (typeof global !== 'undefined' && !global.tokens) {
  // @ts-ignore
  global.tokens = {};
}

// For client-side storage with localStorage fallback
const getClientStorage = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return {};
  
  try {
    // Try to get tokens from localStorage
    const storedTokens = localStorage.getItem('qr_login_tokens');
    return storedTokens ? JSON.parse(storedTokens) : {};
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return {};
  }
};

// Fallback for server-side rendering or Edge runtime
let localTokens = {};

// Get the appropriate tokens storage
// @ts-ignore
export const getTokens = () => {
  // Server-side - use global
  if (typeof global !== 'undefined') {
    // @ts-ignore
    return global.tokens;
  }
  
  // Client-side - try localStorage first, then fallback to in-memory
  return getClientStorage() || localTokens;
};

// Save tokens to localStorage on the client
export const saveTokens = (tokens: Record<string, TokenData>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('qr_login_tokens', JSON.stringify(tokens));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }
};

// Export a singleton instance of the tokens object
export const tokens: Record<string, TokenData> = getTokens(); 