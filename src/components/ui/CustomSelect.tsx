'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  icon,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between gap-2 ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/30 text-white shadow-lg shadow-amber-950/50'
            : 'border-slate-800 hover:border-amber-500/50 text-gray-100'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-amber-400 shrink-0">{icon}</span>}
          <span className={selectedOption ? 'text-white font-semibold' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-amber-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-300' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-950/80 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-amber-500'
                    : 'text-gray-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
