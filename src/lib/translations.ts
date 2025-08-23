// Old translation system - replaced by static translations
// Keeping this file to avoid breaking imports during migration

export type Language = 'en' | 'fi';
export type TranslationKey = string;

export const translations = {
  en: {} as Record<string, string>,
  fi: {} as Record<string, string>,
} as const;