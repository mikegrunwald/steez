'use client';

import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ChangeIndicator } from '@/components/change-indicator';
import { useTokens } from '@/lib/state/token-context';
import type { TokenDefinition } from '@/lib/tokens/types';

interface DurationControlProps {
  token: TokenDefinition;
}

function parseSeconds(value: string): number {
  if (value.endsWith('ms')) return parseFloat(value) / 1000;
  if (value.endsWith('s')) return parseFloat(value);
  return parseFloat(value) || 0;
}

function AnimationPreview({ duration }: { duration: number }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [duration]);

  return (
    <div
      className="relative shrink-0"
      style={{ width: 60, height: 12, backgroundColor: 'var(--muted)', borderRadius: 6 }}
      title={`${duration}s`}
    >
      <div
        key={key}
        ref={dotRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          animation: `duration-preview ${duration}s ease-in-out infinite alternate`,
        }}
      />
      <style>{`
        @keyframes duration-preview {
          from { transform: translateX(0); }
          to { transform: translateX(48px); }
        }
      `}</style>
    </div>
  );
}

export function DurationControl({ token }: DurationControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;
  const { min = 0, max = 2, step = 0.05 } = token;

  const numeric = parseSeconds(currentValue);

  const handleChange = (num: number) => {
    const clamped = Math.max(min, Math.min(max, num));
    dispatch({ type: 'SET_TOKEN', key: token.key, value: `${clamped}s` });
  };

  return (
    <div className="flex items-center gap-3">
      <Slider
        value={[numeric]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
        className="flex-1"
      />
      <Input
        type="number"
        value={numeric}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className="w-20 h-7 text-sm font-mono"
      />
      <span className="text-xs text-muted-foreground shrink-0">s</span>
      <AnimationPreview duration={numeric} />
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
