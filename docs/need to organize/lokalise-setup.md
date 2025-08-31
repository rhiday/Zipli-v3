# Lokalise Setup Guide

## 1. Create Lokalise Account

1. Go to [lokalise.com](https://lokalise.com)
2. Click "Try it free"
3. Sign up with your email
4. Select the **Free plan** (includes 500 keys, 2 projects, web editor)

## 2. Create Your Project

1. Click "New project"
2. Project name: `Zipli`
3. Base language: `English (en)`
4. Target languages: Add `Finnish (fi)`
5. Project type: Select "Web or mobile app"

## 3. Import Translations

### Option A: Manual Upload (Recommended for initial setup)

1. In Lokalise, go to your project
2. Click "Upload" button
3. Upload the file: `public/locales/translations-for-lokalise.json`
4. Select format: JSON
5. Configure import:
   - Enable "Detect ICU plurals"
   - Language mapping:
     - `en` → English
     - `fi` → Finnish

### Option B: Using CLI (after setup)

```bash
npm run lokalise:push
```

## 4. Get Your API Token

1. Go to your Profile settings (click avatar → Profile settings)
2. Navigate to "API tokens" tab
3. Generate a new token with Read/Write access
4. Copy the token (you'll need it for CLI setup)

## 5. Get Your Project ID

1. Go to your Zipli project in Lokalise
2. Click "More" → "Settings"
3. Copy the Project ID (looks like: `1234567890abcdef.12345678`)

## 6. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
LOKALISE_API_TOKEN=your_api_token_here
LOKALISE_PROJECT_ID=your_project_id_here
```

## 7. Team Access Setup

1. In Lokalise project, go to "Contributors"
2. Click "Invite"
3. Add team members:
   - **Content Writers**: Role = "Translator" or "Editor"
   - **Developers**: Role = "Admin"
4. They'll receive an email invitation

## Next Steps

After Lokalise account setup:

1. Install Lokalise CLI: `npm install -D @lokalise/cli`
2. Configure sync scripts in package.json
3. Test pulling translations: `npm run lokalise:pull`

## Content Writer Workflow

1. **Login** to Lokalise
2. **Select** the Zipli project
3. **Edit translations**:
   - Use the search to find specific keys
   - Click on any translation to edit
   - Changes are saved automatically
4. **Notify developers** when ready for deployment

## Developer Workflow

1. **Pull latest translations**: `npm run lokalise:pull`
2. **Test locally**: `npm run dev`
3. **Commit changes**: `git add . && git commit -m "Update translations"`
4. **Deploy**: Follow normal deployment process

## Tips

- Use the **search** feature to quickly find translations
- Add **comments** to translations for context
- Use **tags** to organize related translations
- Enable **notifications** for translation updates
- Use **history** to track changes
