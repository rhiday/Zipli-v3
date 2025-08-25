// Simple translation hook
// Replaces the complex i18n system with static imports

import { useLanguage } from './useLanguage';
import { getTranslations, type TranslationKey } from '@/lib/translations/index';

export const useTranslations = () => {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  return { t, language };
};

// Alternative hook that matches the previous API
export const useCommonTranslation = () => {
  const { t, language } = useTranslations();
  
  return {
    t: (key: string) => {
      // Allow any string key, return translation or fallback to key
      return (t as any)[key] || key;
    },
    language,
  };
};