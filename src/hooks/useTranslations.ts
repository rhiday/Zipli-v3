// Enhanced translation hook with robust fallback system
// Uses JSON translation files from public/locales

import { useLanguage } from './useLanguage';
import enTranslations from '../../public/locales/en/common.json';
import fiTranslations from '../../public/locales/fi/common.json';

const MISSING_TRANSLATION_CACHE = new Set<string>();

// Create translations object from JSON files
const translations = {
  en: enTranslations,
  fi: fiTranslations,
} as const;

export const useTranslations = () => {
  const { language } = useLanguage();
  const t = (key: string) => {
    return getTranslationWithFallback(key, language, translations);
  };

  return { t, language };
};

// Enhanced translation function with robust fallback system and nested key support
function getTranslationWithFallback(
  key: string,
  currentLang: string,
  translations: any
): string {
  try {
    const currentTranslations = translations[currentLang];

    // Helper function to get nested property value
    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // 1. Try current language with nested key support
    if (currentTranslations) {
      const value = getNestedValue(currentTranslations, key);
      if (value && typeof value === 'string') {
        return value;
      }
      // Also try flat key as fallback for backwards compatibility
      if (currentTranslations[key]) {
        return currentTranslations[key];
      }
    }

    // 2. Fallback to English with nested key support
    if (currentLang !== 'en' && translations.en) {
      const englishValue = getNestedValue(translations.en, key);
      if (englishValue && typeof englishValue === 'string') {
        // Only show warning once per missing key
        if (!MISSING_TRANSLATION_CACHE.has(`${currentLang}:${key}`)) {
          MISSING_TRANSLATION_CACHE.add(`${currentLang}:${key}`);

          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `Missing translation: ${key} in ${currentLang}, using English fallback`
            );
          }
        }
        return englishValue;
      }
      // Also try flat key as fallback for backwards compatibility
      if (translations.en[key]) {
        return translations.en[key];
      }
    }

    // 3. Return formatted key name as last resort
    const readableKey =
      key
        .split('.')
        .pop() // Get the last part of the key (e.g., 'profile' from 'common.navigation.profile')
        ?.split(/[_-]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || key;

    // Log missing translation for debugging
    if (
      process.env.NODE_ENV === 'development' &&
      !MISSING_TRANSLATION_CACHE.has(key)
    ) {
      MISSING_TRANSLATION_CACHE.add(key);
      console.warn(`Missing translation key: ${key}`);
    }

    return readableKey;
  } catch (error) {
    console.error('Translation system error:', error);
    return key; // Return key as fallback
  }
}

// Alternative hook that matches the previous API with enhanced error handling
export const useCommonTranslation = () => {
  const { language } = useTranslations();

  return {
    t: (key: string) => {
      return getTranslationWithFallback(key, language, translations);
    },
    language,
  };
};
