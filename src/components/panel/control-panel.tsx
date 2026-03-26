"use client";

import { Download, Moon, RotateCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { TokenGroup } from "@/components/panel/token-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadCSS } from "@/lib/export/export-css";
import { useTokens } from "@/lib/state/token-context";
import { TOKEN_REGISTRY } from "@/lib/tokens/registry";
import type { TokenCategory } from "@/lib/tokens/types";

const CATEGORIES: { key: TokenCategory; label: string }[] = [
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "spacing", label: "Spacing" },
  { key: "borders", label: "Borders" },
  { key: "elevation", label: "Elevation" },
  { key: "animation", label: "Animation" },
  { key: "controls", label: "Controls" },
];

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 400;

export function ControlPanel() {
  const { overrides, expandedCategory, changedCount, dispatch } = useTokens();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = startX.current - e.clientX;
    setWidth(
      Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)),
    );
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const accordionValue = expandedCategory ? [expandedCategory] : [];

  const handleValueChange = (value: string[]) => {
    const next = value[value.length - 1] ?? null;
    dispatch({ type: "SET_EXPANDED_CATEGORY", category: next });
  };

  const handleResetAll = () => {
    dispatch({ type: "RESET_ALL" });
    setResetDialogOpen(false);
  };

  const handleExport = () => {
    downloadCSS(overrides);
  };

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    const current = resolvedTheme ?? "light";
    setTheme(current === "light" ? "dark" : "light");
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <aside
      className="flex flex-col shrink-0 lg:h-screen max-h-[50vh] lg:max-h-none border-t lg:border-t-0 bg-background overflow-hidden relative text-xs"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-label="Resize panel"
        tabIndex={0}
        className="hidden lg:flex absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize items-center justify-center z-10 hover:bg-primary/10 active:bg-primary/20 focus-visible:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
        style={{ borderLeft: "1px solid var(--border)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 50 : 10;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setWidth((w) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w + step)));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setWidth((w) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w - step)));
          }
        }}
      />
      {/* Header */}
      <div className="h-[67px] flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <div className="flex-1" />
        {changedCount > 0 && (
          <span className="text-xs font-medium tabular-nums bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
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
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download />
          Export
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="group/button inline-flex shrink-0 items-center justify-center rounded-md text-sm disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-7 cursor-pointer"
              aria-label="Toggle UI theme"
              onClick={cycleTheme}
            >
              <span className="relative size-3.5">
                <Moon
                  className={`absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                    isDark
                      ? "scale-100 opacity-100 blur-0"
                      : "scale-[0.25] opacity-0 blur-[4px]"
                  }`}
                />
                <Sun
                  className={`size-3.5 transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                    isDark
                      ? "scale-[0.25] opacity-0 blur-[4px]"
                      : "scale-100 opacity-100 blur-0"
                  }`}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle UI theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Accordion */}
      <div className="flex-1 overflow-y-auto">
        <Accordion value={accordionValue} onValueChange={handleValueChange}>
          {CATEGORIES.map(({ key, label }) => {
            const tokens = TOKEN_REGISTRY.filter((t) => t.category === key);
            return (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="px-4 text-[15px] font-bold text-muted-foreground">{label}</AccordionTrigger>
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
              {changedCount === 1 ? "" : "s"} and restore rek-room defaults.
              This action cannot be undone.
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
