'use client';

import { useTokens } from '@/lib/state/token-context';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import { TOKEN_DEFAULTS } from '@/lib/tokens/defaults';
import { AliasValue } from '@/components/alias-value';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { ChangeIndicator } from '@/components/change-indicator';
import type { TokenDefinition } from '@/lib/tokens/types';

// Inline editors for derived tokens
import { ColorControl } from '@/components/controls/color-control';
import { ColorPairControl, parseLightDarkDefault } from '@/components/controls/color-pair-control';
import { DimensionControl } from '@/components/controls/dimension-control';
import { WeightControl } from '@/components/controls/weight-control';
import { EasingControl } from '@/components/controls/easing-control';
import { DurationControl } from '@/components/controls/duration-control';

interface DerivedTokensProps {
  sourceTokenKey: string;
}

function DerivedTokenControl({ token }: { token: TokenDefinition }) {
  if (token.type === 'color' && token.lightDark) {
    return <ColorPairControl token={token} />;
  }
  switch (token.type) {
    case 'color':
      return <ColorControl token={token} />;
    case 'dimension':
      return <DimensionControl token={token} />;
    case 'weight':
      return <WeightControl token={token} />;
    case 'easing':
      return <EasingControl token={token} />;
    case 'duration':
      return <DurationControl token={token} />;
    default:
      return null;
  }
}

/** Strip the parent token's label from a derived token label for brevity */
function shortenLabel(label: string, parentKey: string): string {
  const parent = TOKEN_REGISTRY.find((t) => t.key === parentKey);
  if (!parent) return label;
  const prefix = parent.label;
  if (label.startsWith(prefix + ' ')) {
    return label.slice(prefix.length + 1);
  }
  return label;
}

export function DerivedTokens({ sourceTokenKey }: DerivedTokensProps) {
  const { overrides, dispatch } = useTokens();

  const derivedTokens = TOKEN_REGISTRY.filter(
    (t) => t.derivedFrom === sourceTokenKey
  );

  if (derivedTokens.length === 0) return null;

  return (
    <div className="ml-2 -mt-1 mb-1 border-l border-border pl-2 flex flex-col">
      {derivedTokens.map((token) => {
        const currentValue = overrides[token.key] ?? token.defaultValue;
        const isOverridden = token.key in overrides;

        return (
          <div
            key={token.key}
            className="flex items-center justify-between gap-2 min-h-[36px]"
          >
            <span className="text-xs text-muted-foreground shrink-0">
              {shortenLabel(token.label, sourceTokenKey)}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {isOverridden ? (
                <DerivedTokenControl token={token} />
              ) : (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => {
                    if (token.type === 'color' && token.lightDark) {
                      const fallback = parseLightDarkDefault(token.defaultValue);
                      dispatch({ type: 'SET_TOKEN', key: token.key + '--light', value: fallback.light });
                      dispatch({ type: 'SET_TOKEN', key: token.key + '--dark', value: fallback.dark });
                    } else {
                      const defaultVal = TOKEN_DEFAULTS[token.key] ?? token.defaultValue;
                      dispatch({ type: 'SET_TOKEN', key: token.key, value: defaultVal });
                    }
                  }}
                >
                  {hasVarReference(currentValue) ? (
                    <AliasValue value={currentValue} compact={token.type === 'color'} />
                  ) : (
                    <span className="text-xs font-mono">
                      {currentValue}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
