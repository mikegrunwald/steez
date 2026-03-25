'use client';

import { SunIcon, MoonIcon } from 'lucide-react';
import { parseValueExpression, hasVarReference } from '@/lib/tokens/value-parser';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import type { TokenDefinition } from '@/lib/tokens/types';

/* ── Registry lookup ─────────────────────────────────── */

const REGISTRY_MAP = new Map<string, TokenDefinition>(
  TOKEN_REGISTRY.map((t) => [t.key, t]),
);

function lookupToken(key: string): TokenDefinition | undefined {
  return REGISTRY_MAP.get(key);
}

/** Get a short display label for a token key */
function getRefLabel(tokenKey: string): string {
  const token = lookupToken(tokenKey);
  if (token) return token.label;
  // Strip leading -- and return as-is
  return tokenKey.replace(/^--/, '');
}

/** Get the resolved color value for a color token (if available) */
function getRefColor(tokenKey: string): string | undefined {
  const token = lookupToken(tokenKey);
  if (token?.type === 'color' && token.defaultValue && !token.defaultValue.includes('var(')) {
    return token.defaultValue;
  }
  return undefined;
}

/* ── Components ──────────────────────────────────────── */

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2.5 rounded-sm border border-current/20 align-middle"
      style={{ backgroundColor: color }}
    />
  );
}

/** Bordered inline alias reference pill */
function RefBadge({ tokenKey, compact }: { tokenKey: string; compact?: boolean }) {
  const label = getRefLabel(tokenKey);
  const color = getRefColor(tokenKey);

  // Compact mode: just a swatch in a border pill, no label
  if (compact && color) {
    return (
      <span
        className="inline-flex items-center rounded border border-border px-1 py-0.5 leading-none"
        title={label}
      >
        <span
          className="inline-block size-3 rounded-sm border border-current/20"
          style={{ backgroundColor: color }}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs font-mono leading-none">
      <span className="text-primary font-semibold">@</span>
      {color && <ColorSwatch color={color} />}
      <span className="text-foreground">{label}</span>
    </span>
  );
}

/** Parse light-dark(var(--a), var(--b)) into token keys */
function parseLightDarkRefs(value: string): { light: string; dark: string } | null {
  const match = value.match(
    /light-dark\(\s*var\(([^)]+)\)\s*,\s*var\(([^)]+)\)\s*\)/
  );
  if (!match) return null;
  return { light: match[1], dark: match[2] };
}

/** Compact light-dark display with sun/moon icons and color swatches */
function LightDarkValue({ lightKey, darkKey }: { lightKey: string; darkKey: string }) {
  const lightColor = getRefColor(lightKey);
  const darkColor = getRefColor(darkKey);
  const lightLabel = getRefLabel(lightKey);
  const darkLabel = getRefLabel(darkKey);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="inline-flex items-center gap-0.5" title={`Light: ${lightLabel}`}>
        <SunIcon className="size-3 text-muted-foreground" />
        {lightColor ? (
          <span
            className="inline-block size-3.5 rounded-sm border border-current/20"
            style={{ backgroundColor: lightColor }}
          />
        ) : (
          <span className="text-foreground font-mono">{lightLabel}</span>
        )}
      </span>
      <span className="inline-flex items-center gap-0.5" title={`Dark: ${darkLabel}`}>
        <MoonIcon className="size-3 text-muted-foreground" />
        {darkColor ? (
          <span
            className="inline-block size-3.5 rounded-sm border border-current/20"
            style={{ backgroundColor: darkColor }}
          />
        ) : (
          <span className="text-foreground font-mono">{darkLabel}</span>
        )}
      </span>
    </span>
  );
}

/* ── Public API ───────────────────────────────────────── */

interface AliasValueProps {
  /** The raw CSS value string */
  value: string;
  /** Optional: custom className for the wrapper */
  className?: string;
  /** Compact mode: ref badges show only swatches for color tokens */
  compact?: boolean;
}

/**
 * Renders a CSS value with @{} bordered inline badges for var() references.
 * For light-dark() expressions, renders compact sun/moon + swatch display.
 * Returns null if the value has no var() references (caller should use default display).
 */
export function AliasValue({ value, className, compact }: AliasValueProps) {
  if (!hasVarReference(value)) return null;

  // Compact light-dark display with sun/moon icons
  const ldRefs = parseLightDarkRefs(value);
  if (ldRefs) {
    return (
      <span className={className}>
        <LightDarkValue lightKey={ldRefs.light} darkKey={ldRefs.dark} />
      </span>
    );
  }

  const segments = parseValueExpression(value);

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 text-xs ${className ?? ''}`}>
      {segments.map((seg, i) =>
        seg.type === 'ref' ? (
          <RefBadge key={i} tokenKey={seg.tokenKey} compact={compact} />
        ) : (
          <span key={i} className="text-foreground font-mono whitespace-nowrap">
            {seg.text}
          </span>
        ),
      )}
    </span>
  );
}

/**
 * Check if a value would render as an alias display.
 */
export { hasVarReference };
