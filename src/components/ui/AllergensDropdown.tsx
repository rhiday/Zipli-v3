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
        <Input
          ref={inputRef}
          readOnly
          value={''}
          placeholder={placeholder}
          variant={error ? 'error' : 'default'}
          disabled={disabled}
          className="cursor-pointer"
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen((v) => !v)}
        />
        {value.length > 0 && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2 max-w-[80%] overflow-x-auto">
            {value.map((v) => (
              <Chip
                key={v}
                label={v}
                selected
                onRemove={() => handleToggle(v)}
              />
            ))}
          </div>
        )}
        {open && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {options.map((option) => (
              <div
                key={option}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${value.includes(option) ? 'bg-[#eafcd6]' : 'hover:bg-gray-50'}`}
                onMouseDown={() => handleToggle(option)}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  readOnly
                  className="mr-2 accent-[#a6f175]"
                />
                <span className="text-[14px] font-manrope text-[#021d13]">{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {error ? (
        <div className="mt-1 text-[14px] font-manrope text-negative">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-[14px] font-manrope text-[rgba(2,29,19,0.60)]" style={{fontWeight: 400, fontStyle: 'normal', lineHeight: 'normal'}}>{hint}</div>
      ) : null}
    </div>
  );
}; 