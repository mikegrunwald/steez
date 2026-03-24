'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface GradientBuilderProps {
  token: TokenDefinition;
}

interface ColorStop {
  color: string;
  position: number;
}

const DIRECTIONS = [
  { label: 'To Right', value: 'to right' },
  { label: 'To Left', value: 'to left' },
  { label: 'To Bottom', value: 'to bottom' },
  { label: 'To Top', value: 'to top' },
  { label: 'To Bottom Right', value: 'to bottom right' },
  { label: 'To Bottom Left', value: 'to bottom left' },
  { label: '45°', value: '45deg' },
  { label: '135°', value: '135deg' },
];

function parseGradient(value: string): { direction: string; stops: ColorStop[] } {
  const match = value.match(/linear-gradient\(\s*(.+)\s*\)/);
  if (!match) return { direction: 'to right', stops: [{ color: '#3b82f6', position: 0 }, { color: '#a855f7', position: 100 }] };

  const inner = match[1];
  const parts = inner.split(/,(?![^(]*\))/);
  let direction = 'to right';
  const stops: ColorStop[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (i === 0 && (part.startsWith('to ') || part.endsWith('deg'))) {
      direction = part;
      continue;
    }
    const stopMatch = part.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s*(\d+)?%?/);
    if (stopMatch) {
      stops.push({
        color: stopMatch[1],
        position: stopMatch[2] ? parseInt(stopMatch[2]) : Math.round((stops.length / Math.max(parts.length - 2, 1)) * 100),
      });
    }
  }

  if (stops.length < 2) {
    return { direction, stops: [{ color: '#3b82f6', position: 0 }, { color: '#a855f7', position: 100 }] };
  }

  return { direction, stops };
}

function composeGradient(direction: string, stops: ColorStop[]): string {
  const stopStr = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
  return `linear-gradient(${direction}, ${stopStr})`;
}

export function GradientBuilder({ token }: GradientBuilderProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;

  const { direction, stops } = parseGradient(currentValue);

  const commit = (newDirection: string, newStops: ColorStop[]) => {
    dispatch({ type: 'SET_TOKEN', key: token.key, value: composeGradient(newDirection, newStops) });
  };

  const updateStop = (index: number, changes: Partial<ColorStop>) => {
    const newStops = stops.map((s, i) => (i === index ? { ...s, ...changes } : s));
    commit(direction, newStops);
  };

  const addStop = () => {
    const pos = stops.length >= 2 ? Math.round((stops[stops.length - 2].position + stops[stops.length - 1].position) / 2) : 50;
    const newStops = [...stops, { color: '#ffffff', position: pos }].sort((a, b) => a.position - b.position);
    commit(direction, newStops);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    commit(direction, stops.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Preview strip */}
      <div
        className="h-6 w-full rounded border border-input"
        style={{ background: currentValue }}
      />

      <div className="flex items-center gap-2">
        {/* Direction select */}
        <Select value={direction} onValueChange={(val) => val && commit(val, stops)}>
          <SelectTrigger className="w-36 h-7" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIRECTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Color stops */}
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      className="size-5 rounded border border-input cursor-pointer shrink-0"
                      style={{ backgroundColor: stop.color }}
                      aria-label={`Stop ${i + 1} color`}
                    />
                  }
                />
                <PopoverContent className="w-auto p-3 flex flex-col gap-2" side="top">
                  <HexColorPicker color={stop.color} onChange={(c) => updateStop(i, { color: c })} />
                </PopoverContent>
              </Popover>
              <Input
                type="number"
                value={stop.position}
                min={0}
                max={100}
                step={1}
                onChange={(e) => updateStop(i, { position: parseInt(e.target.value) || 0 })}
                className="w-12 h-6 text-xs font-mono px-1"
              />
              <span className="text-xs text-muted-foreground">%</span>
              {stops.length > 2 && (
                <button
                  onClick={() => removeStop(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove stop"
                >
                  <Trash2Icon className="size-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStop}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Add color stop"
          >
            <PlusIcon className="size-3" />
          </button>
        </div>

        <ChangeIndicator tokenKey={token.key} />
      </div>
    </div>
  );
}
