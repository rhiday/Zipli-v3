// Create a persistent token storage that won't be reset by Hot Module Replacement (HMR)
// This is a better approach for development, though in production you should use a database
// @ts-ignore - Define the global tokens object
if (typeof global !== 'undefined' && !global.tokens) {
  // @ts-ignore
  global.tokens = {};
}

// Fallback for client-side rendering or Edge runtime
let localTokens = {};

// Get the appropriate tokens storage
// @ts-ignore
export const getTokens = () => typeof global !== 'undefined' ? global.tokens : localTokens;

// Export a singleton instance of the tokens object
export const tokens = getTokens(); 