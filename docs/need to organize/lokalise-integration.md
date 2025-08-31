# Lokalise Integration

## Overview

Zipli uses Lokalise for managing translations and content in multiple languages. This allows content writers to update text without touching code.

## Setup Status

### ✅ Completed

- [x] Exported existing translations to JSON format (246 keys)
- [x] Created sync scripts for Lokalise API
- [x] Added npm scripts for translation management
- [x] Created documentation for setup and content writers
- [x] Prepared environment variable configuration

### ⏳ Pending

- [ ] Create Lokalise account (Free plan)
- [ ] Upload translations to Lokalise
- [ ] Configure API credentials
- [ ] Test sync workflow

## Files Created

```
📁 Project Structure
├── 📄 scripts/
│   ├── export-translations.js    # One-time export script
│   └── lokalise-sync.js         # Sync script for pull/push
├── 📄 public/locales/
│   ├── en/common.json           # English translations
│   ├── fi/common.json           # Finnish translations
│   └── translations-for-lokalise.json  # Combined for import
├── 📄 docs/
│   ├── lokalise-setup.md        # Setup guide
│   ├── content-writer-guide.md  # Content writer documentation
│   └── lokalise-integration.md  # This file
└── 📄 .env.local.example        # Environment variables template
```

## Quick Start

### 1. Set Up Lokalise Account

1. Go to [lokalise.com](https://lokalise.com)
2. Sign up for FREE plan
3. Create project "Zipli"
4. Upload `public/locales/translations-for-lokalise.json`

### 2. Configure Environment

```bash
# Copy example file
cp .env.local.example .env.local

# Edit with your credentials
# LOKALISE_API_TOKEN=your_token
# LOKALISE_PROJECT_ID=your_project_id
```

### 3. Available Commands

```bash
# Pull translations from Lokalise
npm run lokalise:pull

# Push translations to Lokalise
npm run lokalise:push

# Sync (push then pull)
npm run lokalise:sync
```

## How It Works

### Current Implementation

1. **Simple key-value system** - No complex i18n framework
2. **Lokalise as source of truth** - All translations managed in web UI
3. **Manual sync process** - Developers pull changes when needed
4. **Automatic file generation** - Updates both JSON and TypeScript files

### Translation Flow

```
Lokalise Web UI → lokalise:pull → JSON files → translations.ts → App
```

### Content Writer Workflow

1. Login to Lokalise
2. Edit translations in web interface
3. Notify developers
4. Developers pull and deploy

### Developer Workflow

1. Content writer makes changes
2. Run `npm run lokalise:pull`
3. Test locally
4. Commit and deploy

## Benefits

✅ **No manual file editing** - Content managed through web UI
✅ **Version control** - Translation history in Lokalise
✅ **Collaboration** - Comments and team features
✅ **Free forever** - 500 keys on free plan (we use 246)
✅ **Simple integration** - No complex framework changes

## Next Steps

After setting up Lokalise account:

1. Test the sync workflow
2. Grant access to content writers
3. Document any project-specific guidelines
4. Consider automation with GitHub Actions (optional)

## Support

- **Setup Issues**: Follow `docs/lokalise-setup.md`
- **Content Writing**: See `docs/content-writer-guide.md`
- **Technical Issues**: Check sync script logs
