import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en' as Language,
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export const useLanguage = () => {
  const { language, setLanguage } = useLanguageStore();
  
  const t = (key: TranslationKey): string => {
    // Fallback - just return the key
    return key;
  };

  return {
    language,
    setLanguage,
    t,
  };
};