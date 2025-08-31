# Visual Context for Translations in Lokalise

## Overview

Lokalise provides several ways to give translators visual context about where text appears in your app.

## Method 1: Manual Screenshots (Recommended for Free Plan)

### Step 1: Take Screenshots

Capture key pages of your app:

- Login page
- Dashboard
- Donation forms
- Request forms
- Profile page
- Error states

### Step 2: Upload to Lokalise

1. Go to **Screenshots** tab in Lokalise
2. Click **Upload screenshots**
3. Select your images

### Step 3: Tag Keys to Screenshots

1. Click on uploaded screenshot
2. Draw rectangles around text elements
3. Link each rectangle to its translation key
4. Lokalise will show this context when editing

### Benefits:

- ✅ Available on Free plan
- ✅ Translators see exactly where text appears
- ✅ Shows text in context with other elements
- ✅ Helps with length constraints

## Method 2: Add Context Descriptions

Run the context script to add descriptions:

```bash
node scripts/add-translation-context.js
```

This adds:

- **Description**: Where/how the text is used
- **Character limits**: Maximum length constraints
- **Tags**: Categories like "nav-menu", "buttons", "errors"

## Method 3: Browser Extension (Advanced)

### Lokalise Context Capture Extension

1. Install Lokalise browser extension
2. Navigate to your app
3. Click "Capture" mode
4. Click on text elements
5. Extension auto-links to translation keys

## Method 4: Automated Screenshots (Developer Setup)

### Using Playwright for Automation

```javascript
// scripts/capture-screenshots.js
const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Login page
  await page.goto('http://localhost:3000/login');
  await page.screenshot({
    path: 'screenshots/login-page.png',
    fullPage: true,
  });

  // Dashboard
  await page.goto('http://localhost:3000/dashboard');
  await page.screenshot({
    path: 'screenshots/dashboard.png',
    fullPage: true,
  });

  // Add more pages...

  await browser.close();
}
```

## Best Practices

### 1. Screenshot Organization

- Name screenshots clearly: `dashboard-donor.png`, `form-donation.png`
- Capture different states: empty, filled, error
- Include hover states for buttons
- Show mobile and desktop views

### 2. Key Tagging Strategy

- Tag related keys together (all nav items)
- Use consistent tag names
- Group by page/feature
- Mark critical UI elements

### 3. Context Information

Include in descriptions:

- Where text appears (button, heading, error)
- When it's shown (on hover, after submit)
- Any special formatting needs
- Related keys that appear together

### 4. Length Constraints

Always specify max lengths for:

- Navigation items (15-20 chars)
- Buttons (10-15 chars)
- Mobile UI elements (even shorter)
- Error messages (40-50 chars)

## Lokalise Screenshot Features

### Auto-Detection

- Lokalise OCR can detect text in screenshots
- Automatically suggests key matches
- Links keys to visual regions

### Version Control

- Keep screenshots updated with UI changes
- Archive old screenshots
- Track which keys need new context

### Comments on Screenshots

- Translators can add comments on specific regions
- Discuss visual placement issues
- Flag text that doesn't fit

## Integration with Development

### Continuous Updates

1. Add screenshot capture to CI/CD
2. Auto-upload after UI changes
3. Flag outdated screenshots
4. Notify translators of visual changes

### Design Handoff

- Export from Figma with Lokalise plugin
- Link design specs to translation keys
- Show intended visual hierarchy

## Tips for Content Writers

### Using Visual Context

1. **Check screenshots** before translating
2. **Consider surrounding text** for consistency
3. **Respect space constraints** shown in screenshots
4. **Test different text lengths** if possible
5. **Flag issues** if translation won't fit

### Common Issues to Watch

- Text overflow in buttons
- Navigation items too long
- Form labels breaking layout
- Error messages getting cut off

## Next Steps

1. **Upload initial screenshots** of main pages
2. **Run context script** to add descriptions
3. **Train content team** on using visual features
4. **Set up regular screenshot updates** as UI evolves

This visual context dramatically improves translation quality by showing translators exactly how and where their text will appear!
