import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000');

  // Check that the page loads
  await expect(page).toHaveTitle(/Zipli/);

  // Take a screenshot
  await page.screenshot({ path: 'tests/screenshots/homepage.png' });
});

test('login page is accessible', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login');

  // Check that login form elements are present
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: 'tests/screenshots/login-page.png' });
});
