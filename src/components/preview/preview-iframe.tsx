'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTokens } from '@/lib/state/token-context';
import { generateOverrideCSS } from '@/lib/preview/css-generator';
import { postToIframe, isPreviewMessage } from '@/lib/preview/message-protocol';
import { CATEGORY_VIGNETTE_MAP } from '@/lib/tokens/types';

export type PreviewIframeHandle = {
  scrollTo: (scrollTop: number) => void;
  postMessage: (message: unknown) => void;
};

type PreviewIframeProps = {
  colorScheme: 'light' | 'dark';
  onScroll?: (scrollTop: number) => void;
  className?: string;
};

export const PreviewIframe = forwardRef<PreviewIframeHandle, PreviewIframeProps>(
  function PreviewIframe({ colorScheme, onScroll, className }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const readyRef = useRef(false);
    const { overrides, previewMode, expandedCategory } = useTokens();

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
    }));

    // Listen for messages from iframe
    useEffect(() => {
      function handleMessage(event: MessageEvent) {
        if (!isPreviewMessage(event.data)) return;
        if (event.source !== iframeRef.current?.contentWindow) return;

        switch (event.data.type) {
          case 'ready':
            readyRef.current = true;
            // Send initial state
            if (iframeRef.current) {
              const css = generateOverrideCSS(overrides);
              postToIframe(iframeRef.current, { type: 'apply-overrides', css });
              postToIframe(iframeRef.current, { type: 'set-preview-mode', mode: previewMode });
            }
            break;
          case 'scroll':
            onScroll?.(event.data.scrollTop);
            break;
        }
      }

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [overrides, previewMode, onScroll]);

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

    // Scroll to vignette when category changes
    useEffect(() => {
      if (!readyRef.current || !iframeRef.current || !expandedCategory) return;
      const vignette = (CATEGORY_VIGNETTE_MAP as Record<string, string>)[expandedCategory];
      if (vignette) {
        postToIframe(iframeRef.current, { type: 'scroll-to-vignette', vignette });
      }
    }, [expandedCategory]);

    return (
      <iframe
        ref={iframeRef}
        src={`/preview.html?scheme=${colorScheme}`}
        className={className}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title={`Preview (${colorScheme})`}
      />
    );
  }
);
