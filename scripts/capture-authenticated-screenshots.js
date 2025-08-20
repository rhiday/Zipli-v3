#!/usr/bin/env node
/**
 * Capture authenticated screenshots - desktop only
 * Focus on donation and request flows after login
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotsDir: path.join(__dirname, '../screenshots'),
  viewport: { width: 1920, height: 1080 }, // Desktop only
  testUser: {
    email: 'sodexo.ladonlukko@sodexo.com',
    password: 'password',
  },
};

// Authenticated pages to capture
const AUTH_PAGES = [
  {
    name: 'dashboard',
    path: '/dashboard',
    title: 'Main Dashboard',
    description: 'Primary dashboard showing user activity and metrics',
    states: ['default'],
  },
  {
    name: 'donor-dashboard',
    path: '/donor/dashboard',
    title: 'Donor Dashboard',
    description: 'Dashboard for food donors showing donations and impact',
    states: ['default'],
  },
  {
    name: 'donate',
    path: '/donate',
    title: 'Donate Main Page',
    description: 'Main donation page with options',
    states: ['default'],
  },
  {
    name: 'donate-new',
    path: '/donate/new',
    title: 'New Donation Page',
    description: 'Start new donation flow',
    states: ['default'],
  },
  {
    name: 'donate-manual',
    path: '/donate/manual',
    title: 'Manual Donation Form',
    description: 'Form for creating food donations manually',
    states: ['empty', 'filled'],
  },
  {
    name: 'request',
    path: '/request',
    title: 'Food Request Page',
    description: 'Page for browsing and requesting available food',
    states: ['default'],
  },
  {
    name: 'request-new',
    path: '/request/new',
    title: 'New Food Request',
    description: 'Form to create new food request',
    states: ['empty', 'filled'],
  },
  {
    name: 'feed',
    path: '/feed',
    title: 'Food Feed',
    description: 'Browse available food donations',
    states: ['default'],
  },
  {
    name: 'impact',
    path: '/impact',
    title: 'Impact Page',
    description: 'View environmental and social impact metrics',
    states: ['default'],
  },
  {
    name: 'profile',
    path: '/profile',
    title: 'User Profile',
    description: 'User profile settings and information',
    states: ['default', 'edit'],
  },
];

class AuthenticatedScreenshotCapture {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isAuthenticated = false;
  }

  async init() {
    console.log('🚀 Starting authenticated screenshot capture...');

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
      // Go to login page
      await this.page.goto(`${CONFIG.baseUrl}/login`, {
        waitUntil: 'networkidle',
      });

      // Fill login form
      await this.page.fill('input[type="email"]', CONFIG.testUser.email);
      await this.page.fill('input[type="password"]', CONFIG.testUser.password);

      // Submit form and wait for redirect (could be dashboard, donate, etc.)
      await Promise.all([
        this.page.waitForNavigation({ timeout: 10000 }),
        this.page.click('button[type="submit"]'),
      ]);

      // Check if we're authenticated by looking at the current URL
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

  async capturePageStates(pageConfig) {
    console.log(`\n  📄 Processing: ${pageConfig.title}`);

    for (const state of pageConfig.states) {
      console.log(`    📸 Capturing ${state} state...`);

      try {
        // Navigate to page
        await this.page.goto(`${CONFIG.baseUrl}${pageConfig.path}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });

        // Apply state-specific actions
        await this.applyPageState(pageConfig.name, state);

        // Wait for any animations/loading
        await this.page.waitForTimeout(1000);

        // Take screenshot
        const filename = `${pageConfig.name}-${state}-${CONFIG.viewport.width}x${CONFIG.viewport.height}.png`;
        const filepath = path.join(CONFIG.screenshotsDir, filename);

        await this.page.screenshot({
          path: filepath,
          fullPage: true,
          type: 'png',
        });

        console.log(`    ✅ Captured: ${filename}`);
      } catch (error) {
        console.log(
          `    ❌ Failed to capture ${pageConfig.name} (${state}):`,
          error.message
        );
      }
    }
  }

  async applyPageState(pageName, state) {
    // Apply different states based on page and state combination
    switch (`${pageName}-${state}`) {
      case 'donate-manual-filled':
        // Fill out donation form
        await this.page.waitForSelector('input[name="name"]', {
          timeout: 5000,
        });
        await this.page.fill('input[name="name"]', 'Fresh Vegetables');
        await this.page.fill(
          'textarea[name="description"]',
          'Fresh organic vegetables from our restaurant kitchen'
        );
        await this.page.fill('input[name="quantity"]', '5');
        break;

      case 'request-new-filled':
        // Fill out request form
        await this.page.waitForSelector('input', { timeout: 5000 });
        // Add any specific form fills for request
        break;

      case 'profile-edit':
        // Click edit button if available
        try {
          await this.page.click('button:has-text("Edit")', { timeout: 3000 });
        } catch (e) {
          // Edit button might not exist
        }
        break;

      default:
        // Default state - just wait for page to load
        await this.page.waitForTimeout(500);
    }
  }

  async captureAllPages() {
    let capturedCount = 0;

    for (const pageConfig of AUTH_PAGES) {
      try {
        await this.capturePageStates(pageConfig);
        capturedCount += pageConfig.states.length;
      } catch (error) {
        console.log(
          `❌ Failed to process page ${pageConfig.name}:`,
          error.message
        );
      }
    }

    return capturedCount;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const capture = new AuthenticatedScreenshotCapture();

  try {
    await capture.init();

    // Authenticate first
    const authSuccess = await capture.authenticate();
    if (!authSuccess) {
      console.log('❌ Could not authenticate. Exiting.');
      process.exit(1);
    }

    // Capture all authenticated pages
    console.log('\n📱 Capturing authenticated pages (desktop only)...');
    const capturedCount = await capture.captureAllPages();

    console.log(`\n✅ Screenshot capture complete!`);
    console.log(`📊 Captured ${capturedCount} screenshots`);
    console.log(`📁 Saved to: ${CONFIG.screenshotsDir}`);
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
