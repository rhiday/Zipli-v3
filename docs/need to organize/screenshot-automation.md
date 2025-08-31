# Automated Screenshot Capture for Lokalise

## Overview

This system automatically captures screenshots of your Zipli application pages and uploads them to Lokalise to provide visual context for translators.

## Quick Start

### 1. Prerequisites

```bash
# Install Playwright browsers (one-time setup)
npx playwright install chromium

# Ensure your app is running
npm run dev
```

### 2. Test the Configuration

```bash
# Check what screenshots will be captured
npm run screenshots:config-test
```

### 3. Safe Testing Process

```bash
# 1. Test locally without capturing (dry run)
npm run screenshots:dry-run

# 2. Capture screenshots to local folder
npm run screenshots:local

# 3. Test upload simulation (no actual uploads)
npm run screenshots:upload-dry-run

# 4. Upload 3 test screenshots to verify
npm run screenshots:upload-test

# 5. After verification, upload all
npm run screenshots:upload-all
```

## Available Commands

### Screenshot Capture

- `npm run screenshots:config-test` - Preview configuration without browser
- `npm run screenshots:local` - Capture screenshots locally only
- `npm run screenshots:dry-run` - Simulate capture (no files created)
- `npm run screenshots:test` - Capture first 3 pages only

### Lokalise Upload

- `npm run screenshots:upload-dry-run` - Simulate upload to Lokalise
- `npm run screenshots:upload-test` - Upload 3 test screenshots
- `npm run screenshots:upload-all` - Upload all screenshots

## What Gets Captured

### Pages (6 total)

1. **Login Page** (`/login`)
   - Default state
   - Error state (invalid credentials)

2. **Registration Page** (`/register`)
   - Default state

3. **Dashboard** (`/dashboard`) _[requires auth]_
   - Default state

4. **Manual Donation Form** (`/donate/manual`) _[requires auth]_
   - Empty form state
   - Filled form state

5. **User Profile** (`/profile`) _[requires auth]_
   - Default state

6. **Food Request Page** (`/request`) _[requires auth]_
   - Default state

### Viewports (2 total)

- **Desktop**: 1920x1080
- **Mobile**: 390x844

### Total Screenshots: 16

(8 page/state combinations × 2 viewports)

## Screenshots Generated

```
screenshots/
├── login-default-1920x1080.png
├── login-default-390x844.png
├── login-error-1920x1080.png
├── login-error-390x844.png
├── register-default-1920x1080.png
├── register-default-390x844.png
├── dashboard-default-1920x1080.png
├── dashboard-default-390x844.png
├── donate-manual-empty-1920x1080.png
├── donate-manual-empty-390x844.png
├── donate-manual-filled-1920x1080.png
├── donate-manual-filled-390x844.png
├── profile-default-1920x1080.png
├── profile-default-390x844.png
├── request-default-1920x1080.png
└── request-default-390x844.png
```

## Configuration

### Authentication Setup

Update test credentials in `scripts/capture-screenshots.js`:

```javascript
testUser: {
  email: 'your-test-email@example.com',
  password: 'your-test-password'
}
```

### Adding New Pages

Add to `PAGES_CONFIG` in `scripts/capture-screenshots.js`:

```javascript
{
  name: 'new-page',
  path: '/new-page',
  title: 'New Page Title',
  description: 'Description for translators',
  requiresAuth: false, // or true
  states: ['default'] // or ['default', 'error', 'filled']
}
```

## Lokalise Integration

### Metadata Added to Each Screenshot

- **Title**: Human-readable page name and state
- **Description**: Context about the page and viewport
- **Tags**: Searchable categories

### Example Metadata

```json
{
  "title": "Login Page - Error State (Desktop)",
  "description": "User authentication page with email/password fields. Screenshot showing error state on desktop viewport (1920x1080)",
  "tags": ["login", "error", "desktop", "authentication"]
}
```

### Tags Generated

- **Page name**: `login`, `dashboard`, etc.
- **State**: `error`, `filled` (if not default)
- **Viewport**: `desktop`, `mobile`
- **Functional**: `authentication`, `forms`, `navigation`, `metrics`

## Safety Features

### Branch Isolation

- All work done in `feature/automated-screenshots` branch
- No impact on main Lokalise integration
- Easy to test and rollback

### Progressive Testing

1. **Configuration test** - No browsers needed
2. **Dry run** - Simulates everything without files
3. **Local capture** - Creates files locally only
4. **Upload dry run** - Simulates Lokalise upload
5. **Test upload** - Uploads 3 files for verification
6. **Full upload** - Only after manual approval

### Error Handling

- Graceful failure for missing pages
- Skip authenticated pages if login fails
- Continue on individual screenshot failures
- Detailed error reporting

## Troubleshooting

### Common Issues

#### "Executable doesn't exist" Error

```bash
# Install Playwright browsers
npx playwright install chromium
```

#### Authentication Failures

- Update test credentials in script
- Ensure user account exists
- Check if login flow has changed

#### Upload Failures

- Verify Lokalise API token and project ID
- Check file permissions in screenshots folder
- Ensure PNG files are valid (not empty)

#### Page Not Loading

- Ensure dev server is running (`npm run dev`)
- Check if page routes have changed
- Verify authentication requirements

### Debug Mode

Add console logs by editing the script:

```javascript
// In capture-screenshots.js, add:
console.log('Debug: Current URL:', page.url());
console.log('Debug: Page title:', await page.title());
```

## Best Practices

### When to Run

- After UI changes
- Before major releases
- When adding new pages/features
- After changing text content

### Maintenance

- Update test credentials regularly
- Remove old screenshots from Lokalise
- Update page configurations as app evolves
- Archive outdated screenshots

### Team Workflow

1. **Developer** runs screenshot capture after UI changes
2. **Content writer** gets notification of new screenshots
3. **Translator** sees updated visual context in Lokalise
4. **QA** verifies screenshots represent current UI

## Next Steps

After setting up automated screenshots:

1. **Train your team** on the new workflow
2. **Set up CI/CD integration** for automatic updates
3. **Create screenshot comparison** for detecting changes
4. **Add mobile-specific pages** if needed
5. **Consider A/B test variants** for different UIs

This system dramatically improves translation quality by giving translators perfect visual context for every piece of text!
