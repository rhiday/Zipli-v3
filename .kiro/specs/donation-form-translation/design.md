# Design Document

## Overview

This design outlines the systematic translation of all donation-related forms and interfaces in the Zipli platform to support Finnish language users. The implementation will leverage the existing translation system (`useLanguage` hook and `translations.ts`) to replace hardcoded English text with translatable keys across all donation workflows.

## Architecture

### Translation System Integration

The existing translation infrastructure consists of:
- `src/lib/translations.ts` - Central translation dictionary
- `src/hooks/useLanguage.tsx` - Translation hook providing `t()` function
- `src/contexts/LanguageContext.tsx` - Language context provider

### Affected Components

The following donation-related components require translation updates:

1. **Main Donation Dashboard** (`src/app/donate/page.tsx`)
   - Impact metrics section
   - Export functionality
   - Recipient information
   - Loading states

2. **Manual Donation Form** (`src/app/donate/manual/page.tsx`)
   - Form labels and placeholders
   - Validation messages
   - Action buttons
   - Success dialogs

3. **Pickup Slot Selection** (`src/app/donate/pickup-slot/page.tsx`)
   - Time slot management
   - Date/time labels
   - Form validation

4. **Donation Summary** (`src/app/donate/summary/page.tsx`)
   - Section headers
   - Form labels
   - Confirmation messages
   - Profile update options

## Components and Interfaces

### Translation Key Structure

New translation keys will follow the existing naming convention:

```typescript
// Donation Dashboard
donationDashboard: {
  yourImpact: 'Your impact',
  totalFoodOffered: 'Total food offered',
  portionsOffered: 'Portions offered',
  savedInFoodDisposalCosts: 'Saved in food disposal costs',
  co2Avoided: 'CO2 Avoided',
  exportToPdf: 'Export to PDF',
  thisIsWhomYouveHelped: 'This is whom you\'ve helped'
}

// Manual Donation Form
manualDonation: {
  nameOfFood: 'Name of food',
  quantityKg: 'Quantity (kg)',
  addAnotherItem: 'Add another item',
  saveChanges: 'Save Changes',
  addItem: 'Add item',
  changesSaved: 'Changes saved',
  goBackToDashboard: 'Go back to Dashboard'
}

// Pickup Slot
pickupSlot: {
  addPickupSlot: 'Add pickup slot',
  pickupSlot: 'Pickup slot',
  selectADay: 'Select a day',
  startTime: 'Start time',
  endTime: 'End time',
  addAnother: '+ Add another',
  editPickupSlot: 'Edit pickup slot',
  addAnotherPickupSlot: 'Add another pickup slot'
}

// Donation Summary
donationSummary: {
  donationSummary: 'Donation summary',
  donationItems: 'Donation items',
  pickupSchedule: 'Pickup schedule',
  deliveryDetails: 'Delivery details',
  address: 'Address',
  instructionsForDriver: 'Instructions for driver',
  updateAddressInProfile: 'Also update this address in my profile for future donations',
  updateInstructionsInProfile: 'Also update these instructions in my profile as default',
  continuing: 'Continuing...'
}
```

### Component Modifications

Each component will be updated to:

1. Import the `useLanguage` hook
2. Replace hardcoded strings with `t()` function calls
3. Maintain existing functionality and styling
4. Preserve form validation logic

### Error Handling

Translation fallbacks will be handled by the existing translation system:
- Missing keys will display the key name as fallback
- English will serve as the default language
- Console warnings for missing translations in development

## Data Models

### Translation Additions

The `translations.ts` file will be extended with approximately 40+ new translation keys covering:

- Dashboard metrics and labels
- Form field labels and placeholders
- Button text and actions
- Status messages and confirmations
- Error messages and validation text

### Finnish Translations

All new keys will include contextually appropriate Finnish translations:

```typescript
fi: {
  // Dashboard
  yourImpact: 'Vaikutuksesi',
  totalFoodOffered: 'Tarjottu ruoka yhteensä',
  portionsOffered: 'Tarjotut annokset',
  savedInFoodDisposalCosts: 'Säästetty ruoan hävityskustannuksissa',
  co2Avoided: 'Vältetty CO2',
  
  // Forms
  nameOfFood: 'Ruoan nimi',
  quantityKg: 'Määrä (kg)',
  instructionsForDriver: 'Ohjeet kuljettajalle',
  // ... additional translations
}
```

## Error Handling

### Translation Error Management

- **Missing Keys**: Existing fallback mechanism will display the key name
- **Runtime Errors**: Component error boundaries will catch translation-related issues
- **Development Warnings**: Console logs for missing translation keys

### Form Validation

- Existing validation logic will be preserved
- Error messages will be translated where they exist
- New validation messages will use translation keys

## Testing Strategy

### Manual Testing

1. **Language Switching**: Verify all donation forms switch languages correctly
2. **Form Functionality**: Ensure translation changes don't break form submission
3. **Visual Consistency**: Check that Finnish text fits within existing UI layouts
4. **Edge Cases**: Test with missing translations and fallback behavior

### Automated Testing

- Update existing component tests to account for translation usage
- Add tests for translation key coverage
- Verify form functionality remains intact after translation implementation

### Browser Testing

- Test on different screen sizes to ensure Finnish text doesn't break layouts
- Verify accessibility features work with translated content
- Check that form validation messages appear correctly in both languages

## Implementation Phases

### Phase 1: Core Translation Infrastructure
- Add all required translation keys to `translations.ts`
- Verify existing translation system compatibility

### Phase 2: Component Updates
- Update each donation component to use translation hooks
- Replace hardcoded strings with translation function calls
- Maintain existing component functionality

### Phase 3: Testing and Refinement
- Manual testing of all donation workflows in both languages
- Fix any layout or functionality issues
- Refine Finnish translations for better user experience

### Phase 4: Quality Assurance
- Comprehensive testing of donation flow end-to-end
- Verify no regressions in existing functionality
- Ensure consistent translation quality across all forms