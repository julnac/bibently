
import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const Switch = ({ checked, onChange, label }: SwitchProps) => {
  const id = React.useId();
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer select-none text-gray-700">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-green-200' : 'bg-gray-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-full bg-green-500' : ''}`}></div>
      </div>
      <span className="ml-3 text-sm font-medium">{label}</span>
    </label>
  );
};
