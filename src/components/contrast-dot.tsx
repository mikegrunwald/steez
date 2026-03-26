'use client';

import { contrastRatio, getWcagLevel, getContrastDotColor } from '@/lib/contrast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface ContrastDotProps {
  textColor: string;
  surfaceColor: string;
}

export function ContrastDot({ textColor, surfaceColor }: ContrastDotProps) {
  let ratio = 1;
  try {
    ratio = contrastRatio(textColor, surfaceColor);
  } catch {
    // Invalid hex — leave ratio at 1
  }

  const level = getWcagLevel(ratio);
  const dotColor = getContrastDotColor(level);
  const label = `${ratio.toFixed(1)}:1 — ${level}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              aria-label={label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0,
                cursor: 'default',
              }}
            />
          }
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dotColor,
              flexShrink: 0,
            }}
          />
          <span className="sr-only">{label}</span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
