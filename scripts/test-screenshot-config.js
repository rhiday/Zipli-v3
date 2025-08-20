#!/usr/bin/env node
/**
 * Test the screenshot configuration without requiring Playwright browsers
 * This validates our config and shows what would be captured
 */

const { CONFIG, PAGES_CONFIG } = require('./capture-screenshots.js');

function testConfiguration() {
  console.log('🧪 Testing Screenshot Configuration\n');

  console.log('📊 Configuration Summary:');
  console.log(`  Base URL: ${CONFIG.baseUrl}`);
  console.log(`  Screenshots Directory: ${CONFIG.screenshotsDir}`);
  console.log(`  Viewports: ${Object.keys(CONFIG.viewports).join(', ')}`);
  console.log(`  Pages to Capture: ${PAGES_CONFIG.length}`);

  console.log('\n📱 Viewports:');
  Object.entries(CONFIG.viewports).forEach(([name, viewport]) => {
    console.log(`  ${name}: ${viewport.width}x${viewport.height}`);
  });

  console.log('\n📄 Pages Configuration:');
  PAGES_CONFIG.forEach((page, index) => {
    console.log(`\n  ${index + 1}. ${page.title}`);
    console.log(`     Path: ${page.path}`);
    console.log(`     Auth Required: ${page.requiresAuth ? 'Yes' : 'No'}`);
    console.log(`     States: ${page.states.join(', ')}`);
    console.log(`     Description: ${page.description}`);
  });

  console.log('\n📸 Expected Screenshots:');
  let totalScreenshots = 0;

  PAGES_CONFIG.forEach((page) => {
    const screenshotsForPage =
      page.states.length * Object.keys(CONFIG.viewports).length;
    totalScreenshots += screenshotsForPage;

    console.log(`\n  ${page.name}:`);
    Object.keys(CONFIG.viewports).forEach((viewport) => {
      page.states.forEach((state) => {
        const filename = `${page.name}-${state}-${CONFIG.viewports[viewport].width}x${CONFIG.viewports[viewport].height}.png`;
        console.log(`    📁 ${filename}`);
      });
    });
  });

  console.log(
    `\n✅ Total screenshots that would be captured: ${totalScreenshots}`
  );
  console.log('\n🚀 Ready to run screenshot capture!');
  console.log('\nNext steps:');
  console.log(
    '1. Install Playwright browsers: npx playwright install chromium'
  );
  console.log('2. Start your dev server: npm run dev');
  console.log('3. Run dry-run test: npm run screenshots:dry-run');
  console.log('4. Run local capture: npm run screenshots:local');
}

testConfiguration();
