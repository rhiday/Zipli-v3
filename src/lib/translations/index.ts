// Static translations system
// Simple, reliable, and easy to maintain

export { en } from './en';
export { fi } from './fi';
export type { TranslationKey } from './en';

export type Language = 'en' | 'fi';

// Simple translation getter
import { en } from './en';
import { fi } from './fi';

export const getTranslations = (language: Language) => {
  return language === 'en' ? en : fi;
};

export const translations = {
  en,
  fi,
} as const;
