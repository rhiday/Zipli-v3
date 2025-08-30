# 📸 Screenshot Capture Setup Instructions

## Current Status

✅ **Configuration Complete** - All 31 pages (84 screenshots total) configured
✅ **Scripts Ready** - Capture and upload scripts are ready
⏳ **Browser Installation** - Playwright browser download in progress

## Quick Setup (After Browser Installation)

### 1. Complete Browser Installation

If the installation timed out, run:

```bash
npx playwright install chromium
```

This will download ~125MB for Chromium browser.

### 2. Start Your Dev Server

```bash
npm run dev
```

Keep this running in a separate terminal.

### 3. Test Everything Works

```bash
# Test configuration (no browser needed)
npm run screenshots:config-test

# Test dry-run (needs browser but doesn't capture)
npm run screenshots:dry-run
```

### 4. Capture Screenshots Locally

```bash
# Capture all 84 screenshots to ./screenshots folder
npm run screenshots:local
```

This will take 2-3 minutes to capture all pages.

### 5. Review Screenshots

Check the `./screenshots` folder to see captured images.

## What Will Be Captured

### 📊 Statistics

- **31 pages** total
- **84 screenshots** (with different states and viewports)
- **2 viewports**: Desktop (1920x1080) and Mobile (390x844)

### 📄 Page Coverage

#### Public Pages (No Auth Required)

- Home page
- Login (with error state)
- Register (with error state)
- Forgot Password (with sent state)
- Reset Password (with success state)
- Email Verification
- QR Login
- City page
- Admin QR Login

#### Authenticated Pages

- 6 Dashboards (Main, Donor, Receiver, City, Terminal, Admin)
- 7 Donation flow pages
- 5 Request flow pages
- Feed (with empty state)
- Impact metrics
- Profile (with edit mode)

## Troubleshooting

### If Browser Installation Fails

```bash
# Try with sudo if permissions issue
sudo npx playwright install chromium

# Or install all browsers
npx playwright install

# Or try with npm directly
npm install -D playwright
npx playwright install chromium
```

### If Screenshots Fail

1. **Check dev server is running**: http://localhost:3000
2. **Update test credentials** in `scripts/capture-screenshots.js`:
   ```javascript
   testUser: {
     email: 'your-test@example.com',
     password: 'your-password'
   }
   ```
3. **Skip auth pages**: Comment out pages that require auth if login isn't working

### Manual Alternative

If automated capture doesn't work, you can:

1. Manually take screenshots using browser DevTools
2. Use browser extensions like:
   - Full Page Screen Capture
   - Awesome Screenshot
   - GoFullPage

## Export Screenshots

After capturing screenshots:

### Test Upload (3 files)

```bash
npm run screenshots:upload-test
```

### Upload All

```bash
npm run screenshots:upload-all
```

### Dry Run (No actual upload)

```bash
npm run screenshots:upload-dry-run
```

## Next Steps

1. **Install browsers** (if not done)
2. **Run local capture**
3. **Review screenshots**
4. **Export screenshots** for documentation
5. **Tag screenshots** for reference
6. **Train content team** on using visual context

## Summary of Commands

```bash
# Configuration test (no setup needed)
npm run screenshots:config-test

# Capture workflows
npm run screenshots:dry-run     # Test without capturing
npm run screenshots:local       # Capture to local folder
npm run screenshots:test        # Capture first 3 pages only

# Upload workflows
npm run screenshots:upload-dry-run  # Simulate upload
npm run screenshots:upload-test     # Upload 3 test files
npm run screenshots:upload-all      # Upload everything
```

## Manual Screenshot Checklist

If doing manually, capture these key pages:

- [ ] Login page (desktop + mobile)
- [ ] Registration page
- [ ] Forgot password
- [ ] Dashboard (main view)
- [ ] Donation form (empty + filled)
- [ ] Request form
- [ ] Food feed
- [ ] Profile page
- [ ] Impact metrics
- [ ] Thank you/success pages

Remember to capture:

- Error states (wrong password, validation errors)
- Empty states (no data)
- Success states (confirmations)
- Mobile views for each page
