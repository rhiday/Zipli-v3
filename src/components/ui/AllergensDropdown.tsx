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
  const { t } = useAllergenSelectorTranslation();
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

  // Check if there are more chips to scroll to
  const hasOverflow = value.length > 3;

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
          <>
            <div
              className="absolute left-3 right-12 top-1/2 -translate-y-1/2 flex gap-2 overflow-x-auto overflow-y-hidden pointer-events-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              }}
              onClick={(e) => e.stopPropagation()} // Prevent input click when scrolling
            >
              {value.map((v) => (
                <div key={v} className="flex-shrink-0">
                  <Chip label={v} selected onRemove={() => handleToggle(v)} />
                </div>
              ))}
            </div>
            {hasOverflow && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-l from-base to-transparent pointer-events-none" />
            )}
          </>
        )}
        {open && (
          <div className="absolute left-0 right-0 mt-2 bg-base border border-border rounded-md shadow-lg z-50">
            {options.map((option) => (
              <div
                key={option}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${value.includes(option) ? 'bg-positive/20' : 'hover:bg-cloud'}`}
                onClick={() => handleToggle(option)}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  readOnly
                  className="mr-2 accent-positive"
                />
                <span className="text-body text-primary">{option}</span>
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
