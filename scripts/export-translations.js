const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsPath = path.join(__dirname, '../src/lib/translations.ts');
const content = fs.readFileSync(translationsPath, 'utf8');

// Extract just the translation objects
const enStart = content.indexOf('en: {');
const enEnd = content.indexOf('fi: {');
const fiEnd = content.lastIndexOf('}');

// Extract EN translations
const enContent = content.substring(enStart + 4, enEnd - 3);
const fiContent = content.substring(content.indexOf('fi: {') + 4, fiEnd);

// Parse the translations manually
function parseTranslations(str) {
  const translations = {};
  const lines = str.split('\n');

  lines.forEach((line) => {
    // Match lines like: dashboard: 'Dashboard',
    const match = line.match(
      /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*['"](.*)['"],?\s*$/
    );
    if (match) {
      const key = match[1];
      const value = match[2]
        .replace(/\\'/g, "'") // Unescape single quotes
        .replace(/\\"/g, '"'); // Unescape double quotes
      translations[key] = value;
    }
  });

  return translations;
}

try {
  const enTranslations = parseTranslations(enContent);
  const fiTranslations = parseTranslations(fiContent);

  // Create locales directory structure
  const localesDir = path.join(__dirname, '../public/locales');

  // Create directories if they don't exist
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  // Save English translations
  const enDir = path.join(localesDir, 'en');
  if (!fs.existsSync(enDir)) {
    fs.mkdirSync(enDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(enDir, 'common.json'),
    JSON.stringify(enTranslations, null, 2)
  );

  // Save Finnish translations
  const fiDir = path.join(localesDir, 'fi');
  if (!fs.existsSync(fiDir)) {
    fs.mkdirSync(fiDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(fiDir, 'common.json'),
    JSON.stringify(fiTranslations, null, 2)
  );

  console.log('✅ Translations exported successfully!');
  console.log('📁 Files created:');
  console.log(
    '   - public/locales/en/common.json (' +
      Object.keys(enTranslations).length +
      ' keys)'
  );
  console.log(
    '   - public/locales/fi/common.json (' +
      Object.keys(fiTranslations).length +
      ' keys)'
  );
} catch (error) {
  console.error('Error parsing translations:', error);
  process.exit(1);
}
