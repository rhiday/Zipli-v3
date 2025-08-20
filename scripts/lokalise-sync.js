#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_TOKEN = process.env.LOKALISE_API_TOKEN;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

if (!API_TOKEN || !PROJECT_ID) {
  console.error(
    '❌ Missing LOKALISE_API_TOKEN or LOKALISE_PROJECT_ID in .env.local'
  );
  console.error('Please follow the setup guide in docs/lokalise-setup.md');
  process.exit(1);
}

const command = process.argv[2];

// Helper function to make API requests
function apiRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.lokalise.com',
      path: `/api2/projects/${PROJECT_ID}${endpoint}`,
      method: method,
      headers: {
        'X-Api-Token': API_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`API Error: ${response.error || body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Download translations from Lokalise
async function pullTranslations() {
  try {
    console.log('📥 Downloading translations from Lokalise...');

    // Request file export
    const exportResponse = await apiRequest('POST', '/files/download', {
      format: 'json',
      original_filenames: false,
      bundle_structure: 'public/locales/%LANG_ISO%/common.json',
      json_unescaped_slashes: true,
      export_empty_as: 'base',
      include_tags: [],
      exclude_tags: [],
    });

    const downloadUrl = exportResponse.bundle_url;

    // Download the bundle
    console.log('⬇️  Downloading bundle...');
    execSync(`curl -s -o translations.zip "${downloadUrl}"`);

    // Extract the bundle
    console.log('📦 Extracting translations...');
    execSync('unzip -o -q translations.zip');

    // Clean up
    execSync('rm translations.zip');

    // Update the main translations.ts file
    console.log('🔄 Updating translations.ts...');
    updateTranslationsFile();

    console.log('✅ Translations pulled successfully!');
  } catch (error) {
    console.error('❌ Error pulling translations:', error.message);
    process.exit(1);
  }
}

// Upload translations to Lokalise
async function pushTranslations() {
  try {
    console.log('📤 Uploading translations to Lokalise...');

    // Read the current translations
    const enTranslations = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../public/locales/en/common.json'),
        'utf8'
      )
    );
    const fiTranslations = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../public/locales/fi/common.json'),
        'utf8'
      )
    );

    // Prepare keys for upload
    const keys = [];

    for (const key in enTranslations) {
      keys.push({
        key_name: key,
        platforms: ['web'],
        translations: [
          {
            language_iso: 'en',
            translation: enTranslations[key],
          },
          {
            language_iso: 'fi',
            translation: fiTranslations[key] || '',
          },
        ],
      });
    }

    // Upload in batches (Lokalise API has limits)
    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      console.log(
        `📦 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keys.length / batchSize)}...`
      );

      await apiRequest('POST', '/keys', {
        keys: batch,
        use_automations: false,
        replace_modified: true,
      });
    }

    console.log('✅ Translations pushed successfully!');
  } catch (error) {
    console.error('❌ Error pushing translations:', error.message);
    process.exit(1);
  }
}

// Update the main translations.ts file from JSON files
function updateTranslationsFile() {
  const enTranslations = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../public/locales/en/common.json'),
      'utf8'
    )
  );
  const fiTranslations = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../public/locales/fi/common.json'),
      'utf8'
    )
  );

  // Generate the TypeScript file content
  let content = `// This file is auto-generated from Lokalise translations
// Do not edit manually - use Lokalise web interface instead
// Run 'npm run lokalise:pull' to update

export type Language = 'en' | 'fi';

export const translations = {
  en: ${JSON.stringify(enTranslations, null, 2).replace(/"([^"]+)":/g, '$1:')},
  fi: ${JSON.stringify(fiTranslations, null, 2).replace(/"([^"]+)":/g, '$1:')}
} as const;

export type TranslationKey = keyof typeof translations.en;
`;

  // Write the file
  fs.writeFileSync(path.join(__dirname, '../src/lib/translations.ts'), content);

  console.log('✅ Updated src/lib/translations.ts');
}

// Main command handler
async function main() {
  switch (command) {
    case 'pull':
      await pullTranslations();
      break;
    case 'push':
      await pushTranslations();
      break;
    case 'sync':
      await pushTranslations();
      await pullTranslations();
      break;
    default:
      console.log('Usage: node lokalise-sync.js [pull|push|sync]');
      console.log('  pull - Download translations from Lokalise');
      console.log('  push - Upload translations to Lokalise');
      console.log('  sync - Push then pull translations');
      process.exit(1);
  }
}

main().catch(console.error);
