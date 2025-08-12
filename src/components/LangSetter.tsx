'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function LangSetter() {
  const { language } = useLanguage();
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);
  return null;
}


