# Content Writer Guide - Zipli Translations

## Overview

This guide explains how to manage and update content in multiple languages for the Zipli application using Lokalise.

## Getting Started

### 1. Accept Invitation

- Check your email for Lokalise invitation
- Click the invitation link
- Create your Lokalise account

### 2. Access Your Project

1. Login to [app.lokalise.com](https://app.lokalise.com)
2. Select "Zipli" project from dashboard

## Managing Translations

### Understanding the Interface

#### Key Elements:

- **Keys**: The identifier for each piece of text (e.g., `dashboard`, `welcome`)
- **Languages**: EN (English) and FI (Finnish) columns
- **Search Bar**: Find specific translations quickly
- **Filters**: Filter by language, status, or tags

### How to Edit Content

#### 1. Find the Text

- Use the **search bar** to find specific text
- Or browse through the list
- Click on any translation to edit

#### 2. Edit Translations

1. Click on the text you want to change
2. Type your new translation
3. Press Enter or click outside to save
4. Changes are saved automatically

#### 3. Add Context

- Click the **comment icon** to add notes
- Useful for explaining context or special requirements
- Developers will see these comments

### Best Practices

#### Content Guidelines

1. **Keep it concise**: UI text should be short and clear
2. **Be consistent**: Use the same terminology throughout
3. **Consider space**: Finnish text is often longer than English
4. **Use proper tone**: Professional but friendly

#### Finnish Translation Tips

- Finnish text is typically 20-30% longer than English
- Test important labels to ensure they fit in the UI
- Keep button text especially short
- Use commonly understood terms

### Common Translation Areas

#### Navigation & Menus

- `dashboard` - Main dashboard
- `donate` - Donation section
- `request` - Request section
- `profile` - User profile

#### Action Buttons

- `save` - Save action
- `cancel` - Cancel action
- `submit` - Submit form
- `continue` - Continue to next step

#### Forms & Fields

- `email` - Email address
- `password` - Password
- `fullName` - Full name
- `organizationName` - Organization name

#### Messages

- `welcomeBack` - Login greeting
- `donationCreated` - Success message
- `error` - Error messages
- `loading` - Loading states

### Special Features

#### Variables in Text

Some translations contain variables like `{name}` or `{count}`:

- **Don't remove** the curly braces
- **Keep variable names** exactly as they are
- Place them naturally in your translation

Example:

- English: `Welcome back, {name}!`
- Finnish: `Tervetuloa takaisin, {name}!`

#### Pluralization

Some keys have plural forms:

- `{count, plural, one {# item} other {# items}}`
- Translate each form appropriately

### Workflow

#### Daily Tasks

1. **Check for untranslated content**
   - Filter by "Untranslated" status
   - Complete any missing translations

2. **Review flagged items**
   - Look for items marked for review
   - Update as needed

3. **Respond to comments**
   - Check and respond to developer comments
   - Ask questions if context is unclear

#### When You're Done

1. **Review your changes** using the history feature
2. **Notify developers** via Slack/email that translations are ready
3. **Wait for deployment** (developers will pull and deploy changes)

### Getting Help

#### If You're Unsure

- Add a **comment** to the translation asking for clarification
- Use the **screenshot** feature to see where text appears
- Ask developers for context

#### Common Issues

**Text doesn't fit in the UI:**

- Shorten the translation
- Use abbreviations if appropriate
- Flag it for developer attention

**Missing context:**

- Check the key name for hints
- Look at nearby translations
- Ask in comments

**Technical terms:**

- Keep technical terms in English if commonly used
- Or use established Finnish equivalents
- Be consistent throughout

### Quick Reference

#### Status Indicators

- ✅ **Translated** - Content is complete
- ⚠️ **Untranslated** - Needs translation
- 🔍 **Reviewed** - Has been checked
- 📝 **Modified** - Recently changed

#### Keyboard Shortcuts

- `Enter` - Save current translation
- `Tab` - Move to next field
- `Cmd/Ctrl + F` - Search
- `Esc` - Cancel editing

### Contact

For questions or issues:

- **Technical issues**: Contact the development team
- **Translation questions**: Use comments in Lokalise
- **Access problems**: Contact your project manager

---

## Appendix: Key Naming Convention

Understanding key names helps you know what you're translating:

- **Page titles**: `welcomeToZipli`, `foodDonorDashboard`
- **Buttons**: `createDonation`, `saveChanges`
- **Labels**: `emailAddress`, `organizationName`
- **Messages**: `donationCreated`, `errorOccurred`
- **Navigation**: `dashboard`, `profile`, `donate`

Keys are organized logically to make them easy to find and understand.
