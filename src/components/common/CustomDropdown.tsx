// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useRef, useEffect, useId } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  label?: string;
  required?: boolean;
  options: DropdownOption[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustomInput?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  required = false,
  options,
  value,
  onChange,
  placeholder = '',
  allowCustomInput = false,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options if custom typing allowed or searchable
  const filteredOptions = allowCustomInput && searchQuery.trim() !== ''
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  const exactMatchExists = normalizedOptions.some(
    (opt) => opt.label.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  // Calculate opening direction (downwards vs upwards)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 220 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (allowCustomInput && searchQuery.trim() !== '') {
        handleSelect(searchQuery.trim());
      }
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative flex flex-col ${className}`} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-[#A5D8D3] mb-1.5 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[#FBBF24]">*</span>}
        </label>
      )}

      {/* Main Input/Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            if (!isOpen && allowCustomInput) {
              setSearchQuery('');
            }
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-base transition-colors cursor-pointer select-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-black/20 border-white/10 text-white/50'
            : isOpen
            ? 'bg-[#134E4A]/90 border-[#2DD4BF] text-[#ECFEFF] shadow-[0_0_12px_rgba(45,212,191,0.2)]'
            : 'bg-[#0F766E]/40 hover:bg-[#0F766E]/60 border-white/20 text-[#ECFEFF]'
        }`}
      >
        {allowCustomInput && isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            autoFocus
            placeholder={selectedOption ? selectedOption.label : placeholder}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-[#ECFEFF] text-base placeholder-white/40"
          />
        ) : (
          <span className={`truncate ${!selectedOption ? 'text-white/40' : 'text-[#ECFEFF] font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder || '-'}
          </span>
        )}

        <ChevronDown
          size={18}
          className={`text-[#A5D8D3] ml-2 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2DD4BF]' : ''
          }`}
        />
      </div>

      {/* Dropdown Menu attached directly without popup or native sheet */}
      {isOpen && (
        <div
          id={listboxId}
          ref={listRef}
          role="listbox"
          className={`absolute left-0 right-0 z-50 overflow-y-auto max-h-[240px] rounded-xl border border-white/20 bg-[#0B4F4A]/95 backdrop-blur-[20px] shadow-2xl divide-y divide-white/10 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          style={{ width: '100%' }}
        >
          {filteredOptions.length === 0 && (!allowCustomInput || searchQuery.trim() === '') ? (
            <div className="px-4 py-3 text-sm text-[#A5D8D3]/70 text-center">
              Belum ada data
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-sm sm:text-base cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold'
                      : isHighlighted
                      ? 'bg-white/10 text-[#ECFEFF]'
                      : 'text-[#ECFEFF]/90 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={18} className="text-[#2DD4BF] shrink-0 ml-2" />}
                </div>
              );
            })
          )}

          {/* If custom input allowed and typed text is new, offer adding it */}
          {allowCustomInput && searchQuery.trim() !== '' && !exactMatchExists && (
            <div
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(searchQuery.trim())}
              className="min-h-[44px] px-3.5 py-2.5 flex items-center gap-2 text-sm sm:text-base text-[#2DD4BF] font-medium bg-[#134E4A]/80 hover:bg-[#2DD4BF]/20 cursor-pointer"
            >
              <Plus size={16} className="shrink-0" />
              <span className="truncate">{searchQuery.trim()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
