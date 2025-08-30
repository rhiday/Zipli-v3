#!/usr/bin/env node
/**
 * Automated Screenshot Capture for Translation Context
 *
 * This script captures screenshots of key pages in the Zipli app
 * to provide visual context for translators.
 *
 * Usage:
 *   npm run screenshots:local     # Save screenshots locally only
 *   npm run screenshots:dry-run   # Simulate screenshot capture
 *   npm run screenshots:test      # Capture 2-3 test screenshots
 *   npm run screenshots:capture   # Full screenshot capture
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotsDir: path.join(__dirname, '../screenshots'),
  viewports: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 390, height: 844 },
  },
  // Test credentials - update these for your app
  testUser: {
    email: 'sodexo.ladonlukko@sodexo.com',
    password: 'password',
  },
};

// Pages to capture with their metadata
const PAGES_CONFIG = [
  // ===================
  // PUBLIC PAGES
  // ===================
  {
    name: 'home',
    path: '/',
    title: 'Home Page',
    description: 'Landing page for the Zipli application',
    requiresAuth: false,
    states: ['default'],
  },

  // ===================
  // AUTHENTICATION PAGES
  // ===================
  {
    name: 'login',
    path: '/login',
    title: 'Login Page',
    description: 'User authentication page with email/password fields',
    requiresAuth: false,
    states: ['default', 'error'],
  },
  {
    name: 'auth-login',
    path: '/auth/login',
    title: 'Auth Login Page',
    description: 'Alternative login page route',
    requiresAuth: false,
    states: ['default', 'error'],
  },
  {
    name: 'register',
    path: '/auth/register',
    title: 'Registration Page',
    description: 'New user account creation form',
    requiresAuth: false,
    states: ['default', 'error'],
  },
  {
    name: 'forgot-password',
    path: '/auth/forgot-password',
    title: 'Forgot Password Page',
    description: 'Password reset request form',
    requiresAuth: false,
    states: ['default', 'sent'],
  },
  {
    name: 'reset-password',
    path: '/auth/reset-password',
    title: 'Reset Password Page',
    description: 'Form to set new password after reset',
    requiresAuth: false,
    states: ['default', 'success'],
  },
  {
    name: 'verify-email',
    path: '/auth/verify-email',
    title: 'Email Verification Page',
    description: 'Email verification confirmation page',
    requiresAuth: false,
    states: ['default'],
  },
  {
    name: 'qr-login',
    path: '/auth/qr-login',
    title: 'QR Code Login Page',
    description: 'Login using QR code scan',
    requiresAuth: false,
    states: ['default'],
  },

  // ===================
  // MAIN DASHBOARDS
  // ===================
  {
    name: 'dashboard',
    path: '/dashboard',
    title: 'Main Dashboard',
    description: 'Primary dashboard showing user activity and metrics',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'donor-dashboard',
    path: '/donor/dashboard',
    title: 'Donor Dashboard',
    description: 'Dashboard for food donors showing donations and impact',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'receiver-dashboard',
    path: '/receiver/dashboard',
    title: 'Receiver Dashboard',
    description:
      'Dashboard for food receivers showing requests and received items',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'city-dashboard',
    path: '/city/dashboard',
    title: 'City Dashboard',
    description: 'Dashboard for city administrators',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'terminal-dashboard',
    path: '/terminal/dashboard',
    title: 'Terminal Dashboard',
    description: 'Dashboard for terminal operators',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'admin-dashboard',
    path: '/admin/dashboard',
    title: 'Admin Dashboard',
    description: 'System administrator dashboard',
    requiresAuth: true,
    states: ['default'],
  },

  // ===================
  // DONATION FLOW
  // ===================
  {
    name: 'donate',
    path: '/donate',
    title: 'Donate Main Page',
    description: 'Main donation page with options',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'donate-new',
    path: '/donate/new',
    title: 'New Donation Page',
    description: 'Start new donation flow',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'donate-manual',
    path: '/donate/manual',
    title: 'Manual Donation Form',
    description: 'Form for creating food donations manually',
    requiresAuth: true,
    states: ['empty', 'filled'],
  },
  {
    name: 'donate-pickup-slot',
    path: '/donate/pickup-slot',
    title: 'Donation Pickup Slot',
    description: 'Schedule pickup time for donation',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'donate-summary',
    path: '/donate/summary',
    title: 'Donation Summary',
    description: 'Review donation before confirmation',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'donate-thank-you',
    path: '/donate/thank-you',
    title: 'Donation Thank You',
    description: 'Confirmation page after successful donation',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'donate-all-offers',
    path: '/donate/all-offers',
    title: 'All Donation Offers',
    description: 'List of all available donation offers',
    requiresAuth: true,
    states: ['default', 'empty'],
  },

  // ===================
  // REQUEST FLOW
  // ===================
  {
    name: 'request',
    path: '/request',
    title: 'Food Request Page',
    description: 'Page for browsing and requesting available food',
    requiresAuth: true,
    states: ['default', 'empty'],
  },
  {
    name: 'request-new',
    path: '/request/new',
    title: 'New Food Request',
    description: 'Form to create new food request',
    requiresAuth: true,
    states: ['empty', 'filled'],
  },
  {
    name: 'request-pickup-slot',
    path: '/request/pickup-slot',
    title: 'Request Pickup Slot',
    description: 'Schedule pickup time for food request',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'request-summary',
    path: '/request/summary',
    title: 'Request Summary',
    description: 'Review food request before submission',
    requiresAuth: true,
    states: ['default'],
  },
  {
    name: 'request-success',
    path: '/request/success',
    title: 'Request Success Page',
    description: 'Confirmation page after successful request submission',
    requiresAuth: true,
    states: ['default'],
  },

  // ===================
  // FEED & DISCOVERY
  // ===================
  {
    name: 'feed',
    path: '/feed',
    title: 'Food Feed',
    description: 'Browse available food donations',
    requiresAuth: true,
    states: ['default', 'empty'],
  },
  {
    name: 'impact',
    path: '/impact',
    title: 'Impact Page',
    description: 'View environmental and social impact metrics',
    requiresAuth: true,
    states: ['default'],
  },

  // ===================
  // PROFILE & SETTINGS
  // ===================
  {
    name: 'profile',
    path: '/profile',
    title: 'User Profile',
    description: 'User profile settings and information',
    requiresAuth: true,
    states: ['default', 'edit'],
  },

  // ===================
  // CITY/ADMIN PAGES
  // ===================
  {
    name: 'city',
    path: '/city',
    title: 'City Page',
    description: 'City-specific information and features',
    requiresAuth: false,
    states: ['default'],
  },
  {
    name: 'admin-qr-login',
    path: '/admin/qr-login',
    title: 'Admin QR Login',
    description: 'QR code login for administrators',
    requiresAuth: false,
    states: ['default'],
  },
];

class ScreenshotCapture {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.testMode = options.testMode || false;
    this.uploadToLokalise = false;
    this.browser = null;
    this.context = null;
    this.screenshots = [];
  }

  async init() {
    console.log('🚀 Starting screenshot capture...');
    console.log(
      `Mode: ${this.dryRun ? 'DRY RUN' : this.testMode ? 'TEST' : 'PRODUCTION'}`
    );

    // Create screenshots directory
    if (!fs.existsSync(CONFIG.screenshotsDir)) {
      fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({ headless: true });
  }

  async createContext(viewport) {
    if (this.context) {
      await this.context.close();
    }

    this.context = await this.browser.newContext({
      viewport: viewport,
      // Disable animations for consistent screenshots
      reducedMotion: 'reduce',
    });

    return this.context;
  }

  async authenticateUser(page) {
    console.log('  🔐 Authenticating user...');

    try {
      // Navigate to login
      await page.goto(`${CONFIG.baseUrl}/login`);
      await page.waitForLoadState('networkidle');

      // Fill login form
      await page.fill(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
        CONFIG.testUser.email
      );
      await page.fill(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
        CONFIG.testUser.password
      );

      // Submit form
      await page.click(
        '[data-testid="login-button"], button[type="submit"], button:has-text("Sign in"), button:has-text("Login")'
      );

      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('  ✅ Authentication successful');
      return true;
    } catch (error) {
      console.log(
        '  ⚠️  Authentication failed (this is OK if auth is not set up):',
        error.message
      );
      return false;
    }
  }

  async capturePageStates(page, pageConfig, viewport) {
    const results = [];

    for (const state of pageConfig.states) {
      try {
        console.log(`    📸 Capturing ${state} state...`);

        // Navigate to page
        await page.goto(`${CONFIG.baseUrl}${pageConfig.path}`);
        await page.waitForLoadState('networkidle');

        // Setup different states
        await this.setupPageState(page, pageConfig, state);

        // Generate filename
        const filename = `${pageConfig.name}-${state}-${viewport.width}x${viewport.height}.png`;
        const filepath = path.join(CONFIG.screenshotsDir, filename);

        // Take screenshot
        if (!this.dryRun) {
          await page.screenshot({
            path: filepath,
            fullPage: true,
            animations: 'disabled',
          });
        }

        const screenshotData = {
          filename,
          filepath: this.dryRun ? '[DRY RUN - Not saved]' : filepath,
          pageConfig,
          state,
          viewport,
          tags: this.generateTags(pageConfig, state),
          description: `${pageConfig.description} (${state} state, ${viewport.width}x${viewport.height})`,
        };

        results.push(screenshotData);
        this.screenshots.push(screenshotData);

        console.log(
          `    ✅ ${this.dryRun ? 'Simulated' : 'Captured'}: ${filename}`
        );
      } catch (error) {
        console.log(`    ❌ Failed to capture ${state} state:`, error.message);
      }
    }

    return results;
  }

  async setupPageState(page, pageConfig, state) {
    // Wait a bit for page to settle
    await page.waitForTimeout(1000);

    switch (state) {
      case 'error':
        if (pageConfig.name === 'login') {
          // Trigger login error
          await page.fill('input[type="email"]', 'invalid@email.com');
          await page.fill('input[type="password"]', 'wrongpassword');
          await page.click('button[type="submit"]');
          await page.waitForTimeout(2000); // Wait for error message
        }
        break;

      case 'filled':
        if (pageConfig.name === 'donate-manual') {
          // Fill donation form
          await page.fill(
            'input[name="foodName"], input[placeholder*="food"]',
            'Fresh Bread'
          );
          await page.fill(
            'input[name="quantity"], input[placeholder*="quantity"]',
            '5'
          );
          await page.fill(
            'textarea[name="description"], textarea',
            'Freshly baked bread from our bakery'
          );
        }
        break;

      case 'default':
      default:
        // No special setup needed for default state
        break;
    }
  }

  generateTags(pageConfig, state) {
    const tags = [pageConfig.name];

    if (pageConfig.requiresAuth) {
      tags.push('authenticated');
    }

    if (state !== 'default') {
      tags.push(state);
    }

    // Add functional tags
    if (
      pageConfig.name.includes('form') ||
      pageConfig.path.includes('donate') ||
      pageConfig.path.includes('request')
    ) {
      tags.push('forms');
    }

    if (pageConfig.name === 'dashboard') {
      tags.push('navigation', 'metrics');
    }

    return tags;
  }

  async captureAllPages() {
    const results = [];
    let isAuthenticated = false;

    // Capture for both desktop and mobile
    for (const [viewportName, viewport] of Object.entries(CONFIG.viewports)) {
      console.log(
        `\n📱 Capturing ${viewportName} screenshots (${viewport.width}x${viewport.height})...`
      );

      const context = await this.createContext(viewport);
      const page = await context.newPage();

      // Pages to capture in test mode (first 3)
      const pagesToCapture = this.testMode
        ? PAGES_CONFIG.slice(0, 3)
        : PAGES_CONFIG;

      for (const pageConfig of pagesToCapture) {
        console.log(`\n  📄 Processing: ${pageConfig.title}`);

        // Authenticate if needed and not already done
        if (pageConfig.requiresAuth && !isAuthenticated) {
          isAuthenticated = await this.authenticateUser(page);
          if (!isAuthenticated && pageConfig.requiresAuth) {
            console.log('  ⏭️  Skipping authenticated page (no auth setup)');
            continue;
          }
        }

        const pageResults = await this.capturePageStates(
          page,
          pageConfig,
          viewport
        );
        results.push(...pageResults);
      }

      await context.close();
    }

    return results;
  }

  async uploadToLokaliseAPI(screenshots) {
    console.log('\n💾 Screenshots saved locally.');
  }

  async run() {
    try {
      await this.init();
      const screenshots = await this.captureAllPages();
      await this.uploadToLokaliseAPI(screenshots);

      console.log('\n✅ Screenshot capture complete!');
      console.log(`📊 Captured ${screenshots.length} screenshots`);
      console.log(`📁 Saved to: ${CONFIG.screenshotsDir}`);

      if (!this.dryRun) {
        console.log('\nNext steps:');
        console.log('1. Review screenshots in ./screenshots/ folder');
        console.log('2. Use screenshots for documentation');
      }
    } catch (error) {
      console.error('❌ Screenshot capture failed:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    testMode: args.includes('--test'),
  };

  const capture = new ScreenshotCapture(options);
  await capture.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ScreenshotCapture, CONFIG, PAGES_CONFIG };
