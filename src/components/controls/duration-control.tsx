'use client';

import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface DurationControlProps {
  token: TokenDefinition;
}

function parseSeconds(value: string): number {
  if (value.endsWith('ms')) return parseFloat(value) / 1000;
  if (value.endsWith('s')) return parseFloat(value);
  return parseFloat(value) || 0;
}

export function DurationControl({ token }: DurationControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const { min = 0, max = 2, step = 0.05 } = token;

  const numeric = parseSeconds(currentValue);

  const handleChange = (num: number) => {
    const clamped = Math.max(min, Math.min(max, num));
    dispatch({ type: 'SET_TOKEN', key: token.key, value: `${clamped}s` });
  };

  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <Input
        type="number"
        value={numeric}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className="flex-1 h-7 text-xs font-mono"
      />
      <span className="text-xs text-foreground shrink-0">s</span>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
