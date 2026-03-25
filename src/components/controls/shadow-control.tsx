'use client';

import { useState } from 'react';
import { HexAlphaColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface ShadowControlProps {
  token: TokenDefinition;
}

interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  lightColor: string;
  darkColor: string;
}

/* ── Parsing ─────────────────────────────────────────── */

/** Parse a light-dark() wrapper and return [light, dark] color strings */
function parseLightDark(expr: string): [string, string] | null {
  const m = expr.match(/^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/);
  if (m) return [m[1], m[2]];
  return null;
}

/** Parse a single shadow layer string into ShadowLayer */
function parseLayer(raw: string): ShadowLayer {
  const trimmed = raw.trim();

  // Try to find light-dark(color, color) in the string
  const ldMatch = trimmed.match(/light-dark\([^)]+\)/);
  let lightColor = '#00000020';
  let darkColor = '#00000060';
  let numericPart = trimmed;

  if (ldMatch) {
    const ld = parseLightDark(ldMatch[0]);
    if (ld) {
      lightColor = ld[0];
      darkColor = ld[1];
    }
    numericPart = trimmed.replace(ldMatch[0], '').trim();
  } else {
    // No light-dark — look for plain color
    const colorMatch = trimmed.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|rgb\([^)]+\)/);
    if (colorMatch) {
      lightColor = colorMatch[0];
      darkColor = colorMatch[0];
      numericPart = trimmed.replace(colorMatch[0], '').trim();
    }
  }

  const parts = numericPart.split(/\s+/).map((p) => parseFloat(p) || 0);
  return {
    x: parts[0] ?? 0,
    y: parts[1] ?? 1,
    blur: parts[2] ?? 4,
    spread: parts[3] ?? 0,
    lightColor,
    darkColor,
  };
}

/** Parse a full shadow value (potentially with multiple comma-separated layers and light-dark) */
function parseShadowValue(value: string): ShadowLayer[] {
  // Split on commas that are NOT inside parentheses
  const layers: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      layers.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) layers.push(current);

  return layers.map(parseLayer);
}

/** Compose layers back into a CSS shadow value */
function composeShadowValue(layers: ShadowLayer[]): string {
  return layers
    .map((l) => {
      const color =
        l.lightColor === l.darkColor
          ? l.lightColor
          : `light-dark(${l.lightColor}, ${l.darkColor})`;
      return `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${color}`;
    })
    .join(', ');
}

/* ── UI Components ───────────────────────────────────── */

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
      <span className="text-[10px] text-muted-foreground w-10 shrink-0">{label}</span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        className="flex-1"
      />
      <span className="text-[10px] font-mono text-foreground w-6 text-right shrink-0">{value}</span>
    </div>
  );
}

function LayerEditor({
  layer,
  scheme,
  onNumericChange,
  onColorChange,
}: {
  layer: ShadowLayer;
  scheme: 'light' | 'dark';
  onNumericChange: (changes: Partial<Pick<ShadowLayer, 'x' | 'y' | 'blur' | 'spread'>>) => void;
  onColorChange: (color: string) => void;
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const color = scheme === 'light' ? layer.lightColor : layer.darkColor;

  return (
    <div className="flex flex-col gap-2">
      <SliderRow label="X" value={layer.x} min={-20} max={20} onChange={(v) => onNumericChange({ x: v })} />
      <SliderRow label="Y" value={layer.y} min={-20} max={20} onChange={(v) => onNumericChange({ y: v })} />
      <SliderRow label="Blur" value={layer.blur} min={0} max={50} onChange={(v) => onNumericChange({ blur: v })} />
      <SliderRow label="Spread" value={layer.spread} min={-10} max={30} onChange={(v) => onNumericChange({ spread: v })} />
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-10 shrink-0">Color</span>
        <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
          <PopoverTrigger
            render={
              <button
                className="size-4 rounded border border-input cursor-pointer"
                style={{ backgroundColor: color }}
                aria-label={`${scheme} shadow color`}
              />
            }
          />
          <PopoverContent className="w-auto p-3" side="right">
            <HexAlphaColorPicker color={color} onChange={onColorChange} />
          </PopoverContent>
        </Popover>
        <span className="text-[10px] font-mono text-foreground truncate">{color}</span>
      </div>
    </div>
  );
}

/* ── Main Control ────────────────────────────────────── */

export function ShadowControl({ token }: ShadowControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const layers = parseShadowValue(currentValue);
  const hasLightDark = layers.some((l) => l.lightColor !== l.darkColor);

  const [schemeTab, setSchemeTab] = useState<'light' | 'dark'>('light');

  const updateLayers = (newLayers: ShadowLayer[]) => {
    dispatch({
      type: 'SET_TOKEN',
      key: token.key,
      value: composeShadowValue(newLayers),
    });
  };

  const updateLayer = (layerIndex: number, changes: Partial<ShadowLayer>) => {
    const newLayers = layers.map((l, i) => (i === layerIndex ? { ...l, ...changes } : l));
    updateLayers(newLayers);
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
        <PopoverContent className="w-72 p-3 flex flex-col gap-3" side="bottom" align="start">
          {/* Light/Dark tabs — only show if the value uses light-dark() */}
          {hasLightDark && (
            <Tabs value={schemeTab} onValueChange={(v) => setSchemeTab(v as 'light' | 'dark')}>
              <TabsList className="w-full">
                <TabsTrigger value="light" className="flex-1 text-xs">Light</TabsTrigger>
                <TabsTrigger value="dark" className="flex-1 text-xs">Dark</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {layers.map((layer, i) => (
            <div key={i} className="flex flex-col gap-2">
              {layers.length > 1 && (
                <p className="text-[10px] font-medium text-muted-foreground">
                  Layer {i + 1}
                </p>
              )}
              <LayerEditor
                layer={layer}
                scheme={hasLightDark ? schemeTab : 'light'}
                onNumericChange={(changes) => updateLayer(i, changes)}
                onColorChange={(color) =>
                  updateLayer(i, {
                    [hasLightDark
                      ? schemeTab === 'light'
                        ? 'lightColor'
                        : 'darkColor'
                      : 'lightColor']: color,
                    ...(hasLightDark
                      ? {}
                      : { darkColor: color }),
                  })
                }
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <span className="text-[10px] font-mono text-foreground truncate flex-1">
        {layers.length} layer{layers.length > 1 ? 's' : ''}
      </span>
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
