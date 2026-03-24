'use client';

import { useTokens } from '@/lib/state/token-context';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import { TOKEN_DEFAULTS } from '@/lib/tokens/defaults';

interface DerivedTokensProps {
  sourceTokenKey: string;
}

export function DerivedTokens({ sourceTokenKey }: DerivedTokensProps) {
  const { overrides, dispatch } = useTokens();

  const derivedTokens = TOKEN_REGISTRY.filter(
    (t) => t.derivedFrom === sourceTokenKey
  );

  if (derivedTokens.length === 0) return null;

  return (
    <div className="ml-4 mt-1 border-l border-border pl-3 flex flex-col gap-1">
      {derivedTokens.map((token) => {
        const currentValue = overrides[token.key] ?? token.defaultValue;
        const isOverridden = token.key in overrides;

        return (
          <div
            key={token.key}
            className="flex items-center gap-2 py-0.5"
          >
            <div
              className="size-3 rounded-sm shrink-0 border border-input"
              style={{ backgroundColor: currentValue }}
            />
            <span className="text-xs text-muted-foreground truncate flex-1">
              {token.label}
            </span>
            {!isOverridden && (
              <button
                className="text-xs text-primary hover:underline shrink-0"
                onClick={() => {
                  const defaultVal = TOKEN_DEFAULTS[token.key] ?? token.defaultValue;
                  dispatch({ type: 'SET_TOKEN', key: token.key, value: defaultVal });
                }}
              >
                override
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
