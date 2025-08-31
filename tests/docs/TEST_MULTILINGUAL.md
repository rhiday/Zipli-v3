# Testing the Multilingual System

## How to Test

### 1. Start the Development Server

```bash
npm run dev
```

Then open http://localhost:3000

### 2. Test Language Switching

Look for the language switcher component (usually in the header/navbar). Try switching between English and Finnish.

### 3. Check Translation Loading

Open the browser console and look for any translation-related warnings. In development mode, missing translations will be logged.

### 4. Test Key Areas

#### Authentication Pages

- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset

#### Main Application Pages

- `/donate` - Donation dashboard
- `/donate/manual` - Manual donation form
- `/request` - Request dashboard
- `/profile` - User profile
- `/impact` - Impact dashboard

### 5. Verify Translation Keys

The translation files are located at:

- `public/locales/en/translations.json` - English translations
- `public/locales/fi/translations.json` - Finnish translations (currently using English as placeholder)

### 6. Check Context Organization

Translation keys are organized by context:

- `common.*` - Shared across the app
- `pages.auth.*` - Authentication pages
- `pages.donations.*` - Donation-related pages
- `pages.requests.*` - Request-related pages
- `components.*` - Component-specific translations

### 7. Test Translation Hooks

Different sections use specialized hooks:

```javascript
// In donation pages
const { t } = useDonationsTranslation();

// In auth pages
const { t } = useAuthTranslation();

// For common translations
const { t } = useCommonTranslation();
```

## Known Issues to Fix

1. **Build Optimization**: Some components still need syntax cleanup for production build
2. **Finnish Translations**: Complete Finnish translations are now available

## Next Steps

1. **Production Build**:
   - Fix remaining syntax issues
   - Run `npm run build` to verify
   - Deploy to staging for testing

2. **Add Missing Translations**:
   - Review all pages for hardcoded strings
   - Test with native speakers

3. **Production Build**:
   - Fix remaining syntax issues
   - Run `npm run build` to verify
   - Deploy to staging for testing

## Quick Debug Commands

```bash
# Check for syntax errors
npm run lint

# Try production build
npm run build

# Search for hardcoded strings
grep -r '"[A-Z][a-z]*' src/ --include="*.tsx" --include="*.ts" | grep -v "t("

# Find missing translation keys
grep -r "t('" src/ | cut -d"'" -f2 | sort -u
```

## Translation File Structure

The translations follow this structure:

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel"
    },
    "navigation": {
      "home": "Home",
      "profile": "Profile"
    }
  },
  "pages": {
    "auth": {
      "login": {
        "title": "Sign in",
        "email": "Email address"
      }
    },
    "donations": {
      "create": {
        "title": "Create donation"
      }
    }
  }
}
```

This contextual organization makes it easy for translators to understand where each translation is used in the app.
