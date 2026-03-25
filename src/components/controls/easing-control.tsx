'use client';

import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { AliasValue } from '@/components/alias-value';
import { hasVarReference } from '@/lib/tokens/value-parser';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface EasingControlProps {
  token: TokenDefinition;
}

type EasingEntry = { label: string; varName: string; group: string };

const EASINGS: EasingEntry[] = [
  // Standard
  { label: 'linear', varName: '--linear', group: 'Standard' },
  { label: 'ease', varName: '--ease', group: 'Standard' },
  { label: 'ease-in', varName: '--ease-in', group: 'Standard' },
  { label: 'ease-out', varName: '--ease-out', group: 'Standard' },
  { label: 'ease-in-out', varName: '--ease-in-out', group: 'Standard' },
  // Ease In
  { label: 'ease-in-quad', varName: '--ease-in-quad', group: 'Ease In' },
  { label: 'ease-in-cubic', varName: '--ease-in-cubic', group: 'Ease In' },
  { label: 'ease-in-quart', varName: '--ease-in-quart', group: 'Ease In' },
  { label: 'ease-in-quint', varName: '--ease-in-quint', group: 'Ease In' },
  { label: 'ease-in-sine', varName: '--ease-in-sine', group: 'Ease In' },
  { label: 'ease-in-expo', varName: '--ease-in-expo', group: 'Ease In' },
  { label: 'ease-in-circ', varName: '--ease-in-circ', group: 'Ease In' },
  { label: 'ease-in-back', varName: '--ease-in-back', group: 'Ease In' },
  // Ease Out
  { label: 'ease-out-quad', varName: '--ease-out-quad', group: 'Ease Out' },
  { label: 'ease-out-cubic', varName: '--ease-out-cubic', group: 'Ease Out' },
  { label: 'ease-out-quart', varName: '--ease-out-quart', group: 'Ease Out' },
  { label: 'ease-out-quint', varName: '--ease-out-quint', group: 'Ease Out' },
  { label: 'ease-out-sine', varName: '--ease-out-sine', group: 'Ease Out' },
  { label: 'ease-out-expo', varName: '--ease-out-expo', group: 'Ease Out' },
  { label: 'ease-out-circ', varName: '--ease-out-circ', group: 'Ease Out' },
  { label: 'ease-out-back', varName: '--ease-out-back', group: 'Ease Out' },
  // Ease In Out
  { label: 'ease-in-out-quad', varName: '--ease-in-out-quad', group: 'Ease In Out' },
  { label: 'ease-in-out-cubic', varName: '--ease-in-out-cubic', group: 'Ease In Out' },
  { label: 'ease-in-out-quart', varName: '--ease-in-out-quart', group: 'Ease In Out' },
  { label: 'ease-in-out-quint', varName: '--ease-in-out-quint', group: 'Ease In Out' },
  { label: 'ease-in-out-sine', varName: '--ease-in-out-sine', group: 'Ease In Out' },
  { label: 'ease-in-out-expo', varName: '--ease-in-out-expo', group: 'Ease In Out' },
  { label: 'ease-in-out-circ', varName: '--ease-in-out-circ', group: 'Ease In Out' },
  { label: 'ease-in-out-back', varName: '--ease-in-out-back', group: 'Ease In Out' },
];

const GROUPS = ['Standard', 'Ease In', 'Ease Out', 'Ease In Out'];

/** Resolve a value to display label */
function resolveLabel(value: string): string {
  // Check var() ref
  const varMatch = value.match(/^var\((.+)\)$/);
  if (varMatch) {
    const entry = EASINGS.find((e) => e.varName === varMatch[1]);
    if (entry) return entry.label;
  }
  // Check bare name
  const nameMatch = EASINGS.find((e) => e.label === value || e.varName === `--${value}`);
  if (nameMatch) return nameMatch.label;
  return value;
}

function isSelected(currentValue: string, easing: EasingEntry): boolean {
  return (
    currentValue === `var(${easing.varName})` ||
    currentValue === easing.label ||
    currentValue === easing.varName
  );
}

export function EasingControl({ token }: EasingControlProps) {
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
      <div className="flex items-center gap-2">
        <Input
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
          className="h-7 text-xs font-mono flex-1"
          placeholder="cubic-bezier(0.25, 0.1, 0.25, 1)"
          autoFocus
        />
        <button
          onClick={() => setCustomMode(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
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
            <button className="flex items-center justify-between gap-1.5 h-7 px-2.5 rounded-lg border border-input text-xs w-44 bg-transparent hover:bg-accent/50 transition-colors">
              {isAlias ? (
                <AliasValue value={currentValue} className="truncate" />
              ) : (
                <span className="truncate">{displayLabel}</span>
              )}
              <ChevronsUpDownIcon className="size-3.5 text-muted-foreground shrink-0" />
            </button>
          }
        />
        <PopoverContent className="w-56 p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search easings…" />
            <CommandList>
              <CommandEmpty>No match.</CommandEmpty>
              {GROUPS.map((group) => {
                const entries = EASINGS.filter((e) => e.group === group);
                return (
                  <CommandGroup key={group} heading={group}>
                    {entries.map((easing) => (
                      <CommandItem
                        key={easing.varName}
                        value={easing.label}
                        onSelect={() => commit(`var(${easing.varName})`)}
                      >
                        <CheckIcon
                          className="size-3.5 shrink-0"
                          style={{ opacity: isSelected(currentValue, easing) ? 1 : 0 }}
                        />
                        <span className="text-xs">{easing.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
              <CommandSeparator />
              <CommandItem
                value="__custom__"
                onSelect={() => {
                  setCustomInput(currentValue);
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
