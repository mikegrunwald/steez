'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { AliasValue } from '@/components/alias-value';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { useTokens } from '@/lib/state/token-context';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import type { TokenDefinition } from '@/lib/tokens/types';

interface ColorPairControlProps {
  token: TokenDefinition;
}

const REGISTRY_MAP = new Map(TOKEN_REGISTRY.map((t) => [t.key, t]));

/** Resolve a token key to a hex color, following one level of var() references */
function resolveColorHex(key: string): string | undefined {
  const token = REGISTRY_MAP.get(key);
  if (!token) return undefined;
  const val = token.defaultValue;
  if (val && /^#[0-9a-fA-F]{3,8}$/.test(val)) return val;
  // Follow one var() ref
  const varMatch = val?.match(/^var\(([^)]+)\)$/);
  if (varMatch) {
    const inner = REGISTRY_MAP.get(varMatch[1]);
    if (inner?.defaultValue && /^#[0-9a-fA-F]{3,8}$/.test(inner.defaultValue)) {
      return inner.defaultValue;
    }
  }
  return undefined;
}

export function parseLightDarkDefault(defaultValue: string): { light: string; dark: string } {
  // Try hex literals first
  const hexMatch = defaultValue.match(/light-dark\(\s*(#[0-9a-fA-F]{3,8}),\s*(#[0-9a-fA-F]{3,8})\s*\)/);
  if (hexMatch) return { light: hexMatch[1], dark: hexMatch[2] };
  // Try resolving var() references
  const varMatch = defaultValue.match(/light-dark\(\s*var\(([^)]+)\)\s*,\s*var\(([^)]+)\)\s*\)/);
  if (varMatch) {
    const light = resolveColorHex(varMatch[1]) ?? '#ffffff';
    const dark = resolveColorHex(varMatch[2]) ?? '#000000';
    return { light, dark };
  }
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
              className="size-4 rounded border border-input shrink-0 cursor-pointer"
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

  // If the default value is a var() reference, show clickable alias badge
  if (hasVarReference(token.defaultValue) && !(token.key + '--light' in overrides) && !(token.key + '--dark' in overrides)) {
    const activateEdit = () => {
      setLight(fallback.light);
      setDark(fallback.dark);
    };
    return (
      <div className="flex items-center gap-2">
        <button
          className="flex-1 text-left cursor-pointer hover:bg-accent/50 rounded px-1 -mx-1 transition-colors truncate"
          onClick={activateEdit}
        >
          <AliasValue value={token.defaultValue} className="flex-1 truncate" />
        </button>
        <ChangeIndicator tokenKey={token.key} />
      </div>
    );
  }

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
