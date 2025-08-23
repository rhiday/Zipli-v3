/**
 * UI TESTING HELPER
 * 
 * Helper functions to test UI components for consistency and prevent breakage.
 * Use these before making any UI changes.
 */

import { translations } from '@/lib/translations';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

// Check if a component uses design system colors
export const validateDesignSystemUsage = (componentCode: string): string[] => {
  const violations: string[] = [];
  
  // Check for arbitrary color values
  const arbitraryColors = componentCode.match(/(?:bg-|text-|border-)\[#[a-fA-F0-9]+\]/g);
  if (arbitraryColors) {
    violations.push(`Arbitrary colors found: ${arbitraryColors.join(', ')}. Use design tokens instead.`);
  }
  
  // Check for arbitrary spacing
  const arbitrarySpacing = componentCode.match(/(?:p-|m-|gap-|w-|h-)\[\d+px\]/g);
  if (arbitrarySpacing) {
    violations.push(`Arbitrary spacing found: ${arbitrarySpacing.join(', ')}. Use spacing scale.`);
  }
  
  // Check for arbitrary border radius
  const arbitraryRadius = componentCode.match(/rounded-\[\d+px\]/g);
  if (arbitraryRadius) {
    violations.push(`Arbitrary border radius found: ${arbitraryRadius.join(', ')}. Use radius scale.`);
  }
  
  return violations;
};

// Check if all text has translations
export const validateTranslations = (componentCode: string): string[] => {
  const violations: string[] = [];
  
  // Find hardcoded English text (basic detection)
  const hardcodedText = componentCode.match(/>[\s]*[A-Z][a-zA-Z\s]+</g);
  if (hardcodedText) {
    hardcodedText.forEach(text => {
      const cleanText = text.replace(/[<>]/g, '').trim();
      if (cleanText.length > 2 && !cleanText.includes('{')) {
        violations.push(`Potential hardcoded text: "${cleanText}". Add to translations.`);
      }
    });
  }
  
  // Check for missing t() calls on quoted strings
  const quotedStrings = componentCode.match(/"[A-Z][a-zA-Z\s]+"/g);
  if (quotedStrings) {
    quotedStrings.forEach(str => {
      if (!componentCode.includes(`t(${str})`)) {
        violations.push(`Quoted string ${str} might need translation.`);
      }
    });
  }
  
  return violations;
};

// Check component consistency patterns
export const validateComponentPatterns = (componentCode: string): string[] => {
  const violations: string[] = [];
  
  // Check for consistent button patterns
  if (componentCode.includes('<button') || componentCode.includes('<Button')) {
    if (!componentCode.includes('transition-') && !componentCode.includes('buildButtonClasses')) {
      violations.push('Buttons should include transitions for better UX.');
    }
  }
  
  // Check for consistent card patterns
  if (componentCode.includes('bg-white') || componentCode.includes('bg-base')) {
    if (!componentCode.includes('rounded-') && !componentCode.includes('buildCardClasses')) {
      violations.push('Cards should have consistent border radius.');
    }
  }
  
  // Check for proper focus states
  if (componentCode.includes('onClick') || componentCode.includes('onPress')) {
    if (!componentCode.includes('focus:') && !componentCode.includes('focus-visible:')) {
      violations.push('Interactive elements should have focus states for accessibility.');
    }
  }
  
  return violations;
};

// Complete component validation
export const validateComponent = (componentCode: string, componentName: string) => {
  const allViolations = [
    ...validateDesignSystemUsage(componentCode),
    ...validateTranslations(componentCode), 
    ...validateComponentPatterns(componentCode)
  ];
  
  if (allViolations.length > 0) {
    console.group(`🚨 UI Guidelines Violations in ${componentName}:`);
    allViolations.forEach(violation => console.warn(`• ${violation}`));
    console.groupEnd();
    
    return {
      isValid: false,
      violations: allViolations
    };
  }
  
  console.log(`✅ ${componentName} passes UI validation`);
  return {
    isValid: true,
    violations: []
  };
};

// Check translation key exists
export const validateTranslationKey = (key: string): boolean => {
  return key in translations.en;
};

// Get all translation keys for reference
export const getAllTranslationKeys = (): string[] => {
  return Object.keys(translations.en);
};

// Suggest similar translation keys
export const suggestTranslationKey = (searchTerm: string): string[] => {
  const allKeys = getAllTranslationKeys();
  const suggestions = allKeys.filter(key => 
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translations.en[key as keyof typeof translations.en].toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return suggestions.slice(0, 5); // Return top 5 matches
};

// Page validation checklist
export const pageValidationChecklist = {
  mobileViewport: '✓ Tested on 375px width',
  translations: '✓ Works in Finnish and English',
  userRoles: '✓ Tested with all user roles',
  accessibility: '✓ Keyboard navigation works',
  noConsoleErrors: t('common._no_console_errors'),
  buildSuccess: '✓ Build succeeds (pnpm build)'
};

// Development helper to print validation checklist
export const printValidationChecklist = () => {
  console.group('📋 Pre-Deployment Validation Checklist:');
  Object.entries(pageValidationChecklist).forEach(([key, item]) => {
    console.log(item);
  });
  console.groupEnd();
};