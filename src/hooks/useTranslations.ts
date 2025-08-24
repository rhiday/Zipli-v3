// Enhanced translation hook with robust fallback system
// Replaces the complex i18n system with static imports and error handling

import { useLanguage } from './useLanguage';
import {
  getTranslations,
  type TranslationKey,
  translations,
} from '@/lib/translations/index';
import { toast } from '@/hooks/use-toast';

const MISSING_TRANSLATION_CACHE = new Set<string>();

export const useTranslations = () => {
  const { language } = useLanguage();
  const t = getTranslations(language);

  return { t, language };
};

// Enhanced translation function with robust fallback system
function getTranslationWithFallback(
  key: string,
  currentLang: string,
  translations: any
): string {
  try {
    const currentTranslations = translations[currentLang];

    // 1. Try current language
    if (currentTranslations && currentTranslations[key]) {
      return currentTranslations[key];
    }

    // 2. Fallback to English
    if (currentLang !== 'en' && translations.en && translations.en[key]) {
      // Only show warning once per missing key
      if (!MISSING_TRANSLATION_CACHE.has(`${currentLang}:${key}`)) {
        MISSING_TRANSLATION_CACHE.add(`${currentLang}:${key}`);

        if (process.env.NODE_ENV === 'development') {
          toast({
            title: 'Missing translation',
            description: `Key "${key}" not found in ${currentLang}`,
            variant: 'warning',
          });
        }
      }

      return translations.en[key];
    }

    // 3. Return formatted key name as last resort
    const readableKey = key
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Log missing translation for debugging
    if (
      process.env.NODE_ENV === 'development' &&
      !MISSING_TRANSLATION_CACHE.has(key)
    ) {
      MISSING_TRANSLATION_CACHE.add(key);
      console.warn(`Missing translation key: ${key}`);

      toast({
        title: 'Translation missing',
        description: `Key "${key}" not found in any language`,
        variant: 'error',
      });
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
