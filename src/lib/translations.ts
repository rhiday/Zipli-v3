// Translation system - loads from static en.ts and fi.ts files
// All translations come from static files

export type Language = 'en' | 'fi';
export type TranslationKey = string;

// Import static translations
import { en } from './translations/en';
import { fi } from './translations/fi';

export const translations = {
  en,
  fi,
} as const;

// Simple translation getter
export const getTranslations = (language: Language) => {
  return language === 'fi' ? fi : en;
};
