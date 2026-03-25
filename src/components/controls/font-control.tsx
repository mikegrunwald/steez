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
import { GOOGLE_FONTS } from '@/lib/google-fonts';
import type { TokenDefinition } from '@/lib/tokens/types';

interface FontControlProps {
  token: TokenDefinition;
}

const SYSTEM_STACK_VALUE =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SYSTEM_STACK_LABEL = 'System Stack';

const FONT_CATEGORIES = ['sans-serif', 'serif', 'monospace'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  'sans-serif': 'Sans-Serif',
  serif: 'Serif',
  monospace: 'Monospace',
};

export function FontControl({ token }: FontControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;

  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(currentValue);

  const isSystemStack = currentValue === SYSTEM_STACK_VALUE;
  const isAlias = hasVarReference(currentValue);
  // Strip quotes for matching against font list
  const unquotedValue = currentValue.replace(/^["']|["']$/g, '');
  const matchedFont = GOOGLE_FONTS.find((f) => f.name === unquotedValue || f.name === currentValue);
  const displayLabel = isSystemStack
    ? SYSTEM_STACK_LABEL
    : matchedFont
      ? matchedFont.name
      : currentValue;

  const commit = (value: string) => {
    // Quote font names that contain spaces for valid CSS font-family
    const cssValue = value.includes(' ') && !value.startsWith('"') && !value.startsWith("'") && !value.startsWith('var(')
      ? `"${value}"`
      : value;
    dispatch({ type: 'SET_TOKEN', key: token.key, value: cssValue });
    setOpen(false);
  };

  if (customMode) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onBlur={() => commit(customInput)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(customInput);
            if (e.key === 'Escape') setCustomMode(false);
          }}
          className="h-7 text-xs flex-1"
          placeholder="font-family value…"
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
            <button className="flex items-center justify-between gap-1.5 h-7 px-2.5 rounded-lg border border-input text-xs w-48 bg-transparent hover:bg-accent/50 transition-colors">
              {isAlias ? (
                <AliasValue value={currentValue} className="truncate" />
              ) : (
                <span className="truncate">{displayLabel}</span>
              )}
              <ChevronsUpDownIcon className="size-4 text-muted-foreground shrink-0" />
            </button>
          }
        />
        <PopoverContent className="w-56 p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search fonts…" />
            <CommandList>
              <CommandEmpty>No fonts found.</CommandEmpty>
              <CommandItem
                value={SYSTEM_STACK_LABEL}
                onSelect={() => commit(SYSTEM_STACK_VALUE)}
              >
                <CheckIcon
                  className="size-4 shrink-0"
                  style={{ opacity: isSystemStack ? 1 : 0 }}
                />
                {SYSTEM_STACK_LABEL}
              </CommandItem>
              <CommandSeparator />
              {FONT_CATEGORIES.map((cat) => {
                const fonts = GOOGLE_FONTS.filter((f) => f.category === cat);
                if (!fonts.length) return null;
                return (
                  <CommandGroup key={cat} heading={CATEGORY_LABELS[cat]}>
                    {fonts.map((font) => (
                      <CommandItem
                        key={font.name}
                        value={font.name}
                        onSelect={() => commit(font.name)}
                      >
                        <CheckIcon
                          className="size-4 shrink-0"
                          style={{ opacity: unquotedValue === font.name ? 1 : 0 }}
                        />
                        {font.name}
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
