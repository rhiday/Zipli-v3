#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const LOKALISE_API_TOKEN = process.env.LOKALISE_API_TOKEN;
const LOKALISE_PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

if (!LOKALISE_API_TOKEN || !LOKALISE_PROJECT_ID) {
  console.error('❌ Missing Lokalise credentials in .env.local');
  process.exit(1);
}

console.log('🚀 Uploading translations to Lokalise...\n');
console.log(`Project ID: ${LOKALISE_PROJECT_ID}`);

async function uploadTranslations() {
  try {
    // Read the English translations
    const enTranslationsPath = path.join(
      __dirname,
      '../public/locales/en/translations.json'
    );
    const enTranslations = JSON.parse(
      fs.readFileSync(enTranslationsPath, 'utf8')
    );

    // Flatten the nested structure for Lokalise
    const flattenedTranslations = flattenObject(enTranslations);

    // Create the upload format Lokalise expects
    const lokaliseFIle = {};
    Object.keys(flattenedTranslations).forEach((key) => {
      lokaliseFIle[key] = {
        translation: flattenedTranslations[key],
        description: getDescriptionForKey(key),
      };
    });

    // Convert to base64 for upload
    const fileContent = Buffer.from(
      JSON.stringify(lokaliseFIle, null, 2)
    ).toString('base64');

    // Upload to Lokalise
    const response = await fetch(
      `https://api.lokalise.com/api2/projects/${LOKALISE_PROJECT_ID}/files/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': LOKALISE_API_TOKEN,
        },
        body: JSON.stringify({
          data: fileContent,
          filename: 'translations.json',
          lang_iso: 'en',
          convert_placeholders: false,
          detect_icu_plurals: true,
          tags: ['zipli', 'web'],
          replace_modified: true,
          slashn_to_linebreak: false,
          keys_to_values: false,
          cleanup_mode: false,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Upload failed:', error);
      return;
    }

    const result = await response.json();
    console.log('✅ Successfully uploaded to Lokalise!');
    console.log(`   - Keys processed: ${result.process.keys_parsed}`);
    console.log(`   - Keys added: ${result.process.keys_added}`);
    console.log(`   - Keys updated: ${result.process.keys_updated}`);

    // Now let's add Finnish as a language if not exists
    console.log('\n📝 Adding Finnish language...');
    const languageResponse = await fetch(
      `https://api.lokalise.com/api2/projects/${LOKALISE_PROJECT_ID}/languages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': LOKALISE_API_TOKEN,
        },
        body: JSON.stringify({
          languages: [
            {
              lang_iso: 'fi',
              custom_iso: 'fi',
            },
          ],
        }),
      }
    );

    if (languageResponse.ok) {
      console.log('✅ Finnish language added/confirmed in Lokalise');
    }

    console.log('\n🎉 All done! Your translations are now in Lokalise.');
    console.log('📝 Next steps:');
    console.log('   1. Go to https://app.lokalise.com to view your project');
    console.log('   2. Add Finnish translations for each key');
    console.log('   3. Set up webhook for automatic updates (optional)');
    console.log(
      '   4. Use "npm run lokalise:pull" to sync translations back\n'
    );
  } catch (error) {
    console.error('❌ Error uploading translations:', error);
  }
}

// Helper function to flatten nested objects
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      return { ...acc, ...flattenObject(obj[key], newKey) };
    }
    return { ...acc, [newKey]: obj[key] };
  }, {});
}

// Helper function to generate descriptions based on key structure
function getDescriptionForKey(key) {
  const parts = key.split('.');

  if (parts[0] === 'common') {
    return `Common/Shared: Used across multiple pages`;
  }
  if (parts[0] === 'pages' && parts[1]) {
    return `Page: ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)} section`;
  }
  if (parts[0] === 'components' && parts[1]) {
    return `Component: ${parts[1]} component`;
  }

  return 'Application text';
}

// Run the upload
uploadTranslations();
