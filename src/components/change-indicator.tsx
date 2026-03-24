'use client';

import { RotateCcw } from 'lucide-react';
import { useTokens } from '@/lib/state/token-context';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface ChangeIndicatorProps {
  tokenKey: string;
}

export function ChangeIndicator({ tokenKey }: ChangeIndicatorProps) {
  const { overrides, dispatch } = useTokens();
  const isChanged = tokenKey in overrides;

  if (!isChanged) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-purple-500 shrink-0" />
        <Tooltip>
          <TooltipTrigger
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reset to default"
            onClick={() => dispatch({ type: 'RESET_TOKEN', key: tokenKey })}
          >
            <RotateCcw className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Reset to default</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
