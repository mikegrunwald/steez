'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTokens } from '@/lib/state/token-context';
import { generateOverrideCSS } from '@/lib/preview/css-generator';
import { postToIframe, isPreviewMessage } from '@/lib/preview/message-protocol';
import { CATEGORY_VIGNETTE_MAP, CATEGORY_KITCHEN_SINK_MAP } from '@/lib/tokens/types';
import { GOOGLE_FONTS, googleFontUrl } from '@/lib/google-fonts';

export type PreviewIframeHandle = {
  scrollTo: (scrollTop: number) => void;
  postMessage: (message: unknown) => void;
  setScrollMode: (mode: 'internal' | 'external') => void;
};

type PreviewIframeProps = {
  colorScheme: 'light' | 'dark';
  onScroll?: (scrollTop: number) => void;
  onContentHeight?: (height: number) => void;
  className?: string;
  style?: React.CSSProperties;
};

export const PreviewIframe = forwardRef<PreviewIframeHandle, PreviewIframeProps>(
  function PreviewIframe({ colorScheme, onScroll, onContentHeight, className, style }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const readyRef = useRef(false);
    const { overrides, previewMode, expandedCategory } = useTokens();

    // Keep refs to latest values so the message listener doesn't need to re-register
    const overridesRef = useRef(overrides);
    overridesRef.current = overrides;
    const previewModeRef = useRef(previewMode);
    previewModeRef.current = previewMode;
    const onScrollRef = useRef(onScroll);
    onScrollRef.current = onScroll;
    const onContentHeightRef = useRef(onContentHeight);
    onContentHeightRef.current = onContentHeight;

    useImperativeHandle(ref, () => ({
      scrollTo: (scrollTop: number) => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'set-scroll', scrollTop },
          '*'
        );
      },
      postMessage: (message: unknown) => {
        if (iframeRef.current) {
          postToIframe(iframeRef.current, message as Parameters<typeof postToIframe>[1]);
        }
      },
      setScrollMode: (mode: 'internal' | 'external') => {
        if (iframeRef.current) {
          postToIframe(iframeRef.current, { type: 'set-scroll-mode', mode });
        }
      },
    }));

    // Stable message listener — reads latest values from refs
    useEffect(() => {
      function sendInitialState() {
        if (!iframeRef.current) return;
        const css = generateOverrideCSS(overridesRef.current);
        postToIframe(iframeRef.current, { type: 'apply-overrides', css });
        postToIframe(iframeRef.current, { type: 'set-preview-mode', mode: previewModeRef.current });
        // Load any Google Fonts from overrides
        const fontKeys = ['--font-family', '--font-family-heading', '--font-mono',
          '--font-primary-stack', '--font-secondary-stack', '--font-tertiary-stack'];
        for (const key of fontKeys) {
          const rawName = overridesRef.current[key];
          if (!rawName) continue;
          const fontName = rawName.replace(/^["']|["']$/g, '');
          if (GOOGLE_FONTS.some((f) => f.name === fontName)) {
            const url = googleFontUrl(fontName);
            if (url) postToIframe(iframeRef.current, { type: 'load-font', url });
          }
        }
      }

      function handleMessage(event: MessageEvent) {
        if (!isPreviewMessage(event.data)) return;
        if (event.source !== iframeRef.current?.contentWindow) return;

        switch (event.data.type) {
          case 'ready':
            readyRef.current = true;
            sendInitialState();
            break;
          case 'scroll':
            onScrollRef.current?.(event.data.scrollTop);
            break;
          case 'content-height':
            onContentHeightRef.current?.(event.data.height);
            break;
        }
      }

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
        readyRef.current = false;
      };
    }, []); // Stable — never re-registers

    // Send override updates to iframe
    useEffect(() => {
      if (!readyRef.current || !iframeRef.current) return;
      const css = generateOverrideCSS(overrides);
      postToIframe(iframeRef.current, { type: 'apply-overrides', css });
    }, [overrides]);

    // Send preview mode changes
    useEffect(() => {
      if (!readyRef.current || !iframeRef.current) return;
      postToIframe(iframeRef.current, { type: 'set-preview-mode', mode: previewMode });
    }, [previewMode]);

    // Load Google Fonts when font overrides change
    useEffect(() => {
      if (!readyRef.current || !iframeRef.current) return;
      const fontKeys = ['--font-family', '--font-family-heading', '--font-mono',
        '--font-primary-stack', '--font-secondary-stack', '--font-tertiary-stack'];
      for (const key of fontKeys) {
        const rawName = overrides[key];
        if (!rawName) continue;
        const fontName = rawName.replace(/^["']|["']$/g, '');
        if (GOOGLE_FONTS.some((f) => f.name === fontName)) {
          const url = googleFontUrl(fontName);
          if (url) postToIframe(iframeRef.current, { type: 'load-font', url });
        }
      }
    }, [overrides]);

    // Scroll to section when category changes (mode-aware)
    useEffect(() => {
      if (!readyRef.current || !iframeRef.current || !expandedCategory) return;
      const map = previewMode === 'kitchen-sink' ? CATEGORY_KITCHEN_SINK_MAP : CATEGORY_VIGNETTE_MAP;
      const sectionId = (map as Record<string, string>)[expandedCategory];
      if (sectionId) {
        postToIframe(iframeRef.current, { type: 'scroll-to-vignette', vignette: sectionId });
      }
    }, [expandedCategory, previewMode]);

    return (
      <iframe
        ref={iframeRef}
        src={`/preview.html?scheme=${colorScheme}`}
        className={className}
        style={{ width: '100%', height: '100%', border: 'none', ...style }}
        title={`Preview (${colorScheme})`}
      />
    );
  }
);
