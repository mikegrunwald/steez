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
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface RatioControlProps {
  token: TokenDefinition;
}

const TYPE_RATIOS = [
  { label: 'Minor Second', value: '1.067', description: 'subtle, tight' },
  { label: 'Major Second', value: '1.125', description: 'gentle, readable' },
  { label: 'Minor Third', value: '1.2', description: 'moderate, versatile' },
  { label: 'Major Third', value: '1.25', description: 'default — balanced' },
  { label: 'Perfect Fourth', value: '1.333', description: 'prominent headings' },
  { label: 'Augmented Fourth', value: '1.414', description: 'dramatic contrast' },
  { label: 'Perfect Fifth', value: '1.5', description: 'bold, expressive' },
  { label: 'Golden Ratio', value: '1.618', description: 'classic, high contrast' },
];

export function RatioControl({ token }: RatioControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;

  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(currentValue);

  const matched = TYPE_RATIOS.find((r) => r.value === currentValue);
  const displayLabel = matched
    ? `${matched.label} (${matched.value})`
    : currentValue;

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
            commit(customInput);
            setCustomMode(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit(customInput);
              setCustomMode(false);
            }
            if (e.key === 'Escape') setCustomMode(false);
          }}
          min={1}
          max={2}
          step={0.001}
          className="flex-1 h-7 text-xs font-mono"
          placeholder="1.25"
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
            <button className="flex items-center justify-between gap-1.5 h-7 px-2.5 rounded-lg border border-input text-xs w-52 bg-transparent hover:bg-accent/50 transition-colors">
              <span className="truncate">{displayLabel}</span>
              <ChevronsUpDownIcon className="size-3.5 text-muted-foreground shrink-0" />
            </button>
          }
        />
        <PopoverContent className="w-60 p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search ratios…" />
            <CommandList>
              <CommandEmpty>No match.</CommandEmpty>
              {TYPE_RATIOS.map((ratio) => (
                <CommandItem
                  key={ratio.value}
                  value={`${ratio.label} ${ratio.value}`}
                  onSelect={() => commit(ratio.value)}
                >
                  <CheckIcon
                    className="size-3.5 shrink-0"
                    style={{ opacity: currentValue === ratio.value ? 1 : 0 }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs">
                      {ratio.label}{' '}
                      <span className="font-mono text-foreground/60">{ratio.value}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{ratio.description}</span>
                  </div>
                </CommandItem>
              ))}
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
