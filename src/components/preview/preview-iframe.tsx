'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTokens } from '@/lib/state/token-context';
import { generateOverrideCSS } from '@/lib/preview/css-generator';
import { postToIframe, isPreviewMessage } from '@/lib/preview/message-protocol';
import type { EditorToPreviewMessage } from '@/lib/preview/message-protocol';
import { CATEGORY_KITCHEN_SINK_MAP } from '@/lib/tokens/types';
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
    const queueRef = useRef<EditorToPreviewMessage[]>([]);
    const { overrides, expandedCategory } = useTokens();

    // Keep refs to latest values so the message listener doesn't need to re-register
    const overridesRef = useRef(overrides);
    overridesRef.current = overrides;
    const onScrollRef = useRef(onScroll);
    onScrollRef.current = onScroll;
    const onContentHeightRef = useRef(onContentHeight);
    onContentHeightRef.current = onContentHeight;

    /** Send a message to the iframe, queuing it if the iframe isn't ready yet */
    function sendToIframe(message: EditorToPreviewMessage) {
      if (readyRef.current && iframeRef.current) {
        postToIframe(iframeRef.current, message);
      } else {
        queueRef.current.push(message);
      }
    }

    useImperativeHandle(ref, () => ({
      scrollTo: (scrollTop: number) => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'set-scroll', scrollTop },
          '*'
        );
      },
      postMessage: (message: unknown) => {
        sendToIframe(message as EditorToPreviewMessage);
      },
      setScrollMode: (mode: 'internal' | 'external') => {
        sendToIframe({ type: 'set-scroll-mode', mode });
      },
    }));

    // Stable message listener — reads latest values from refs
    useEffect(() => {
      function sendInitialState() {
        if (!iframeRef.current) return;
        const css = generateOverrideCSS(overridesRef.current);
        postToIframe(iframeRef.current, { type: 'apply-overrides', css });
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
            queueRef.current = []; // Clear stale queued messages
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
        queueRef.current = [];
      };
    }, []); // Stable — never re-registers

    // Send override updates to iframe
    useEffect(() => {
      const css = generateOverrideCSS(overrides);
      sendToIframe({ type: 'apply-overrides', css });
    }, [overrides]);

    // Load Google Fonts when font overrides change
    useEffect(() => {
      const fontKeys = ['--font-family', '--font-family-heading', '--font-mono',
        '--font-primary-stack', '--font-secondary-stack', '--font-tertiary-stack'];
      for (const key of fontKeys) {
        const rawName = overrides[key];
        if (!rawName) continue;
        const fontName = rawName.replace(/^["']|["']$/g, '');
        if (GOOGLE_FONTS.some((f) => f.name === fontName)) {
          const url = googleFontUrl(fontName);
          if (url) sendToIframe({ type: 'load-font', url });
        }
      }
    }, [overrides]);

    // Scroll to section when category changes
    useEffect(() => {
      if (!expandedCategory) return;
      const sectionId = (CATEGORY_KITCHEN_SINK_MAP as Record<string, string>)[expandedCategory];
      if (sectionId) {
        sendToIframe({ type: 'scroll-to-vignette', vignette: sectionId });
      }
    }, [expandedCategory]);

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
