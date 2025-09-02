'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    'Milk-free': 'Milk-free',
    'Low-lactose': 'Low-lactose',
    'Egg-free': 'Egg-free',
    'Soy-free': 'Soy-free',
    'Contains peanuts': 'Peanuts',
    'Contains other nuts': 'Other nuts',
    'Contains fish': 'Fish',
    'Contains crustaceans': 'Crustaceans',
    'Contains celery': 'Celery',
    'Contains mustard': 'Mustard',
    'Contains sesame seeds': 'Sesame seeds',
    'Contains sulphur dioxide / sulphites >10 mg/kg or litre': 'Sulphites',
    'Contains lupin': 'Lupin',
    'Contains molluscs': 'Molluscs',
    // Finnish versions
    'Ei määritelty': 'Ei määritelty',
    Gluteeniton: 'Gluteeniton',
    Laktoositon: 'Laktoositon',
    Maidoton: 'Maidoton',
    Vähälaktoosinen: 'Vähälaktoosinen',
    Munaton: 'Munaton',
    Soijaton: 'Soijaton',
    'Sisältää maapähkinöitä': 'Maapähkinät',
    'Sisältää muita pähkinöitä': 'Muut pähkinät',
    'Sisältää kalaa': 'Kala',
    'Sisältää äyriäisiä': 'Äyriäiset',
    'Sisältää selleriä': 'Selleri',
    'Sisältää sinappia': 'Sinappi',
    'Sisältää seesaminsiemeniä': 'Seesaminsiemenet',
    'Sisältää rikkidioksidia / sulfiitteja (>10 mg/kg)': 'Sulfiitit',
    'Sisältää lupiinia': 'Lupiini',
    'Sisältää nilviäisiä': 'Nilviäiset',
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
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
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

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
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

  const dropdownContent = open && (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-border rounded-md shadow-2xl z-[99999] max-h-60 overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      {options.map((option) => (
        <div
          key={option}
          className={`flex items-center px-3 py-2.5 cursor-pointer transition-colors ${
            value.includes(option)
              ? 'bg-positive/10 border-l-2 border-positive'
              : 'hover:bg-cloud'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(option);
          }}
        >
          <input
            type="checkbox"
            checked={value.includes(option)}
            readOnly
            className="mr-3 accent-positive w-2.5 h-2.5 flex-shrink-0 scale-75 sm:scale-100"
          />
          <span className="text-body text-primary leading-tight">{option}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="w-full" ref={containerRef}>
        <label className="block text-label font-semibold mb-2">{label}</label>
        <div className="relative" ref={inputRef}>
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
        </div>
        {error ? (
          <div className="mt-1 text-[14px] font-manrope text-negative">
            {error}
          </div>
        ) : hint ? (
          <div
            className="mt-1 text-[14px] font-manrope text-[rgba(2,29,19,0.60)]"
            style={{
              fontWeight: 400,
              fontStyle: 'normal',
              lineHeight: 'normal',
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>
      {typeof window !== 'undefined' &&
        dropdownContent &&
        createPortal(dropdownContent, document.body)}
    </>
  );
};

AllergensDropdown.displayName = 'AllergensDropdown';
