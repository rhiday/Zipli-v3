'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { Chip } from './Chip';
import { useAllergenSelectorTranslation } from '@/lib/i18n-enhanced';

interface AllergensDropdownProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Function to create short chip labels from full allergen names
const getShortLabel = (fullLabel: string): string => {
  const shortcuts: Record<string, string> = {
    'Not specified': 'Not specified',
    'Gluten-free': 'Gluten-free',
    'Lactose-free': 'Lactose-free',
    'Low-lactose': 'Low-lactose',
    'Egg-free': 'Egg-free',
    'Soy-free': 'Soy-free',
    'Does not contain peanuts': 'Peanuts',
    'Does not contain other nuts': 'Other nuts',
    'Does not contain fish': 'Fish',
    'Does not contain crustaceans': 'Crustaceans',
    'Does not contain celery': 'Celery',
    'Does not contain mustard': 'Mustard',
    'Does not contain sesame seeds': 'Sesame seeds',
    'Does not contain sulphur dioxide / sulphites >10 mg/kg or litre':
      'Sulphites',
    'Does not contain lupin': 'Lupin',
    'Does not contain molluscs': 'Molluscs',
    // Finnish versions
    Määritelty: 'Määritelty',
    Gluteeniton: 'Gluteeniton',
    Laktoositon: 'Laktoositon',
    Vähälaktoosinen: 'Vähälaktoosinen',
    Munaton: 'Munaton',
    Soijaton: 'Soijaton',
    'Ei sisällä maapähkinöitä': 'Maapähkinät',
    'Ei sisällä muita pähkinöitä': 'Muut pähkinät',
    'Ei sisällä kalaa': 'Kala',
    'Ei sisällä äyriäisiä': 'Äyriäiset',
    'Ei sisällä selleriä': 'Selleri',
    'Ei sisällä sinappia': 'Sinappi',
    'Ei sisällä seesaminsiemeniä': 'Seesaminsiemenet',
    'Ei sisällä rikkidioksidia / sulfiitteja (>10 mg/kg)': 'Sulfiitit',
    'Ei sisällä lupiinia': 'Lupiini',
    'Ei sisällä nilviäisiä': 'Nilviäiset',
  };

  return shortcuts[fullLabel] || fullLabel;
};

export const AllergensDropdown: React.FC<AllergensDropdownProps> = ({
  label,
  options,
  value = [],
  onChange,
  error,
  hint,
  disabled,
  placeholder = 'Select...',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-label font-semibold mb-2">{label}</label>
      <div className="relative">
        <Input
          readOnly
          value={''}
          placeholder={value.length > 0 ? '' : placeholder}
          variant={error ? 'error' : 'default'}
          disabled={disabled}
          className="cursor-pointer"
          onClick={handleInputClick}
        />
        {value.length > 0 && (
          <div
            className="absolute left-3 right-12 top-1/2 -translate-y-1/2 flex gap-1.5 overflow-x-auto overflow-y-hidden pointer-events-auto scrollbar-hide max-w-[calc(100%-60px)]"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              maskImage:
                'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
            }}
            onClick={handleInputClick}
          >
            {value.map((v) => (
              <div key={v} className="flex-shrink-0">
                <Chip
                  label={getShortLabel(v)}
                  selected
                  onRemove={() => handleToggle(v)}
                />
              </div>
            ))}
          </div>
        )}
        {open && (
          <div className="absolute left-0 right-0 mt-1 bg-base border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                className={`flex items-center px-3 py-2.5 cursor-pointer transition-colors ${
                  value.includes(option)
                    ? 'bg-positive/10 border-l-2 border-positive'
                    : 'hover:bg-cloud'
                }`}
                onClick={() => handleToggle(option)}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  readOnly
                  className="mr-3 accent-positive w-3.5 h-3.5"
                />
                <span className="text-body text-primary leading-tight">
                  {option}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {error ? (
        <div className="mt-1 text-[14px] font-manrope text-negative">
          {error}
        </div>
      ) : hint ? (
        <div
          className="mt-1 text-[14px] font-manrope text-[rgba(2,29,19,0.60)]"
          style={{ fontWeight: 400, fontStyle: 'normal', lineHeight: 'normal' }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
};

AllergensDropdown.displayName = 'AllergensDropdown';
