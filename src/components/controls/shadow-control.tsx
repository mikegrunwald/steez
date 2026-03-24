'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface ShadowControlProps {
  token: TokenDefinition;
}

interface ShadowParts {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

function parseShadow(value: string): ShadowParts {
  // Basic parser for "Xpx Ypx BLURpx SPREADpx COLOR"
  const colorMatch = value.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/);
  const color = colorMatch ? colorMatch[0] : '#00000040';
  const parts = value.replace(color, '').trim().split(/\s+/);
  const nums = parts.map((p) => parseFloat(p) || 0);
  return {
    x: nums[0] ?? 0,
    y: nums[1] ?? 4,
    blur: nums[2] ?? 8,
    spread: nums[3] ?? 0,
    color,
  };
}

function composeShadow({ x, y, blur, spread, color }: ShadowParts): string {
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        className="flex-1"
      />
      <span className="text-xs font-mono w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

export function ShadowControl({ token }: ShadowControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const parts = parseShadow(currentValue);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const update = (changes: Partial<ShadowParts>) => {
    dispatch({
      type: 'SET_TOKEN',
      key: token.key,
      value: composeShadow({ ...parts, ...changes }),
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Preview swatch */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              className="size-6 rounded border border-input shrink-0 cursor-pointer bg-background"
              style={{ boxShadow: currentValue }}
              aria-label="Open shadow editor"
            />
          }
        />
        <PopoverContent className="w-64 p-3 flex flex-col gap-3" side="bottom" align="start">
          <p className="text-xs font-medium text-muted-foreground">Shadow</p>
          <SliderRow label="X offset" value={parts.x} min={-20} max={20} onChange={(v) => update({ x: v })} />
          <SliderRow label="Y offset" value={parts.y} min={-20} max={20} onChange={(v) => update({ y: v })} />
          <SliderRow label="Blur" value={parts.blur} min={0} max={50} onChange={(v) => update({ blur: v })} />
          <SliderRow label="Spread" value={parts.spread} min={-10} max={30} onChange={(v) => update({ spread: v })} />
          {/* Color */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12 shrink-0">Color</span>
            <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
              <PopoverTrigger
                render={
                  <button
                    className="size-5 rounded border border-input cursor-pointer"
                    style={{ backgroundColor: parts.color }}
                    aria-label="Shadow color"
                  />
                }
              />
              <PopoverContent className="w-auto p-3" side="right">
                <HexColorPicker color={parts.color} onChange={(c) => update({ color: c })} />
              </PopoverContent>
            </Popover>
            <span className="text-xs font-mono text-muted-foreground truncate">{parts.color}</span>
          </div>
        </PopoverContent>
      </Popover>
      <span className="text-xs font-mono text-muted-foreground truncate flex-1">{currentValue}</span>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
