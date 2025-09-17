import { test, expect } from '@playwright/test';

test('should log in successfully with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'donor@zipli.test');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation or a specific element that indicates successful login
    await expect(page).toHaveURL(/donor/);
    await expect(page.locator('text=Hello!')).toBeVisible();
});