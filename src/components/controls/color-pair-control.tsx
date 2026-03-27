'use client';

import { useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CssVarAutocomplete } from '@/components/controls/css-var-autocomplete';
import { ChangeIndicator } from '@/components/change-indicator';
import { ContrastDot } from '@/components/contrast-dot';
import { AliasValue } from '@/components/alias-value';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { useTokens } from '@/lib/state/token-context';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import type { TokenDefinition } from '@/lib/tokens/types';

interface ColorPairControlProps {
  token: TokenDefinition;
}

const REGISTRY_MAP = new Map(TOKEN_REGISTRY.map((t) => [t.key, t]));

const TEXT_TOKEN_KEYS = new Set([
  '--color-text-body',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-tertiary',
]);

/** Resolve a token key to a hex color, following var() references up to 3 levels deep */
function resolveColorHex(key: string, depth = 0): string | undefined {
  if (depth > 3) return undefined;
  const token = REGISTRY_MAP.get(key);
  if (!token) return undefined;
  const val = token.defaultValue;
  if (!val) return undefined;
  // Direct hex
  if (/^#[0-9a-fA-F]{3,8}$/.test(val)) return expandHex(val);
  // Follow var() ref
  const varMatch = val.match(/^var\(([^)]+)\)$/);
  if (varMatch) return resolveColorHex(varMatch[1], depth + 1);
  // Approximate color-mix(in oklch, <color> N%, <color>)
  const mixMatch = val.match(/color-mix\(in oklch,\s*var\(([^)]+)\)\s+([\d.]+)%,\s*var\(([^)]+)\)\s*\)/);
  if (mixMatch) {
    const c1 = resolveColorHex(mixMatch[1], depth + 1);
    const pct = parseFloat(mixMatch[2]) / 100;
    const c2 = resolveColorHex(mixMatch[3], depth + 1);
    if (c1 && c2) return mixHexColors(c1, c2, pct);
  }
  return undefined;
}

/** Expand 3-char hex to 6-char */
function expandHex(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) return '#' + clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  return '#' + clean.slice(0, 6);
}

/** Simple linear mix of two hex colors (approximates color-mix in sRGB, close enough for contrast) */
function mixHexColors(hex1: string, hex2: string, ratio: number): string {
  const parse = (h: string) => {
    const c = h.replace('#', '');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const mix = (a: number, b: number) => Math.round(a * ratio + b * (1 - ratio));
  const r = mix(r1, r2), g = mix(g1, g2), b = mix(b1, b2);
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
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

const isHex = (v: string) => /^#[0-9a-fA-F]{3,8}$/.test(v);
const isHex6 = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

function ColorSwatch({ label, value, onCommit }: SwatchProps) {
  const [inputValue, setInputValue] = useState(value);

  // Sync inputValue when external value changes (hydration, undo/redo, reset)
  const prevValueRef = useRef(value);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    setInputValue(value);
  }

  const handleColorChange = (color: string) => {
    setInputValue(color);
    onCommit(color);
  };

  const handleAutocompleteChange = (val: string) => {
    setInputValue(val);
    if (isHex6(val)) onCommit(val);
  };

  const handleCommit = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && trimmed !== value) onCommit(trimmed);
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
          {isHex(value) && (
            <HexColorPicker color={value} onChange={handleColorChange} />
          )}
          <CssVarAutocomplete
            value={inputValue}
            onChange={handleAutocompleteChange}
            onCommit={handleCommit}
            className="h-7 text-xs"
            placeholder="#hex or var(--name)"
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

  // Resolve surface colors for WCAG contrast comparison
  const isTextToken = TEXT_TOKEN_KEYS.has(token.key);
  const surfaceFallback = parseLightDarkDefault(
    REGISTRY_MAP.get('--color-surface')?.defaultValue ?? 'light-dark(#ffffff, #000000)'
  );
  const surfaceLight = overrides['--color-surface--light'] ?? surfaceFallback.light;
  const surfaceDark = overrides['--color-surface--dark'] ?? surfaceFallback.dark;

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
        {isTextToken && colorSchemeMode !== 'dark' && (
          <ContrastDot textColor={fallback.light} surfaceColor={surfaceLight} />
        )}
        {isTextToken && colorSchemeMode !== 'light' && (
          <ContrastDot textColor={fallback.dark} surfaceColor={surfaceDark} />
        )}
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
      {isTextToken && colorSchemeMode !== 'dark' && (
        <ContrastDot textColor={lightValue} surfaceColor={surfaceLight} />
      )}
      {isTextToken && colorSchemeMode !== 'light' && (
        <ContrastDot textColor={darkValue} surfaceColor={surfaceDark} />
      )}
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
