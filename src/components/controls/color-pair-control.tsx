'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface ColorPairControlProps {
  token: TokenDefinition;
}

function parseLightDarkDefault(defaultValue: string): { light: string; dark: string } {
  const match = defaultValue.match(/light-dark\(\s*(#[0-9a-fA-F]{6}),\s*(#[0-9a-fA-F]{6})\s*\)/);
  if (match) return { light: match[1], dark: match[2] };
  return { light: '#ffffff', dark: '#000000' };
}

interface SwatchProps {
  label: string;
  colorKey: string;
  value: string;
  defaultValue: string;
  onCommit: (color: string) => void;
}

function ColorSwatch({ label, value, onCommit }: SwatchProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleColorChange = (color: string) => {
    setInputValue(color);
    onCommit(color);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onCommit(val);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
      <Popover>
        <PopoverTrigger
          render={
            <button
              className="size-6 rounded border border-input shrink-0 cursor-pointer"
              style={{ backgroundColor: value }}
              aria-label={`Open ${label} color picker`}
            />
          }
        />
        <PopoverContent className="w-auto p-3 flex flex-col gap-2">
          <HexColorPicker color={value} onChange={handleColorChange} />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            className="h-7 text-xs font-mono"
            maxLength={7}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ColorPairControl({ token }: ColorPairControlProps) {
  const { overrides, colorSchemeMode, dispatch } = useTokens();

  const fallback = parseLightDarkDefault(token.defaultValue);
  const lightValue = overrides[token.key + '--light'] ?? fallback.light;
  const darkValue = overrides[token.key + '--dark'] ?? fallback.dark;

  const setLight = (color: string) =>
    dispatch({ type: 'SET_TOKEN', key: token.key + '--light', value: color });

  const setDark = (color: string) =>
    dispatch({ type: 'SET_TOKEN', key: token.key + '--dark', value: color });

  return (
    <div className="flex items-center gap-3">
      {colorSchemeMode !== 'dark' && (
        <ColorSwatch
          label="L"
          colorKey={token.key + '--light'}
          value={lightValue}
          defaultValue={fallback.light}
          onCommit={setLight}
        />
      )}
      {colorSchemeMode !== 'light' && (
        <ColorSwatch
          label="D"
          colorKey={token.key + '--dark'}
          value={darkValue}
          defaultValue={fallback.dark}
          onCommit={setDark}
        />
      )}
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
