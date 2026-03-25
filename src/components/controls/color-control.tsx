'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { AliasValue } from '@/components/alias-value';
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

  const handleColorChange = (color: string) => {
    setInputValue(color);
    dispatch({ type: 'SET_TOKEN', key: token.key, value: color });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      dispatch({ type: 'SET_TOKEN', key: token.key, value: val });
    }
  };

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
          <Input
            value={inputValue}
            onChange={handleInputChange}
            className="h-7 text-xs font-mono"
            maxLength={7}
          />
        </PopoverContent>
      </Popover>
      {hasVarReference(currentValue) ? (
        <AliasValue value={currentValue} className="flex-1 truncate" />
      ) : (
        <span className="text-xs font-mono text-foreground truncate">{currentValue}</span>
      )}
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
