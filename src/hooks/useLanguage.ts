import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'fi';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fi' as Language,
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export const useLanguage = () => {
  const { language, setLanguage } = useLanguageStore();

  // Temporary fallback t function for pages not yet updated
  const t = (key: string) => {
    // Just return the key as fallback - actual translations are in the new system
    return key;
  };

  return {
    language,
    setLanguage,
    t, // Temporary compatibility
  };
};
