'use client';

import { useState, useRef, useCallback } from 'react';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';

/** All CSS custom property keys from the registry, pre-sorted */
const ALL_KEYS = TOKEN_REGISTRY.map((t) => t.key).sort();

interface CssVarAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Text input with autocomplete for CSS custom properties.
 * Shows suggestions when input starts with `--` or contains `var(--`.
 * Wraps selected properties in `var(...)` automatically.
 */
export function CssVarAutocomplete({
  value,
  onChange,
  onCommit,
  className = '',
  placeholder,
}: CssVarAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const justCommittedRef = useRef(false);

  // Extract the fragment the user is typing to match against custom property names
  const getSearchFragment = useCallback((input: string): string | null => {
    // Match `var(--something` at end of input
    const varMatch = input.match(/var\((--[^)]*?)$/);
    if (varMatch) return varMatch[1];
    // Match bare `--something` (whole input)
    if (input.startsWith('--')) return input;
    return null;
  }, []);

  const fragment = getSearchFragment(value);
  const suggestions =
    fragment && fragment.length >= 2
      ? ALL_KEYS.filter((k) => k.includes(fragment) && k !== fragment).slice(0, 12)
      : [];
  const isOpen = showSuggestions && suggestions.length > 0;

  const applySuggestion = (key: string) => {
    // If user typed `var(--...`, complete it; otherwise wrap in var()
    const varMatch = value.match(/var\((--[^)]*?)$/);
    let newValue: string;
    if (varMatch) {
      newValue = value.slice(0, value.length - varMatch[1].length) + key + ')';
    } else {
      newValue = `var(${key})`;
    }
    onChange(newValue);
    onCommit(newValue);
    justCommittedRef.current = true;
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    const frag = getSearchFragment(val);
    setShowSuggestions(!!frag && frag.length >= 2);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    } else if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
    // Skip if a suggestion was just applied (it already committed the correct value)
    if (justCommittedRef.current) {
      justCommittedRef.current = false;
      return;
    }
    const val = value.trim();
    if (val) onCommit(val);
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          const frag = getSearchFragment(value);
          if (frag && frag.length >= 2) setShowSuggestions(true);
        }}
        className={`w-full rounded-md border border-input bg-transparent px-2 py-1 font-mono outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 ${className}`}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {suggestions.map((key, i) => (
            <button
              key={key}
              type="button"
              className={`w-full text-left px-2 py-1 text-xs font-mono cursor-pointer transition-colors ${
                i === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-popover-foreground hover:bg-accent/50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click fires
                applySuggestion(key);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
