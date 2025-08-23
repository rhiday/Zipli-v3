#!/usr/bin/env node
/**
 * Automated i18n Migration Script
 * Extracts hardcoded strings and replaces them with contextual translation keys
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load the enhanced i18n translation structure
const enTranslations = require('../public/locales/en/translations.json');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const FILE_PATTERNS = ['**/*.tsx', '**/*.ts'];
const EXCLUDE_PATTERNS = ['node_modules', '.next', 'dist', '__tests__'];

// Common hardcoded strings that should be translated
const HARDCODED_PATTERNS = [
  // Button/action text
  /["']([A-Z][a-z]+(?: [A-Z][a-z]+)*)["']/g, // "Save Changes", "Create Account"
  
  // Form labels  
  /placeholder=["']([^"']+)["']/g, // placeholder="Enter your email"
  
  // Titles and headers
  /title=["']([^"']+)["']/g, // title="Login Page"
  
  // Aria labels
  /aria-label=["']([^"']+)["']/g, // aria-label="Go back"
  
  // Loading states
  /["'](.*(?:loading|saving|processing|confirming).*?)["']/gi,
  
  // Error messages
  /["'](.*(?:error|failed|invalid).*?)["']/gi,
];

// Map file paths to their contextual namespaces
const getContextualNamespace = (filePath) => {
  const relativePath = path.relative(SRC_DIR, filePath);
  
  if (relativePath.includes('app/auth/')) return 'pages.auth';
  if (relativePath.includes('app/donate/')) return 'pages.donations';
  if (relativePath.includes('app/request/')) return 'pages.requests';
  if (relativePath.includes('app/dashboard/')) return 'pages.dashboard';
  if (relativePath.includes('app/profile/')) return 'pages.profile';
  if (relativePath.includes('app/impact/')) return 'pages.impact';
  
  if (relativePath.includes('components/donations/')) return 'components.donationCard';
  if (relativePath.includes('components/requests/')) return 'components.requestCard';
  if (relativePath.includes('components/ui/')) {
    if (relativePath.includes('VoiceInput')) return 'components.voiceInput';
    if (relativePath.includes('Allergen')) return 'components.allergenSelector';
    if (relativePath.includes('Pickup')) return 'components.pickupScheduler';
    if (relativePath.includes('Food')) return 'components.foodItemForm';
  }
  
  return 'common';
};

// Find translation key for a string value
const findTranslationKey = (text, namespace) => {
  const normalizedText = text.trim().toLowerCase();
  
  // Search in the specific namespace first
  if (namespace && namespace !== 'common') {
    const namespaceParts = namespace.split('.');
    let current = enTranslations;
    
    for (const part of namespaceParts) {
      if (current[part]) {
        current = current[part];
      } else {
        break;
      }
    }
    
    // Search in this namespace
    const key = findKeyInObject(current, normalizedText);
    if (key) {
      return `${namespace}.${key}`;
    }
  }
  
  // Search in common namespace
  const commonKey = findKeyInObject(enTranslations.common, normalizedText);
  if (commonKey) {
    return `common.${commonKey}`;
  }
  
  // Generate a new key if not found
  return generateNewKey(text, namespace);
};

// Recursively search for a key by its value
const findKeyInObject = (obj, searchValue) => {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (value.toLowerCase() === searchValue) {
        return key;
      }
    } else if (typeof value === 'object') {
      const nestedKey = findKeyInObject(value, searchValue);
      if (nestedKey) {
        return `${key}.${nestedKey}`;
      }
    }
  }
  return null;
};

// Generate a new translation key
const generateNewKey = (text, namespace) => {
  const key = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  return `${namespace || 'common'}.${key}`;
};

// Get all TypeScript/React files
const getAllFiles = (dir, pattern) => {
  const files = [];
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !EXCLUDE_PATTERNS.some(p => entry.includes(p))) {
      files.push(...getAllFiles(fullPath, pattern));
    } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Extract hardcoded strings from a file
const extractHardcodedStrings = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const namespace = getContextualNamespace(filePath);
  const findings = [];
  
  // Check if file already uses translation hooks
  const usesTranslations = content.includes('useTranslation') || 
                          content.includes('useLanguage') ||
                          content.includes("t('") ||
                          content.includes('t("');
  
  for (const pattern of HARDCODED_PATTERNS) {
    let match;
    pattern.lastIndex = 0; // Reset regex
    
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1];
      
      // Skip if it's already a translation key or variable
      if (text.includes('.') || text.startsWith('{') || text.length < 3) {
        continue;
      }
      
      // Skip common technical strings
      if (/^(jsx|tsx|js|ts|px|rem|em|%|\d+)$/.test(text)) {
        continue;
      }
      
      const translationKey = findTranslationKey(text, namespace);
      
      findings.push({
        original: match[0],
        text,
        translationKey,
        line: content.substring(0, match.index).split('\n').length,
        namespace
      });
    }
  }
  
  return { findings, usesTranslations, namespace, content };
};

// Update a file with translation keys
const updateFileWithTranslations = (filePath, findings, usesTranslations, namespace, content) => {
  if (findings.length === 0) return false;
  
  let updatedContent = content;
  const hookToAdd = getTranslationHook(namespace);
  
  // Add translation hook import if not present
  if (!usesTranslations) {
    const importStatement = getImportStatement(namespace);
    
    // Find where to add the import
    const importRegex = /import.*from.*['"][^'"]*['"];?\n/g;
    const imports = [...updatedContent.matchAll(importRegex)];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const insertPosition = lastImport.index + lastImport[0].length;
      updatedContent = updatedContent.slice(0, insertPosition) + 
                     importStatement + '\n' +
                     updatedContent.slice(insertPosition);
    }
  }
  
  // Add translation hook in component if not present
  if (!usesTranslations && !updatedContent.includes('const { t }')) {
    // Find where to add the hook (after function declaration)
    const functionPattern = /((?:export\s+)?(?:default\s+)?function\s+\w+[^{]*{|const\s+\w+[^=]*=>[^{]*{)/;
    const match = updatedContent.match(functionPattern);
    
    if (match) {
      const insertPosition = match.index + match[0].length;
      updatedContent = updatedContent.slice(0, insertPosition) + 
                     `\n  ${hookToAdd};\n` +
                     updatedContent.slice(insertPosition);
    }
  }
  
  // Replace hardcoded strings with translation keys
  for (const finding of findings.reverse()) { // Reverse to maintain indices
    const replacement = `{t('${finding.translationKey}')}`;
    updatedContent = updatedContent.replace(finding.original, replacement);
  }
  
  return updatedContent;
};

// Get the appropriate translation hook for namespace
const getTranslationHook = (namespace) => {
  const hooks = {
    'pages.auth': 'const { t } = useAuthTranslation()',
    'pages.dashboard': 'const { t } = useDashboardTranslation()',
    'pages.donations': 'const { t } = useDonationsTranslation()',
    'pages.requests': 'const { t } = useRequestsTranslation()',
    'pages.profile': 'const { t } = useProfileTranslation()',
    'pages.impact': 'const { t } = useImpactTranslation()',
    'components.donationCard': 'const { t } = useDonationCardTranslation()',
    'components.requestCard': 'const { t } = useRequestCardTranslation()',
    'components.foodItemForm': 'const { t } = useFoodItemFormTranslation()',
    'components.pickupScheduler': 'const { t } = usePickupSchedulerTranslation()',
    'components.voiceInput': 'const { t } = useVoiceInputTranslation()',
    'components.allergenSelector': 'const { t } = useAllergenSelectorTranslation()',
  };
  
  return hooks[namespace] || 'const { t } = useCommonTranslation()';
};

// Get import statement for namespace
const getImportStatement = (namespace) => {
  const specificImports = {
    'pages.auth': 'useAuthTranslation',
    'pages.dashboard': 'useDashboardTranslation', 
    'pages.donations': 'useDonationsTranslation',
    'pages.requests': 'useRequestsTranslation',
    'pages.profile': 'useProfileTranslation',
    'pages.impact': 'useImpactTranslation',
    'components.donationCard': 'useDonationCardTranslation',
    'components.requestCard': 'useRequestCardTranslation',
    'components.foodItemForm': 'useFoodItemFormTranslation',
    'components.pickupScheduler': 'usePickupSchedulerTranslation',
    'components.voiceInput': 'useVoiceInputTranslation',
    'components.allergenSelector': 'useAllergenSelectorTranslation',
  };
  
  const hookName = specificImports[namespace] || 'useCommonTranslation';
  return `import { ${hookName} } from '@/lib/i18n-enhanced';`;
};

// Main migration function
async function runMigration() {
  console.log('🌍 Starting i18n Migration...\n');
  
  const allFiles = getAllFiles(SRC_DIR);
  const results = {
    filesProcessed: 0,
    stringsFound: 0,
    filesUpdated: 0,
    newTranslationKeys: []
  };
  
  for (const filePath of allFiles) {
    const { findings, usesTranslations, namespace, content } = extractHardcodedStrings(filePath);
    results.filesProcessed++;
    results.stringsFound += findings.length;
    
    if (findings.length > 0) {
      console.log(`📄 ${path.relative(SRC_DIR, filePath)}`);
      console.log(`   Namespace: ${namespace}`);
      console.log(`   Found ${findings.length} hardcoded strings:`);
      
      findings.forEach(f => {
        console.log(`   → "${f.text}" → t('${f.translationKey}')`);
        results.newTranslationKeys.push({
          key: f.translationKey,
          value: f.text,
          namespace
        });
      });
      
      // Update the file
      const updatedContent = updateFileWithTranslations(
        filePath, findings, usesTranslations, namespace, content
      );
      
      if (updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        results.filesUpdated++;
        console.log(`   ✅ Updated file\n`);
      }
    }
  }
  
  console.log('📊 Migration Summary:');
  console.log(`   Files processed: ${results.filesProcessed}`);
  console.log(`   Hardcoded strings found: ${results.stringsFound}`);
  console.log(`   Files updated: ${results.filesUpdated}`);
  console.log(`   New translation keys: ${results.newTranslationKeys.length}`);
  
  // Generate missing keys report
  if (results.newTranslationKeys.length > 0) {
    generateMissingKeysReport(results.newTranslationKeys);
  }
  
  console.log('\n✅ Migration completed successfully!');
}

// Generate report of missing translation keys
const generateMissingKeysReport = (newKeys) => {
  const reportPath = path.join(__dirname, '../i18n-migration-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalKeys: newKeys.length,
    keysByNamespace: {},
    keysToAdd: {}
  };
  
  // Group by namespace
  for (const key of newKeys) {
    if (!report.keysByNamespace[key.namespace]) {
      report.keysByNamespace[key.namespace] = 0;
    }
    report.keysByNamespace[key.namespace]++;
    
    // Structure for easy addition to translation files
    const keyParts = key.key.split('.');
    let current = report.keysToAdd;
    
    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!current[keyParts[i]]) {
        current[keyParts[i]] = {};
      }
      current = current[keyParts[i]];
    }
    
    current[keyParts[keyParts.length - 1]] = key.value;
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 Missing keys report generated: ${reportPath}`);
};

// Run the migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration, extractHardcodedStrings };