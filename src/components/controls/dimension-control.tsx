'use client';

import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface DimensionControlProps {
  token: TokenDefinition;
}

function parseNumeric(value: string, unit?: string): number {
  if (unit) return parseFloat(value.replace(unit, '')) || 0;
  return parseFloat(value) || 0;
}

export function DimensionControl({ token }: DimensionControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const { min = 0, max = 100, step = 1, unit = '' } = token;

  const numeric = parseNumeric(currentValue, unit);

  const handleChange = (num: number) => {
    const composed = unit ? `${num}${unit}` : String(num);
    dispatch({ type: 'SET_TOKEN', key: token.key, value: composed });
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
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className="w-20 h-7 text-sm"
      />
      {unit && <span className="text-xs text-muted-foreground shrink-0">{unit}</span>}
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
