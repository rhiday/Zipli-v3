/**
 * Data Filtering Utilities
 *
 * Utility functions for filtering test data and production data
 */

/**
 * Checks if an email address belongs to a test account
 * @param email - Email address to check
 * @returns true if the email is from a test account
 */
export function isTestAccount(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const lowercaseEmail = email.toLowerCase();

  // Check for test email patterns
  const testPatterns = [
    '@zipli.test', // Main test domain
    'test@', // Emails starting with test@
    '@test.', // Test domains
    'donor.test', // Test donor accounts
    'test.donor', // Test donor variations
    'test.receiver', // Test receiver accounts
    'test.terminal', // Test terminal accounts
    'test.city', // Test city accounts
  ];

  return testPatterns.some((pattern) => lowercaseEmail.includes(pattern));
}

/**
 * Checks if an organization name appears to be a test organization
 * @param organizationName - Organization name to check
 * @returns true if the organization appears to be for testing
 */
export function isTestOrganization(
  organizationName: string | null | undefined
): boolean {
  if (!organizationName || typeof organizationName !== 'string') {
    return false;
  }

  const lowercaseName = organizationName.toLowerCase();

  const testOrgPatterns = [
    'test',
    'donor test',
    'test restaurant',
    'test charity',
    'test organization',
    'zipli test',
    'helsinki test',
  ];

  return testOrgPatterns.some(
    (pattern) => lowercaseName.includes(pattern) || lowercaseName === pattern
  );
}

/**
 * Filters out test accounts from a list of profiles
 * @param profiles - Array of profile objects with email property
 * @returns Filtered array without test accounts
 */
export function filterTestProfiles<T extends { email?: string | null }>(
  profiles: T[]
): T[] {
  return profiles.filter((profile) => !isTestAccount(profile.email));
}

/**
 * Comprehensive check for test data including both email and organization
 * @param email - Email address to check
 * @param organizationName - Organization name to check
 * @returns true if either email or organization indicates test data
 */
export function isTestData(
  email: string | null | undefined,
  organizationName: string | null | undefined
): boolean {
  return isTestAccount(email) || isTestOrganization(organizationName);
}
