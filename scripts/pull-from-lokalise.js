#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const LOKALISE_API_TOKEN = process.env.LOKALISE_API_TOKEN;
const LOKALISE_PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

if (!LOKALISE_API_TOKEN || !LOKALISE_PROJECT_ID) {
  console.error('❌ Missing Lokalise credentials in .env.local');
  process.exit(1);
}

console.log('🚀 Pulling translations from Lokalise...\n');

async function pullTranslations() {
  try {
    // Step 1: Request download
    console.log('📦 Requesting translation bundle...');
    const downloadResponse = await fetch(
      `https://api.lokalise.com/api2/projects/${LOKALISE_PROJECT_ID}/files/download`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': LOKALISE_API_TOKEN,
        },
        body: JSON.stringify({
          format: 'json',
          original_filenames: false,
          directory_prefix: '',
          indentation: '2sp',
          export_empty_as: 'base',
          export_sort: 'first_added',
          json_unescaped_slashes: true,
          replace_breaks: false,
          include_comments: false,
          include_description: false,
          export_all: true,
        }),
      }
    );

    if (!downloadResponse.ok) {
      const error = await downloadResponse.text();
      console.error('❌ Download request failed:', error);
      return;
    }

    const downloadData = await downloadResponse.json();
    const bundleUrl = downloadData.bundle_url;

    console.log('📥 Downloading bundle...');

    // Step 2: Download the ZIP file
    const zipPath = path.join(__dirname, 'temp-translations.zip');
    await downloadFile(bundleUrl, zipPath);

    // Step 3: Extract and process the ZIP
    console.log('📂 Extracting translations...');
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const translations = {
      en: {},
      fi: {},
    };

    zipEntries.forEach((entry) => {
      const entryName = entry.entryName;

      // Parse language from filename (e.g., 'en.json' or 'fi.json')
      if (entryName.endsWith('.json')) {
        const content = entry.getData().toString('utf8');
        const data = JSON.parse(content);

        if (entryName.includes('en')) {
          translations.en = unflattenObject(data);
        } else if (entryName.includes('fi')) {
          translations.fi = unflattenObject(data);
        }
      }
    });

    // Step 4: Save to local files
    console.log('💾 Saving translations...');

    // Save English translations
    const enPath = path.join(
      __dirname,
      '../public/locales/en/translations.json'
    );
    fs.mkdirSync(path.dirname(enPath), { recursive: true });
    fs.writeFileSync(enPath, JSON.stringify(translations.en, null, 2));
    console.log('✅ Saved English translations');

    // Save Finnish translations
    const fiPath = path.join(
      __dirname,
      '../public/locales/fi/translations.json'
    );
    fs.mkdirSync(path.dirname(fiPath), { recursive: true });
    fs.writeFileSync(fiPath, JSON.stringify(translations.fi, null, 2));
    console.log('✅ Saved Finnish translations');

    // Clean up temp file
    fs.unlinkSync(zipPath);

    console.log('\n🎉 Successfully pulled translations from Lokalise!');
    console.log('📝 The translations are now updated in:');
    console.log('   - public/locales/en/translations.json');
    console.log('   - public/locales/fi/translations.json\n');
  } catch (error) {
    console.error('❌ Error pulling translations:', error);
  }
}

// Helper function to download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

// Helper function to unflatten object
function unflattenObject(obj) {
  const result = {};

  Object.keys(obj).forEach((key) => {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = obj[key];
  });

  return result;
}

// Run the pull
pullTranslations();
