/**
 * Utility functions for parsing and handling allergen data
 */

/**
 * Parse allergens from various formats (JSON string, array, comma-separated string, PostgreSQL array)
 * Handles extreme corruption and multiple levels of JSON encoding
 */
export function parseAllergens(allergens: any): string[] {
  if (!allergens) return [];

  // If it's already an array, clean it up
  if (Array.isArray(allergens)) {
    return cleanAllergenArray(allergens);
  }

  // If it's a string, try to parse it with aggressive cleanup
  if (typeof allergens === 'string') {
    // Check if it's a PostgreSQL array format like {value1,value2} or {"value 1","value 2"}
    const pgArrayMatch = allergens.match(/^\{(.+)\}$/);
    if (pgArrayMatch) {
      // Parse PostgreSQL array format
      const content = pgArrayMatch[1];
      // Split by comma but respect quoted values
      const items = content.match(/("(?:[^"\\]|\\.)*"|[^,]+)/g) || [];
      return items
        .map((item) => item.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'))
        .map(normalizeAllergenName)
        .filter((a) => a);
    }

    return parseCorruptedAllergenString(allergens);
  }

  // For any other type, convert to string and try parsing
  return parseCorruptedAllergenString(String(allergens));
}

/**
 * Aggressively parse heavily corrupted allergen strings
 * Handles patterns like: ["\"[\\\"\\\"\\\"Not specified\\\"\\\"\\\"]\"]"
 */
function parseCorruptedAllergenString(str: string): string[] {
  const trimmed = str.trim();
  if (!trimmed) return [];

  // First, try to extract meaningful content using regex
  // Look for patterns like "Not specified" or "Ei määritelty" buried in the corruption
  // Include Unicode characters for Finnish text (ä, ö, å)
  const contentRegex =
    /([A-Za-zÄÖÅäöå][A-Za-zÄÖÅäöå\s-]+[A-Za-zÄÖÅäöå]|[A-Za-zÄÖÅäöå]+)/g;
  const matches = trimmed.match(contentRegex);

  if (matches) {
    // Filter out common JSON artifacts and keep only meaningful allergen names
    const meaningful = matches.filter((match) => {
      const lower = match.toLowerCase();
      return (
        ![
          'null',
          'true',
          'false',
          'undefined',
          'string',
          'array',
          'object',
        ].includes(lower) &&
        match.length > 1 &&
        !/^[\\"\[\]{}]+$/.test(match)
      ); // Skip pure JSON artifacts
    });

    if (meaningful.length > 0) {
      return meaningful.map(normalizeAllergenName).filter((a) => a);
    }
  }

  // Fallback: Try recursive JSON parsing for multiple encodings
  let current = trimmed;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops

  while (attempts < maxAttempts) {
    try {
      const parsed = JSON.parse(current);

      if (Array.isArray(parsed)) {
        return cleanAllergenArray(parsed);
      }

      if (typeof parsed === 'string') {
        current = parsed;
        attempts++;
        continue;
      }

      // If it's neither array nor string, convert and split
      return String(parsed)
        .split(',')
        .map((s) => normalizeAllergenName(s.trim()))
        .filter((a) => a);
    } catch {
      break; // Can't parse as JSON, try other methods
    }
  }

  // Last resort: Split by common separators and clean up
  return trimmed
    .split(/[,;|]/)
    .map((s) => s.trim())
    .map((s) => s.replace(/^["\[\]\\]+|["\[\]\\]+$/g, '')) // Strip leading/trailing JSON artifacts
    .map(normalizeAllergenName)
    .filter((a) => a && a.length > 0);
}

/**
 * Clean up an array of allergens, handling nested corruption
 */
function cleanAllergenArray(arr: any[]): string[] {
  const results: string[] = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      results.push(...cleanAllergenArray(item));
    } else if (typeof item === 'string') {
      results.push(...parseCorruptedAllergenString(item));
    } else if (item != null) {
      results.push(...parseCorruptedAllergenString(String(item)));
    }
  }

  return results.map(normalizeAllergenName).filter((a) => a);
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

  // Handle common variations including Finnish
  const variations: Record<string, string> = {
    'Not specified': 'Not specified',
    '\"Not specified\"': 'Not specified',
    'not specified': 'Not specified',
    none: 'Not specified',
    None: 'Not specified',
    NONE: 'Not specified',
    // Finnish variations
    'Ei määritelty': 'Ei määritelty',
    '\"Ei määritelty\"': 'Ei määritelty',
    'ei määritelty': 'Ei määritelty',
    'EI MÄÄRITELTY': 'Ei määritelty',
  };

  return variations[normalized] || normalized;
}
