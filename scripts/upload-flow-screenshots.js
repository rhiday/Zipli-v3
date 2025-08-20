#!/usr/bin/env node
/**
 * Upload flow-based screenshots to Lokalise with proper key mappings
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: '.env.local' });

const API_TOKEN = process.env.LOKALISE_API_TOKEN;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

if (!API_TOKEN || !PROJECT_ID) {
  console.error(
    '❌ Missing LOKALISE_API_TOKEN or LOKALISE_PROJECT_ID in .env.local'
  );
  process.exit(1);
}

// Import flow configurations
const { SCREENSHOT_FLOWS } = require('./capture-flow-screenshots.js');

class FlowScreenshotUploader {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.testMode = options.testMode || false;
    this.screenshotsDir = path.join(__dirname, '../screenshots-flows');
  }

  async uploadScreenshot(screenshotPath, metadata) {
    if (this.dryRun) {
      console.log(
        `  🔄 DRY RUN - Would upload: ${path.basename(screenshotPath)}`
      );
      console.log(`     Title: ${metadata.title}`);
      console.log(`     Description: ${metadata.description}`);
      console.log(`     Linked Keys: ${metadata.linkedKeys.join(', ')}`);
      console.log(`     Tags: ${metadata.tags.join(', ')}`);
      return { success: true, id: 'dry-run-id' };
    }

    return new Promise((resolve, reject) => {
      try {
        // Read file and convert to data URL format
        const fileBuffer = fs.readFileSync(screenshotPath);
        const base64Data = fileBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64Data}`;

        // Enhanced description with key mappings
        const enhancedDescription = `${metadata.description}

🔗 Translation Keys Shown:
${metadata.linkedKeys.map((key) => `• ${key}`).join('\\n')}

📸 Flow: ${metadata.flowName || 'Unknown'}
🎯 Focus: ${metadata.primaryFocus || 'General'}`;

        // Prepare JSON payload according to Lokalise API spec
        const payload = {
          screenshots: [
            {
              data: dataUrl,
              title: metadata.title,
              description: enhancedDescription,
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

  getFlowMetadata(filename) {
    // Extract flow name from filename (remove .png extension)
    const flowName = filename.replace('.png', '');

    // Find matching flow configuration
    const flowConfig = SCREENSHOT_FLOWS.find((f) => f.name === flowName);

    if (!flowConfig) {
      console.warn(`⚠️  No flow configuration found for ${filename}`);
      return {
        title: filename,
        description: 'Flow-based screenshot',
        linkedKeys: [],
        tags: ['flow-based'],
        flowName: flowName,
      };
    }

    return {
      title: flowConfig.title,
      description: flowConfig.description,
      linkedKeys: flowConfig.linkedKeys,
      tags: ['flow-based', flowName.split('-')[0]],
      flowName: flowConfig.name,
      primaryFocus: flowConfig.linkedKeys[0], // First key as primary focus
    };
  }

  async uploadFlowScreenshots() {
    console.log(
      `\n📤 ${this.dryRun ? 'Simulating upload' : 'Uploading'} flow-based screenshots to Lokalise...`
    );

    if (!fs.existsSync(this.screenshotsDir)) {
      console.error(
        `❌ Screenshots directory not found: ${this.screenshotsDir}`
      );
      return [];
    }

    const files = fs
      .readdirSync(this.screenshotsDir)
      .filter((file) => file.endsWith('.png'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No PNG files found in flow screenshots directory');
      return [];
    }

    const filesToProcess = this.testMode ? files.slice(0, 2) : files;
    console.log(
      `📊 Processing ${filesToProcess.length} flow screenshots${this.testMode ? ' (TEST MODE)' : ''}...`
    );

    const results = [];

    for (const filename of filesToProcess) {
      const filepath = path.join(this.screenshotsDir, filename);
      const metadata = this.getFlowMetadata(filename);

      console.log(`\\n  📁 ${filename}`);
      console.log(
        `     🔗 ${metadata.linkedKeys.length} linked keys: ${metadata.linkedKeys.slice(0, 3).join(', ')}${metadata.linkedKeys.length > 3 ? '...' : ''}`
      );

      try {
        const result = await this.uploadScreenshot(filepath, metadata);
        results.push({ filename, ...result });

        if (result.success) {
          console.log(
            `     ✅ ${this.dryRun ? 'Simulated upload' : 'Uploaded'} successfully`
          );
        } else {
          console.log(`     ❌ Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error(`     ❌ Upload error:`, error.message);
        results.push({ filename, success: false, error: error.message });
      }

      // Small delay to be nice to API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\\n📊 Upload Summary:`);
    console.log(`  ✅ Successful: ${successful}`);
    if (failed > 0) {
      console.log(`  ❌ Failed: ${failed}`);
    }

    if (this.testMode) {
      console.log(
        `\\n🧪 Test mode - only processed first ${filesToProcess.length} screenshots`
      );
      console.log(`Remove --test flag to upload all screenshots`);
    }

    return results;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    testMode: args.includes('--test'),
  };

  const uploader = new FlowScreenshotUploader(options);
  await uploader.uploadFlowScreenshots();
}

if (require.main === module) {
  main();
}
