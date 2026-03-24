'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useTokens } from '@/lib/state/token-context';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PreviewIframe, type PreviewIframeHandle } from './preview-iframe';
import type { ColorSchemeMode, PreviewMode } from '@/lib/tokens/types';

function useIsLg() {
  const [isLg, setIsLg] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsLg(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isLg;
}

export function PreviewArea() {
  const { colorSchemeMode, previewMode, dispatch } = useTokens();
  const lightRef = useRef<PreviewIframeHandle>(null);
  const darkRef = useRef<PreviewIframeHandle>(null);
  const syncingRef = useRef(false);
  const isLg = useIsLg();
  const [mobileSchemeTab, setMobileSchemeTab] = useState<'light' | 'dark'>('light');

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

  const showBothSideBySide = colorSchemeMode === 'both' && isLg;
  const showMobileTabs = colorSchemeMode === 'both' && !isLg;

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
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

      {/* Mobile tab switcher — only when "both" on small screens */}
      {showMobileTabs && (
        <div className="flex border-b bg-muted/30">
          <button
            className={`flex-1 py-1.5 text-sm font-medium transition-colors ${mobileSchemeTab === 'light' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'}`}
            onClick={() => setMobileSchemeTab('light')}
          >
            Light
          </button>
          <button
            className={`flex-1 py-1.5 text-sm font-medium transition-colors ${mobileSchemeTab === 'dark' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'}`}
            onClick={() => setMobileSchemeTab('dark')}
          >
            Dark
          </button>
        </div>
      )}

      {/* Iframe container */}
      <div className="flex flex-1 min-h-0">
        {showMobileTabs ? (
          mobileSchemeTab === 'light' ? (
            <PreviewIframe ref={lightRef} colorScheme="light" className="flex-1" />
          ) : (
            <PreviewIframe ref={darkRef} colorScheme="dark" className="flex-1" />
          )
        ) : (
          <>
            {(colorSchemeMode === 'light' || colorSchemeMode === 'both') && (
              <PreviewIframe
                ref={lightRef}
                colorScheme="light"
                onScroll={showBothSideBySide ? handleLightScroll : undefined}
                className="flex-1"
              />
            )}
            {showBothSideBySide && (
              <div className="w-px bg-border" />
            )}
            {(colorSchemeMode === 'dark' || colorSchemeMode === 'both') && (
              <PreviewIframe
                ref={darkRef}
                colorScheme="dark"
                onScroll={showBothSideBySide ? handleDarkScroll : undefined}
                className="flex-1"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
