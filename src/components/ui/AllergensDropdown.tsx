'use client'

import React, { useState, useRef } from 'react';
import { Input } from './Input';
import { Chip } from './Chip';

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
  value,
  onChange,
  error,
  hint,
  disabled,
  placeholder = 'Select...',
}) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-label font-semibold mb-2">{label}</label>
      <div className="relative">
        <div
          className={[
            'flex items-center min-h-12 w-full rounded-md border px-4 py-1.5 bg-base cursor-pointer',
            error ? 'border-negative' : 'border-border',
            disabled ? 'opacity-50 pointer-events-none' : '',
            open ? 'ring-2 ring-interactive ring-offset-2' : '',
          ].join(' ')}
          tabIndex={0}
          onClick={() => !disabled && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
        >
          <div className="flex flex-wrap gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {value.length === 0 && (
              <span className="text-tertiary select-none">{placeholder}</span>
            )}
            {value.map((item) => (
              <Chip
                key={item}
                label={item}
                selected
                onRemove={() => handleToggle(item)}
                className="shrink-0"
              />
            ))}
          </div>
          <span className="ml-2 flex items-center pointer-events-none">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M5 8l5 5 5-5" stroke="#021d13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
        {open && (
          <div className="absolute z-10 mt-2 w-full rounded-md border bg-white shadow-lg p-2">
            {options.map((option) => {
              const checked = value.includes(option);
              return (
                <div
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-cloud"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleToggle(option)}
                >
                  <span className={`inline-block w-5 h-5 border rounded flex items-center justify-center transition-colors ${checked ? 'bg-[#021d13] border-[#021d13]' : 'bg-white border-[#021d13]'}`}>
                    {checked && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8.5L7 11.5L12 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-body text-[#021d13]">{option}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error ? (
        <div className="mt-1 text-negative text-sm">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-secondary text-sm">{hint}</div>
      ) : null}
    </div>
  );
}; 