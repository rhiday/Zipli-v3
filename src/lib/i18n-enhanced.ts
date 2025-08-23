/**
 * Enhanced i18n system with contextual organization for Lokalise
 * Automatically syncs with Lokalise and provides page/section context
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTranslations } from './translations/index';

export type Language = 'en' | 'fi';

// Enhanced translation structure with contextual organization
export interface TranslationStructure {
  // Global/Common elements used across pages
  common: {
    actions: Record<string, string>;
    navigation: Record<string, string>;
    forms: Record<string, string>;
    status: Record<string, string>;
    time: Record<string, string>;
  };

  // Page-specific translations
  pages: {
    auth: {
      login: Record<string, string>;
      register: Record<string, string>;
      forgotPassword: Record<string, string>;
      resetPassword: Record<string, string>;
    };
    dashboard: {
      donor: Record<string, string>;
      receiver: Record<string, string>;
      city: Record<string, string>;
      common: Record<string, string>;
    };
    donations: {
      create: Record<string, string>;
      list: Record<string, string>;
      detail: Record<string, string>;
      schedule: Record<string, string>;
    };
    requests: {
      create: Record<string, string>;
      list: Record<string, string>;
      detail: Record<string, string>;
    };
    profile: Record<string, string>;
    impact: Record<string, string>;
  };

  // Component-specific translations
  components: {
    donationCard: Record<string, string>;
    requestCard: Record<string, string>;
    foodItemForm: Record<string, string>;
    pickupScheduler: Record<string, string>;
    voiceInput: Record<string, string>;
    allergenSelector: Record<string, string>;
  };
}

// Flattened key type for easy access
export type TranslationKey =
  | `common.actions.${string}`
  | `common.navigation.${string}`
  | `common.forms.${string}`
  | `common.status.${string}`
  | `common.time.${string}`
  | `pages.auth.login.${string}`
  | `pages.auth.register.${string}`
  | `pages.auth.forgotPassword.${string}`
  | `pages.auth.resetPassword.${string}`
  | `pages.dashboard.donor.${string}`
  | `pages.dashboard.receiver.${string}`
  | `pages.dashboard.city.${string}`
  | `pages.dashboard.common.${string}`
  | `pages.donations.create.${string}`
  | `pages.donations.list.${string}`
  | `pages.donations.detail.${string}`
  | `pages.donations.schedule.${string}`
  | `pages.requests.create.${string}`
  | `pages.requests.list.${string}`
  | `pages.requests.detail.${string}`
  | `pages.profile.${string}`
  | `pages.impact.${string}`
  | `components.donationCard.${string}`
  | `components.requestCard.${string}`
  | `components.foodItemForm.${string}`
  | `components.pickupScheduler.${string}`
  | `components.voiceInput.${string}`
  | `components.allergenSelector.${string}`;

interface LanguageState {
  language: Language;
  translations: Record<Language, any>;
  setLanguage: (language: Language) => void;
  setTranslations: (translations: Record<Language, any>) => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en' as Language,
      translations: { en: {}, fi: {} } as Record<Language, any>,
      setLanguage: (language: Language) => set({ language }),
      setTranslations: (translations: Record<Language, any>) =>
        set({ translations }),
    }),
    {
      name: 'i18n-enhanced-storage',
    }
  )
);

// Helper function to get nested translation value
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Enhanced useTranslation hook with context awareness
export const useTranslation = (namespace?: string) => {
  const { language, translations, setLanguage } = useLanguageStore();

  const t = (
    key: TranslationKey | string,
    params?: Record<string, string>
  ): string => {
    // Get static translations
    const staticTranslations = getTranslations(language);

    // Try to get translation from static files
    const translation = (staticTranslations as any)[key];
    if (translation) return translation;

    // Fallback to key if no translation found
    return key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Update document language attribute
    if (typeof window !== 'undefined') {
      document.documentElement.lang = newLanguage;
    }
  };

  return {
    t,
    language,
    changeLanguage,
    i18n: { language, changeLanguage },
  };
};

// Context-aware translation helpers for different page sections
export const useAuthTranslation = () => useTranslation('pages.auth');
export const useDashboardTranslation = () => useTranslation('pages.dashboard');
export const useDonationsTranslation = () => useTranslation('pages.donations');
export const useRequestsTranslation = () => useTranslation('pages.requests');
export const useProfileTranslation = () => useTranslation('pages.profile');
export const useImpactTranslation = () => useTranslation('pages.impact');

// Component-specific translation helpers
export const useDonationCardTranslation = () =>
  useTranslation('components.donationCard');
export const useRequestCardTranslation = () =>
  useTranslation('components.requestCard');
export const useFoodItemFormTranslation = () =>
  useTranslation('components.foodItemForm');
export const usePickupSchedulerTranslation = () =>
  useTranslation('components.pickupScheduler');
export const useVoiceInputTranslation = () =>
  useTranslation('components.voiceInput');
export const useAllergenSelectorTranslation = () =>
  useTranslation('components.allergenSelector');

// Common translations helper
export const useCommonTranslation = () => {
  const { language } = useLanguageStore();

  return {
    t: (key: string) => {
      const staticTranslations = getTranslations(language);
      return (staticTranslations as any)[key] || key;
    },
    language,
  };
};

// Load translations from API or static files
export const loadTranslations = async () => {
  const { setTranslations } = useLanguageStore.getState();

  try {
    // Try to load from Lokalise API first
    const response = await fetch('/api/translations');
    if (response.ok) {
      const translations = await response.json();
      console.log('📥 Loaded translations from Lokalise API');
      setTranslations(translations);
      return;
    }
  } catch (error) {
    console.warn(
      'Could not load translations from Lokalise API, falling back to static files'
    );
  }

  // Fallback to static files
  try {
    const [enResponse, fiResponse] = await Promise.all([
      fetch('/locales/en/translations.json'),
      fetch('/locales/fi/translations.json'),
    ]);

    if (enResponse.ok && fiResponse.ok) {
      const [enTranslations, fiTranslations] = await Promise.all([
        enResponse.json(),
        fiResponse.json(),
      ]);

      console.log('📁 Loaded translations from static files');
      setTranslations({
        en: enTranslations,
        fi: fiTranslations,
      });
    }
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
};

export default useTranslation;
