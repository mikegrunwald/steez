'use client';

import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { AliasValue } from '@/components/alias-value';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface WeightControlProps {
  token: TokenDefinition;
}

const FONT_WEIGHTS = [
  { label: 'Thin', value: '100', varRef: 'var(--font-weight-thin)' },
  { label: 'Extra Light', value: '200', varRef: 'var(--font-weight-extra-light)' },
  { label: 'Light', value: '300', varRef: 'var(--font-weight-light)' },
  { label: 'Regular', value: '400', varRef: 'var(--font-weight-normal)' },
  { label: 'Medium', value: '500', varRef: 'var(--font-weight-medium)' },
  { label: 'Semi-Bold', value: '600', varRef: 'var(--font-weight-semi-bold)' },
  { label: 'Bold', value: '700', varRef: 'var(--font-weight-bold)' },
  { label: 'Extra-Bold', value: '800', varRef: 'var(--font-weight-extra-bold)' },
  { label: 'Black', value: '900', varRef: 'var(--font-weight-black)' },
];

/** Resolve a value (which may be a var() ref or a numeric string) to a display label */
function resolveLabel(value: string): string {
  // Check if it's a var() reference
  const varMatch = FONT_WEIGHTS.find((w) => w.varRef === value);
  if (varMatch) return `${varMatch.label} (${varMatch.value})`;
  // Check if it's a raw numeric value
  const numMatch = FONT_WEIGHTS.find((w) => w.value === value);
  if (numMatch) return `${numMatch.label} (${numMatch.value})`;
  return value;
}

export function WeightControl({ token }: WeightControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;

  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const displayLabel = resolveLabel(currentValue);
  const isAlias = hasVarReference(currentValue);

  const commit = (value: string) => {
    dispatch({ type: 'SET_TOKEN', key: token.key, value });
    setOpen(false);
  };

  if (customMode) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Input
          type="number"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onBlur={() => {
            if (customInput) commit(customInput);
            setCustomMode(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (customInput) commit(customInput);
              setCustomMode(false);
            }
            if (e.key === 'Escape') setCustomMode(false);
          }}
          min={1}
          max={1000}
          step={100}
          className="flex-1 h-7 text-xs font-mono"
          placeholder="400"
          autoFocus
        />
        <button
          onClick={() => setCustomMode(false)}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded px-1"
        >
          Cancel
        </button>
        <ChangeIndicator tokenKey={token.key} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button aria-label="Select font weight" className="flex items-center justify-between gap-1.5 h-7 px-2.5 rounded-lg border border-input text-xs w-40 bg-transparent hover:bg-accent/50 transition-colors">
              {isAlias ? (
                <AliasValue value={currentValue} className="truncate" />
              ) : (
                <span className="truncate">{displayLabel}</span>
              )}
              <ChevronsUpDownIcon className="size-3.5 text-muted-foreground shrink-0" />
            </button>
          }
        />
        <PopoverContent className="w-48 p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search weights…" />
            <CommandList>
              <CommandEmpty>No match.</CommandEmpty>
              {FONT_WEIGHTS.map((weight) => {
                const isSelected =
                  currentValue === weight.varRef || currentValue === weight.value;
                return (
                  <CommandItem
                    key={weight.value}
                    value={`${weight.label} ${weight.value}`}
                    onSelect={() => commit(weight.varRef)}
                  >
                    <CheckIcon
                      className="size-3.5 shrink-0"
                      style={{ opacity: isSelected ? 1 : 0 }}
                    />
                    <span style={{ fontWeight: parseInt(weight.value) }}>
                      {weight.label}
                    </span>
                    <span className="ml-auto text-foreground/60 text-[10px] font-mono">
                      {weight.value}
                    </span>
                  </CommandItem>
                );
              })}
              <CommandSeparator />
              <CommandItem
                value="__custom__"
                onSelect={() => {
                  setCustomInput(
                    FONT_WEIGHTS.find((w) => w.varRef === currentValue)?.value ??
                      currentValue.replace(/\D/g, '') ??
                      '400',
                  );
                  setCustomMode(true);
                  setOpen(false);
                }}
              >
                Custom…
              </CommandItem>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
