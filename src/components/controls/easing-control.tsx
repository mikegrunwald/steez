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

interface EasingControlProps {
  token: TokenDefinition;
}

type EasingEntry = { label: string; value: string; bezier: [number, number, number, number] };

const EASINGS: EasingEntry[] = [
  { label: 'linear', value: 'linear', bezier: [0, 0, 1, 1] },
  { label: 'ease', value: 'ease', bezier: [0.25, 0.1, 0.25, 1] },
  { label: 'ease-in', value: 'ease-in', bezier: [0.42, 0, 1, 1] },
  { label: 'ease-out', value: 'ease-out', bezier: [0, 0, 0.58, 1] },
  { label: 'ease-in-out', value: 'ease-in-out', bezier: [0.42, 0, 0.58, 1] },
  { label: 'ease-in-quad', value: 'ease-in-quad', bezier: [0.55, 0.085, 0.68, 0.53] },
  { label: 'ease-out-quad', value: 'ease-out-quad', bezier: [0.25, 0.46, 0.45, 0.94] },
  { label: 'ease-in-out-quad', value: 'ease-in-out-quad', bezier: [0.455, 0.03, 0.515, 0.955] },
  { label: 'ease-in-cubic', value: 'ease-in-cubic', bezier: [0.55, 0.055, 0.675, 0.19] },
  { label: 'ease-out-cubic', value: 'ease-out-cubic', bezier: [0.215, 0.61, 0.355, 1] },
  { label: 'ease-in-out-cubic', value: 'ease-in-out-cubic', bezier: [0.645, 0.045, 0.355, 1] },
  { label: 'ease-in-quart', value: 'ease-in-quart', bezier: [0.895, 0.03, 0.685, 0.22] },
  { label: 'ease-out-quart', value: 'ease-out-quart', bezier: [0.165, 0.84, 0.44, 1] },
  { label: 'ease-in-out-quart', value: 'ease-in-out-quart', bezier: [0.77, 0, 0.175, 1] },
  { label: 'ease-in-back', value: 'ease-in-back', bezier: [0.36, 0, 0.66, -0.56] },
  { label: 'ease-out-back', value: 'ease-out-back', bezier: [0.34, 1.56, 0.64, 1] },
  { label: 'ease-in-out-back', value: 'ease-in-out-back', bezier: [0.68, -0.6, 0.32, 1.6] },
];

function BezierCurvePreview({ bezier }: { bezier: [number, number, number, number] }) {
  const [x1, y1, x2, y2] = bezier;
  // Map bezier to SVG coords: x is time 0→40, y is value 0→30 (flipped)
  const W = 40;
  const H = 30;
  const pad = 4;
  const cx = (x: number) => pad + x * (W - pad * 2);
  const cy = (y: number) => H - pad - y * (H - pad * 2);

  const p0x = cx(0), p0y = cy(0);
  const p3x = cx(1), p3y = cy(1);
  const c1x = cx(x1), c1y = cy(y1);
  const c2x = cx(x2), c2y = cy(y2);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      {/* guide lines */}
      <line x1={p0x} y1={p0y} x2={c1x} y2={c1y} stroke="currentColor" strokeWidth={0.5} opacity={0.3} />
      <line x1={p3x} y1={p3y} x2={c2x} y2={c2y} stroke="currentColor" strokeWidth={0.5} opacity={0.3} />
      {/* curve */}
      <path
        d={`M${p0x},${p0y} C${c1x},${c1y} ${c2x},${c2y} ${p3x},${p3y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* endpoints */}
      <circle cx={p0x} cy={p0y} r={1.5} fill="currentColor" />
      <circle cx={p3x} cy={p3y} r={1.5} fill="currentColor" />
    </svg>
  );
}

export function EasingControl({ token }: EasingControlProps) {
  const { overrides, dispatch } = useTokens();
  const currentValue = overrides[token.key] ?? token.defaultValue;

  const matched = EASINGS.find((e) => e.value === currentValue) ?? EASINGS[0];

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentValue}
        onValueChange={(val) => val && dispatch({ type: 'SET_TOKEN', key: token.key, value: val })}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EASINGS.map((easing) => (
            <SelectItem key={easing.value} value={easing.value}>
              {easing.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <BezierCurvePreview bezier={matched.bezier} />
      <ChangeIndicator tokenKey={token.key} />
    </div>
  );
}
