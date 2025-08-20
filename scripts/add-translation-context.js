#!/usr/bin/env node
/**
 * Add context and descriptions to Lokalise translations
 * This helps translators understand where and how text is used
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const API_TOKEN = process.env.LOKALISE_API_TOKEN;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

// Define context for each translation key
// This tells translators where and how the text appears
const translationContext = {
  // Navigation
  dashboard: {
    context: 'Main navigation menu',
    max_length: 20,
    screenshot_tag: 'nav-menu',
  },
  donate: {
    context: 'Navigation menu item for donation page',
    max_length: 15,
    screenshot_tag: 'nav-menu',
  },

  // Buttons
  save: {
    context: 'Button to save changes in forms',
    max_length: 10,
    screenshot_tag: 'form-buttons',
  },
  cancel: {
    context: 'Button to cancel current action',
    max_length: 10,
    screenshot_tag: 'form-buttons',
  },

  // Dashboard
  yourImpact: {
    context: 'Section heading on donor dashboard showing impact metrics',
    max_length: 30,
    screenshot_tag: 'dashboard-impact',
  },
  totalFoodOffered: {
    context: 'Label for metric showing total food donated',
    max_length: 25,
    screenshot_tag: 'dashboard-metrics',
  },

  // Error messages
  invalidEmailPassword: {
    context: 'Error shown when login credentials are incorrect',
    max_length: 50,
    screenshot_tag: 'login-errors',
  },
  networkError: {
    context: 'Generic network error message',
    max_length: 40,
    screenshot_tag: 'error-messages',
  },

  // Forms
  emailAddress: {
    context: 'Label for email input field in login/register forms',
    max_length: 20,
    screenshot_tag: 'auth-forms',
  },
  password: {
    context: 'Label for password input field',
    max_length: 15,
    screenshot_tag: 'auth-forms',
  },

  // Long descriptions
  environmentalAndSocialImpactData: {
    context: 'Description text explaining the impact data section',
    max_length: 150,
    screenshot_tag: 'dashboard-impact',
  },
  welcomeToDonorDashboard: {
    context: 'Welcome message on donor dashboard with list of capabilities',
    max_length: 100,
    screenshot_tag: 'dashboard-header',
  },
};

// Function to update key descriptions in Lokalise
async function updateKeyContext(keyId, context) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      keys: [
        {
          key_id: keyId,
          description: context.context,
          char_limit: context.max_length,
          tags: [context.screenshot_tag],
        },
      ],
    });

    const options = {
      hostname: 'api.lokalise.com',
      path: `/api2/projects/${PROJECT_ID}/keys`,
      method: 'PUT',
      headers: {
        'X-Api-Token': API_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          console.error(`Failed to update key ${keyId}: ${body}`);
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Get all keys from Lokalise
async function getAllKeys() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.lokalise.com',
      path: `/api2/projects/${PROJECT_ID}/keys?limit=500`,
      method: 'GET',
      headers: {
        'X-Api-Token': API_TOKEN,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          const data = JSON.parse(body);
          resolve(data.keys || []);
        } else {
          reject(new Error(`Failed to get keys: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('📝 Adding context to Lokalise translations...\n');

  try {
    // Get all existing keys
    const keys = await getAllKeys();
    console.log(`Found ${keys.length} keys in Lokalise\n`);

    // Update keys that have context defined
    let updated = 0;
    for (const key of keys) {
      const context = translationContext[key.key_name.web];
      if (context) {
        console.log(`Updating context for: ${key.key_name.web}`);
        await updateKeyContext(key.key_id, context);
        updated++;
      }
    }

    console.log(`\n✅ Updated context for ${updated} keys`);
    console.log('\nNext steps:');
    console.log('1. Upload screenshots to Lokalise (Screenshots tab)');
    console.log('2. Tag translation keys to screenshot regions');
    console.log('3. Translators will see visual context when editing');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
