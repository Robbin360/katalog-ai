'use client';

import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-emerald-500' : 'bg-gray-600'}
      `}
    >
      <span
        className={`
          pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0
          transition-transform
          ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
}
