# Implementation Plan

- [x] 1. Add donation-related translation keys to translation system
  - Add comprehensive Finnish translations for all donation form text
  - Include dashboard metrics, form labels, buttons, and validation messages
  - Follow existing translation key naming conventions
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [x] 2. Update main donation dashboard to use translations
  - Import useLanguage hook in src/app/donate/page.tsx
  - Replace hardcoded English text with translation function calls
  - Update impact metrics section, export functionality, and recipient information
  - Preserve existing functionality and styling
  - _Requirements: 1.1, 1.4, 3.1, 3.3_

- [x] 3. Implement translations in manual donation form
  - Import useLanguage hook in src/app/donate/manual/page.tsx
  - Replace form labels, placeholders, and button text with translations
  - Update validation messages and success dialogs
  - Maintain existing form validation logic and functionality
  - _Requirements: 1.2, 2.1, 3.1, 3.4_

- [x] 4. Add translations to pickup slot selection page
  - Import useLanguage hook in src/app/donate/pickup-slot/page.tsx
  - Replace time slot management labels and form text with translations
  - Update date/time picker labels and validation messages
  - Preserve existing date/time selection functionality
  - _Requirements: 1.2, 2.1, 3.1, 3.4_

- [ ] 5. Implement translations in donation summary page
  - Import useLanguage hook in src/app/donate/summary/page.tsx
  - Replace section headers, form labels, and confirmation messages with translations
  - Update profile update option text and address/instruction labels
  - Maintain existing form submission and profile update logic
  - _Requirements: 1.2, 1.3, 2.1, 3.1, 3.4_

- [ ] 6. Test translation implementation across all donation forms
  - Verify language switching works correctly in all donation components
  - Test form functionality remains intact after translation changes
  - Check that Finnish text fits properly within existing UI layouts
  - Validate that all hardcoded text has been replaced with translation keys
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.3, 3.4_