'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { AliasValue } from '@/components/alias-value';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface DimensionControlProps {
  token: TokenDefinition;
}

function parseNumeric(value: string, unit?: string): number | null {
  // CSS expressions (calc, var, clamp, pow, color-mix, etc.) can't be parsed as numbers
  if (/[a-z-]\(/.test(value)) return null;
  if (unit) return parseFloat(value.replace(unit, '')) || 0;
  // If no unit specified, reject values that contain unit suffixes (e.g. "3rem", "16px")
  if (/[a-z%]+$/i.test(value.trim())) return null;
  return parseFloat(value) || 0;
}

export function DimensionControl({ token }: DimensionControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const { unit = '' } = token;

  const numeric = parseNumeric(currentValue, unit);
  const isExpression = numeric === null;
  const isAlias = hasVarReference(currentValue);

  const [expressionInput, setExpressionInput] = useState(currentValue);
  const [editingExpression, setEditingExpression] = useState(false);

  const handleChange = (num: number) => {
    const composed = unit ? `${num}${unit}` : String(num);
    dispatch({ type: 'SET_TOKEN', key: token.key, value: composed });
  };

  const commitExpression = (value: string) => {
    dispatch({ type: 'SET_TOKEN', key: token.key, value });
    setEditingExpression(false);
  };

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {isExpression ? (
        editingExpression ? (
          <Input
            value={expressionInput}
            onChange={(e) => setExpressionInput(e.target.value)}
            onBlur={() => commitExpression(expressionInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitExpression(expressionInput);
              if (e.key === 'Escape') setEditingExpression(false);
            }}
            className="h-7 text-xs font-mono flex-1"
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left cursor-pointer hover:bg-accent/50 rounded px-1 -mx-1 transition-colors"
            onClick={() => {
              setExpressionInput(currentValue);
              setEditingExpression(true);
            }}
          >
            {isAlias ? (
              <AliasValue value={currentValue} />
            ) : (
              <span className="text-xs font-mono text-foreground truncate">
                {currentValue}
              </span>
            )}
          </button>
        )
      ) : (
        <div className="flex items-center gap-1.5 flex-1">
          <Input
            type="number"
            value={String(numeric)}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            className="flex-1 h-7 text-xs font-mono"
            min={token.min}
            max={token.max}
            step={token.step}
          />
          {unit && <span className="text-xs text-foreground shrink-0">{unit}</span>}
        </div>
      )}
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
