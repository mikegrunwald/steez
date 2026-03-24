'use client';

import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface RatioControlProps {
  token: TokenDefinition;
}

export function RatioControl({ token }: RatioControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const { min = 1, max = 2, step = 0.01 } = token;

  const numeric = parseFloat(currentValue) || 1.25;

  const handleChange = (num: number) => {
    dispatch({ type: 'SET_TOKEN', key: token.key, value: String(num) });
  };

  return (
    <div className="flex items-center gap-3">
      <Slider
        value={[numeric]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
        className="flex-1"
      />
      <Input
        type="number"
        value={numeric}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleChange(parseFloat(e.target.value) || min)}
        className="w-20 h-7 text-sm font-mono"
      />
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
