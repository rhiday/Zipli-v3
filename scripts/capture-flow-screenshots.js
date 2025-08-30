#!/usr/bin/env node
/**
 * Flow-based Screenshot Capture
 * Captures focused screenshots based on user flows and links them to specific translation keys
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotsDir: path.join(__dirname, '../screenshots-flows'),
  viewport: { width: 1920, height: 1080 },
  testUser: {
    email: 'sodexo.ladonlukko@sodexo.com',
    password: 'password',
  },
};

// Flow-based screenshot definitions
const SCREENSHOT_FLOWS = [
  {
    name: 'donor-dashboard-overview',
    title: 'Donor Dashboard - Main Overview',
    description:
      'Main donor dashboard showing overview, active donations, and impact metrics',
    path: '/dashboard',
    requiresAuth: true,
    linkedKeys: [
      'welcomeToDonorDashboard',
      'yourActiveDonations',
      'createNewDonations',
      'totalDonations',
      'yourImpact',
      'dashboard',
      'recentActivity',
      'noActivity',
    ],
    captureSettings: {
      fullPage: true,
      clip: null, // Capture full page
    },
  },
  {
    name: 'donor-dashboard-navigation',
    title: 'Donor Dashboard - Navigation',
    description: 'Top navigation bar with user menu and language switcher',
    path: '/dashboard',
    requiresAuth: true,
    linkedKeys: [
      'dashboard',
      'profile',
      'logout',
      'language',
      'donate',
      'english',
      'finnish',
    ],
    captureSettings: {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 80 }, // Just capture the top navigation
    },
  },
  {
    name: 'create-donation-start',
    title: 'Create Donation - Getting Started',
    description: 'Initial donation creation page with options',
    path: '/donate/new',
    requiresAuth: true,
    linkedKeys: [
      'createDonation',
      'newDonation',
      'startNewDonation',
      'manualEntry',
      'typeDonationManually',
      'next',
      'back',
    ],
    captureSettings: {
      fullPage: true,
      clip: null,
    },
  },
  {
    name: 'donation-form-empty',
    title: 'Donation Form - Empty State',
    description: 'Manual donation form in empty state showing all fields',
    path: '/donate/manual',
    requiresAuth: true,
    linkedKeys: [
      'addFoodItem',
      'nameOfFood',
      'description',
      'quantity',
      'placeholderFoodName',
      'placeholderDescription',
      'placeholderQuantity',
      'addPhoto',
      'photosHelpIdentify',
      'allergens',
      'required',
      'optional',
    ],
    captureSettings: {
      fullPage: true,
      clip: null,
    },
  },
  {
    name: 'donation-form-filled',
    title: 'Donation Form - Filled State',
    description: 'Manual donation form with example data filled in',
    path: '/donate/manual',
    requiresAuth: true,
    linkedKeys: [
      'addFoodItem',
      'nameOfFood',
      'description',
      'quantity',
      'addPhoto',
      'allergens',
      'next',
      'save',
    ],
    setupActions: [
      {
        type: 'fill',
        selector: 'input[name="name"]',
        value: 'Fresh Vegetables',
      },
      {
        type: 'fill',
        selector: 'textarea[name="description"]',
        value: 'Fresh organic vegetables from our restaurant kitchen',
      },
      { type: 'fill', selector: 'input[name="quantity"]', value: '5' },
    ],
    captureSettings: {
      fullPage: true,
      clip: null,
    },
  },
];

class FlowScreenshotCapture {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isAuthenticated = false;
  }

  async init() {
    console.log('🎯 Starting flow-based screenshot capture...');

    // Ensure screenshots directory exists
    if (!fs.existsSync(CONFIG.screenshotsDir)) {
      fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewportSize(CONFIG.viewport);
  }

  async authenticate() {
    if (this.isAuthenticated) return true;

    console.log('🔐 Authenticating user...');

    try {
      await this.page.goto(`${CONFIG.baseUrl}/login`, {
        waitUntil: 'networkidle',
      });

      await this.page.fill('input[type="email"]', CONFIG.testUser.email);
      await this.page.fill('input[type="password"]', CONFIG.testUser.password);

      await Promise.all([
        this.page.waitForNavigation({ timeout: 10000 }),
        this.page.click('button[type="submit"]'),
      ]);

      const currentUrl = this.page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        throw new Error('Still on login page');
      }

      console.log(
        `✅ Authentication successful - redirected to: ${currentUrl}`
      );
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async captureFlowScreenshot(flowConfig) {
    console.log(`\n📸 Capturing: ${flowConfig.title}`);
    console.log(
      `   Keys: ${flowConfig.linkedKeys.slice(0, 3).join(', ')}${flowConfig.linkedKeys.length > 3 ? '...' : ''}`
    );

    try {
      // Navigate to page
      await this.page.goto(`${CONFIG.baseUrl}${flowConfig.path}`, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });

      // Apply setup actions if any
      if (flowConfig.setupActions) {
        for (const action of flowConfig.setupActions) {
          switch (action.type) {
            case 'fill':
              await this.page.waitForSelector(action.selector, {
                timeout: 5000,
              });
              await this.page.fill(action.selector, action.value);
              break;
            case 'click':
              await this.page.click(action.selector);
              break;
          }
        }
        // Wait for changes to take effect
        await this.page.waitForTimeout(1000);
      }

      // Take screenshot
      const filename = `${flowConfig.name}.png`;
      const filepath = path.join(CONFIG.screenshotsDir, filename);

      const screenshotOptions = {
        path: filepath,
        type: 'png',
        fullPage: flowConfig.captureSettings.fullPage,
      };

      // Add clip if specified
      if (flowConfig.captureSettings.clip) {
        screenshotOptions.clip = flowConfig.captureSettings.clip;
      }

      await this.page.screenshot(screenshotOptions);

      console.log(`   ✅ Captured: ${filename}`);

      // Return metadata for upload
      return {
        filename,
        filepath,
        title: flowConfig.title,
        description: flowConfig.description,
        linkedKeys: flowConfig.linkedKeys,
        tags: ['flow-based', flowConfig.name.split('-')[0]],
      };
    } catch (error) {
      console.log(`   ❌ Failed to capture ${flowConfig.name}:`, error.message);
      return null;
    }
  }

  async captureAllFlows(flowNames = null) {
    const results = [];
    const flowsToCapture = flowNames
      ? SCREENSHOT_FLOWS.filter((f) => flowNames.includes(f.name))
      : SCREENSHOT_FLOWS;

    for (const flowConfig of flowsToCapture) {
      if (flowConfig.requiresAuth && !this.isAuthenticated) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          console.log(
            `⏭️  Skipping ${flowConfig.name} - authentication required`
          );
          continue;
        }
      }

      const result = await this.captureFlowScreenshot(flowConfig);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const flowNames = args.length > 0 ? args : null; // Allow specific flows: node script.js donor-dashboard-overview

  const capture = new FlowScreenshotCapture();

  try {
    await capture.init();

    const results = await capture.captureAllFlows(flowNames);

    console.log(`\n✅ Flow screenshot capture complete!`);
    console.log(`📊 Captured ${results.length} screenshots`);
    console.log(`📁 Saved to: ${CONFIG.screenshotsDir}`);

    if (results.length > 0) {
      console.log(`\n📋 Captured flows:`);
      results.forEach((r) => {
        console.log(`   • ${r.title} (${r.linkedKeys.length} keys)`);
      });
    }
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);
    process.exit(1);
  } finally {
    await capture.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { FlowScreenshotCapture, SCREENSHOT_FLOWS };
