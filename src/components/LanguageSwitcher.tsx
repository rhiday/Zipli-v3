'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Languages, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  compact?: boolean;
};

export default function LanguageSwitcher({ compact = false }: Props) {
  const { language, setLanguage, t } = useLanguage();

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={t('language')}
            className="px-3 py-1.5 border border-[#F3F4ED] rounded-full flex items-center gap-1.5 text-sm text-white bg-transparent hover:bg-white/5 transition-colors"
          >
            <Languages className="w-4 h-4 text-white" />
            <span className="leading-none">{language === 'fi' ? 'Suomi' : 'English'}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onSelect={() => setLanguage('en')} className="flex items-center justify-between">
            <span>English</span>
            {language === 'en' ? <Check className="w-4 h-4" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLanguage('fi')} className="flex items-center justify-between">
            <span>Suomi</span>
            {language === 'fi' ? <Check className="w-4 h-4" /> : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fi')}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder={t('language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="fi">{t('finnish')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}