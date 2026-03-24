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

const BORDER_STYLES = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'none',
] as const;

interface BorderStyleControlProps {
  token: TokenDefinition;
}

export function BorderStyleControl({ token }: BorderStyleControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;

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
          {BORDER_STYLES.map((style) => (
            <SelectItem key={style} value={style}>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-8 h-0"
                  style={{
                    borderTop: style === 'none' ? '2px solid transparent' : `2px ${style} currentColor`,
                  }}
                />
                {style}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
