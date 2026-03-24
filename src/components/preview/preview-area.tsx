'use client';

import { useRef, useCallback } from 'react';
import { useTokens } from '@/lib/state/token-context';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PreviewIframe, type PreviewIframeHandle } from './preview-iframe';
import type { ColorSchemeMode, PreviewMode } from '@/lib/tokens/types';

export function PreviewArea() {
  const { colorSchemeMode, previewMode, dispatch } = useTokens();
  const lightRef = useRef<PreviewIframeHandle>(null);
  const darkRef = useRef<PreviewIframeHandle>(null);
  const syncingRef = useRef(false);

  const handleLightScroll = useCallback((scrollTop: number) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    darkRef.current?.scrollTo(scrollTop);
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  const handleDarkScroll = useCallback((scrollTop: number) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    lightRef.current?.scrollTo(scrollTop);
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <Tabs
          value={previewMode}
          onValueChange={(v) => dispatch({ type: 'SET_PREVIEW_MODE', mode: v as PreviewMode })}
        >
          <TabsList>
            <TabsTrigger value="vignettes">Vignettes</TabsTrigger>
            <TabsTrigger value="kitchen-sink">Kitchen Sink</TabsTrigger>
          </TabsList>
        </Tabs>

        <ToggleGroup
          value={[colorSchemeMode]}
          onValueChange={(values) => {
            const v = values[0];
            if (v) dispatch({ type: 'SET_COLOR_SCHEME_MODE', mode: v as ColorSchemeMode });
          }}
        >
          <ToggleGroupItem value="light" aria-label="Light mode">Light</ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark mode">Dark</ToggleGroupItem>
          <ToggleGroupItem value="both" aria-label="Both modes">Both</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Iframe container */}
      <div className="flex flex-1 min-h-0">
        {(colorSchemeMode === 'light' || colorSchemeMode === 'both') && (
          <PreviewIframe
            ref={lightRef}
            colorScheme="light"
            onScroll={colorSchemeMode === 'both' ? handleLightScroll : undefined}
            className="flex-1"
          />
        )}
        {colorSchemeMode === 'both' && (
          <div className="w-px bg-border" />
        )}
        {(colorSchemeMode === 'dark' || colorSchemeMode === 'both') && (
          <PreviewIframe
            ref={darkRef}
            colorScheme="dark"
            onScroll={colorSchemeMode === 'both' ? handleDarkScroll : undefined}
            className="flex-1"
          />
        )}
      </div>
    </div>
  );
}
