'use client';

import { useState } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/lib/state/token-context';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import { downloadCSS } from '@/lib/export/export-css';
import { TokenGroup } from '@/components/panel/token-group';
import type { TokenCategory } from '@/lib/tokens/types';

const CATEGORIES: { key: TokenCategory; label: string }[] = [
  { key: 'colors', label: 'Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'borders', label: 'Borders' },
  { key: 'elevation', label: 'Elevation' },
  { key: 'animation', label: 'Animation' },
  { key: 'controls', label: 'Controls' },
];

export function ControlPanel() {
  const { overrides, expandedCategory, changedCount, dispatch } = useTokens();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const accordionValue = expandedCategory ? [expandedCategory] : [];

  const handleValueChange = (value: string[]) => {
    const next = value[value.length - 1] ?? null;
    dispatch({ type: 'SET_EXPANDED_CATEGORY', category: next });
  };

  const handleResetAll = () => {
    dispatch({ type: 'RESET_ALL' });
    setResetDialogOpen(false);
  };

  const handleExport = () => {
    downloadCSS(overrides);
  };

  return (
    <aside className="flex flex-col w-full lg:w-80 shrink-0 lg:h-screen max-h-[50vh] lg:max-h-none border-t lg:border-t-0 lg:border-l border-border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm font-semibold tracking-tight flex-1">rek-room</span>
        {changedCount > 0 && (
          <span className="text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
            {changedCount}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reset all"
          onClick={() => setResetDialogOpen(true)}
          disabled={changedCount === 0}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download />
          Export
        </Button>
      </div>

      {/* Accordion */}
      <div className="flex-1 overflow-y-auto">
        <Accordion
          value={accordionValue}
          onValueChange={handleValueChange}
        >
          {CATEGORIES.map(({ key, label }) => {
            const tokens = TOKEN_REGISTRY.filter((t) => t.category === key);
            return (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="px-4">
                  {label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-2">
                    <TokenGroup category={key} tokens={tokens} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Reset All Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all overrides?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {changedCount} customization
              {changedCount === 1 ? '' : 's'} and restore rek-room defaults. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll}>
              Reset all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
