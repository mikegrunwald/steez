'use client';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

const FONT_WEIGHTS = [
  { label: 'Thin', value: '100' },
  { label: 'Extra Light', value: '200' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi-Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra-Bold', value: '800' },
  { label: 'Black', value: '900' },
];

interface WeightControlProps {
  token: TokenDefinition;
}

export function WeightControl({ token }: WeightControlProps) {
  const { overrides, dispatch } = useTokens();
  const rawValue = overrides[token.key] ?? token.defaultValue;
  // Resolve var() references to a numeric weight for the select
  const currentValue = FONT_WEIGHTS.some((w) => w.value === rawValue)
    ? rawValue
    : '400'; // fallback to Regular if value is a var() reference

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentValue}
        onValueChange={(val) => val && dispatch({ type: 'SET_TOKEN', key: token.key, value: val })}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_WEIGHTS.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              <span style={{ fontWeight: parseInt(value) }}>{label}</span>
              <span className="ml-1 text-muted-foreground text-xs">{value}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
