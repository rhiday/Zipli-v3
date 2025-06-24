'use client';
import React, { useState, useCallback } from 'react';
import DevLoginSwitcher from './DevLoginSwitcher';

export default function DevSwitcherOverlay() {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  return (
    <>
      {open && (
        <div className="fixed bottom-4 right-4 z-[99]">
          <DevLoginSwitcher />
        </div>
      )}
      <button
        type="button"
        aria-label={open ? 'Hide dev switcher' : 'Show dev switcher'}
        onClick={toggleOpen}
        className={`fixed z-[100] bg-gray-800 text-white rounded-full shadow-lg p-2 hover:bg-gray-700 transition-all duration-200 ${
          open ? 'bottom-[280px] right-4' : 'bottom-4 right-4'
        }`}
        style={{ pointerEvents: 'auto' }}
      >
        {open ? <span>&#x25BC;</span> : <span>&#x25B2;</span>}
      </button>
    </>
  );
} 