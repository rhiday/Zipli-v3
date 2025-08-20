#!/usr/bin/env node
/**
 * Upload screenshots to Lokalise API
 * Handles authentication, file uploads, and metadata
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createReadStream } = require('fs');

require('dotenv').config({ path: '.env.local' });

const API_TOKEN = process.env.LOKALISE_API_TOKEN;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

if (!API_TOKEN || !PROJECT_ID) {
  console.error(
    '❌ Missing LOKALISE_API_TOKEN or LOKALISE_PROJECT_ID in .env.local'
  );
  process.exit(1);
}

class LokaliseScreenshotUploader {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.testMode = options.testMode || false;
  }

  async uploadScreenshot(screenshotPath, metadata) {
    if (this.dryRun) {
      console.log(
        `  🔄 DRY RUN - Would upload: ${path.basename(screenshotPath)}`
      );
      console.log(`     Title: ${metadata.title}`);
      console.log(`     Description: ${metadata.description}`);
      console.log(`     Tags: ${metadata.tags.join(', ')}`);
      return { success: true, id: 'dry-run-id' };
    }

    return new Promise((resolve, reject) => {
      try {
        // Read file and convert to data URL format
        const fileBuffer = fs.readFileSync(screenshotPath);
        const base64Data = fileBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64Data}`;

        // Prepare JSON payload according to Lokalise API spec
        const payload = {
          screenshots: [
            {
              data: dataUrl,
              title: metadata.title,
              description: metadata.description,
              tags: metadata.tags,
            },
          ],
        };

        const jsonPayload = JSON.stringify(payload);

        const options = {
          hostname: 'api.lokalise.com',
          path: `/api2/projects/${PROJECT_ID}/screenshots`,
          method: 'POST',
          headers: {
            'X-Api-Token': API_TOKEN,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonPayload),
          },
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const response = JSON.parse(body);
                resolve({ success: true, data: response });
              } else {
                console.error(`Upload failed (${res.statusCode}):`, body);
                resolve({ success: false, error: body });
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.write(jsonPayload);
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async uploadScreenshotsFromDirectory(screenshotsDir) {
    console.log(
      `\n📤 ${this.dryRun ? 'Simulating upload' : 'Uploading screenshots'} to Lokalise...`
    );

    if (!fs.existsSync(screenshotsDir)) {
      console.error(`❌ Screenshots directory not found: ${screenshotsDir}`);
      return [];
    }

    const files = fs
      .readdirSync(screenshotsDir)
      .filter((file) => file.endsWith('.png'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No PNG files found in screenshots directory');
      return [];
    }

    const filesToProcess = this.testMode ? files.slice(0, 3) : files;
    console.log(
      `📊 Processing ${filesToProcess.length} screenshots${this.testMode ? ' (TEST MODE - first 3 only)' : ''}...`
    );

    const results = [];

    for (const filename of filesToProcess) {
      const filepath = path.join(screenshotsDir, filename);
      const metadata = this.generateMetadataFromFilename(filename);

      console.log(`\n  📁 ${filename}`);

      try {
        const result = await this.uploadScreenshot(filepath, metadata);
        results.push({ filename, ...result });

        if (result.success) {
          console.log(
            `  ✅ ${this.dryRun ? 'Simulated upload' : 'Uploaded'} successfully`
          );
        } else {
          console.log(`  ❌ Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`  ❌ Upload error: ${error.message}`);
        results.push({ filename, success: false, error: error.message });
      }

      // Rate limiting - wait between uploads
      if (!this.dryRun) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  generateMetadataFromFilename(filename) {
    // Parse filename like: login-error-1920x1080.png
    const parts = filename.replace('.png', '').split('-');
    const viewport = parts[parts.length - 1]; // "1920x1080"
    const state = parts[parts.length - 2]; // "error"
    const pageName = parts.slice(0, -2).join('-'); // "login"

    const [width, height] = viewport.split('x');
    const isMobile = parseInt(width) < 800;

    const metadata = {
      filename,
      title: `${this.formatPageName(pageName)} - ${this.formatState(state)} (${isMobile ? 'Mobile' : 'Desktop'})`,
      description: `${this.getPageDescription(pageName)} Screenshot showing ${state} state on ${isMobile ? 'mobile' : 'desktop'} viewport (${width}x${height})`,
      tags: this.generateTags(pageName, state, isMobile),
    };

    return metadata;
  }

  formatPageName(pageName) {
    const pageNames = {
      login: 'Login Page',
      register: 'Registration Page',
      dashboard: 'Dashboard',
      'donate-manual': 'Manual Donation Form',
      profile: 'User Profile',
      request: 'Food Request Page',
    };
    return pageNames[pageName] || pageName;
  }

  formatState(state) {
    const states = {
      default: 'Default',
      error: 'Error State',
      empty: 'Empty Form',
      filled: 'Filled Form',
    };
    return states[state] || state;
  }

  getPageDescription(pageName) {
    const descriptions = {
      login: 'User authentication page with email/password fields.',
      register: 'New user account creation form.',
      dashboard: 'Primary dashboard showing user activity and metrics.',
      'donate-manual': 'Form for creating food donations manually.',
      profile: 'User profile settings and information.',
      request: 'Page for browsing and requesting available food.',
    };
    return descriptions[pageName] || 'Application page';
  }

  generateTags(pageName, state, isMobile) {
    const tags = [pageName];

    if (state !== 'default') {
      tags.push(state);
    }

    tags.push(isMobile ? 'mobile' : 'desktop');

    // Add functional tags
    if (
      pageName.includes('form') ||
      pageName.includes('donate') ||
      pageName.includes('register')
    ) {
      tags.push('forms');
    }

    if (pageName === 'login' || pageName === 'register') {
      tags.push('authentication');
    }

    if (pageName === 'dashboard') {
      tags.push('navigation', 'metrics');
    }

    return tags;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    testMode: args.includes('--test'),
  };

  const screenshotsDir = path.join(__dirname, '../screenshots');

  const uploader = new LokaliseScreenshotUploader(options);
  const results = await uploader.uploadScreenshotsFromDirectory(screenshotsDir);

  console.log('\n📊 Upload Summary:');
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`  ✅ Successful: ${successful}`);
  if (failed > 0) {
    console.log(`  ❌ Failed: ${failed}`);
  }

  if (options.dryRun) {
    console.log('\n🔄 This was a dry run - no actual uploads were made');
    console.log('Remove --dry-run flag to upload for real');
  } else if (options.testMode) {
    console.log('\n🧪 Test mode - only processed first 3 screenshots');
    console.log('Remove --test flag to upload all screenshots');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LokaliseScreenshotUploader };
