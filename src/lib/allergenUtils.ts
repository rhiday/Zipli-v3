/**
 * Utility functions for parsing and handling allergen data
 */

/**
 * Parse allergens from various formats (JSON string, array, comma-separated string)
 * Handles the common double-encoding issues in the database
 */
export function parseAllergens(allergens: any): string[] {
  if (!allergens) return [];

  // If it's already an array, return it
  if (Array.isArray(allergens)) {
    return allergens.filter((a) => a && String(a).trim() !== '');
  }

  // If it's a string, try to parse it
  if (typeof allergens === 'string') {
    const trimmed = allergens.trim();

    // Handle empty strings
    if (!trimmed) return [];

    // Try to parse as JSON first (handles most database cases)
    try {
      const parsed = JSON.parse(trimmed);

      // If parsed result is an array, return it
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a && String(a).trim() !== '');
      }

      // If parsed result is a string, try parsing it again (double-encoded case)
      if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed);
          if (Array.isArray(doubleParsed)) {
            return doubleParsed.filter((a) => a && String(a).trim() !== '');
          }
        } catch {
          // If double parsing fails, split by comma
          return String(parsed)
            .split(',')
            .map((a) => a.trim())
            .filter((a) => a);
        }
      }

      // If it's neither array nor string after parsing, convert to string and split
      return String(parsed)
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);
    } catch {
      // If JSON parsing fails entirely, split by comma
      return trimmed
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);
    }
  }

  // For any other type, convert to string and split
  return String(allergens)
    .split(',')
    .map((a) => a.trim())
    .filter((a) => a);
}

/**
 * Format allergens as a JSON string for database storage
 */
export function formatAllergensForStorage(allergens: string[]): string {
  return JSON.stringify(allergens.filter((a) => a && a.trim() !== ''));
}

/**
 * Clean up common allergen name variations and normalize them
 */
export function normalizeAllergenName(name: string): string {
  const normalized = name.trim();

  // Handle common variations
  const variations: Record<string, string> = {
    'Not specified': 'Not specified',
    '\"Not specified\"': 'Not specified',
    'not specified': 'Not specified',
    none: 'Not specified',
    None: 'Not specified',
    NONE: 'Not specified',
  };

  return variations[normalized] || normalized;
}
