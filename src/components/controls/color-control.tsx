'use client';

import { useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChangeIndicator } from '@/components/change-indicator';
import { CssVarAutocomplete } from '@/components/controls/css-var-autocomplete';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface ColorControlProps {
  token: TokenDefinition;
}

export function ColorControl({ token }: ColorControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const [inputValue, setInputValue] = useState(currentValue);

  // Sync inputValue when external value changes (hydration, undo/redo, reset)
  const prevValueRef = useRef(currentValue);
  if (prevValueRef.current !== currentValue) {
    prevValueRef.current = currentValue;
    setInputValue(currentValue);
  }

  const handleColorChange = (color: string) => {
    setInputValue(color);
    dispatch({ type: 'SET_TOKEN', key: token.key, value: color });
  };

  const isHex = (v: string) => /^#[0-9a-fA-F]{3,8}$/.test(v);
  const isHex6 = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

  const handleAutocompleteChange = (val: string) => {
    setInputValue(val);
    // Commit 6-digit hex values immediately (live picker sync)
    if (isHex6(val)) {
      dispatch({ type: 'SET_TOKEN', key: token.key, value: val });
    }
  };

  const handleCommit = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && trimmed !== currentValue) {
      dispatch({ type: 'SET_TOKEN', key: token.key, value: trimmed });
    }
  };

  const hexValue = isHex(currentValue);

  // Non-hex values (oklch, var(), etc.) get an inline input with autocomplete
  if (!hexValue) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="size-4 rounded border border-input shrink-0"
          style={{ backgroundColor: hasVarReference(currentValue) ? undefined : currentValue }}
        />
        <CssVarAutocomplete
          value={inputValue}
          onChange={handleAutocompleteChange}
          onCommit={handleCommit}
          className="h-7 text-xs"
          placeholder="#hex, oklch(), or var(--name)"
        />
        <ChangeIndicator tokenKey={token.key} />
      </div>
    );
  }

  // Hex values get the full swatch + popover with color picker + autocomplete input
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <button
              className="size-4 rounded border border-input shrink-0 cursor-pointer"
              style={{ backgroundColor: currentValue }}
              aria-label="Open color picker"
            />
          }
        />
        <PopoverContent className="w-auto p-3 flex flex-col gap-2">
          <HexColorPicker color={currentValue} onChange={handleColorChange} />
          <CssVarAutocomplete
            value={inputValue}
            onChange={handleAutocompleteChange}
            onCommit={handleCommit}
            className="h-7 text-xs"
            placeholder="#hex or var(--name)"
          />
        </PopoverContent>
      </Popover>
      <span className="text-xs font-mono text-foreground truncate">{currentValue}</span>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
