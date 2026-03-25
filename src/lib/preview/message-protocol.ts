/**
 * Message types for communication between editor and preview iframes.
 */

export type EditorToPreviewMessage =
  | { type: 'apply-overrides'; css: string }
  | { type: 'set-preview-mode'; mode: 'vignettes' | 'kitchen-sink' }
  | { type: 'scroll-to-vignette'; vignette: string }
  | { type: 'set-scroll-mode'; mode: 'internal' | 'external' }
  | { type: 'load-font'; url: string };

export type PreviewToEditorMessage =
  | { type: 'scroll'; scrollTop: number }
  | { type: 'content-height'; height: number }
  | { type: 'ready' };

export function postToIframe(iframe: HTMLIFrameElement, message: EditorToPreviewMessage): void {
  iframe.contentWindow?.postMessage(message, '*');
}

export function isPreviewMessage(data: unknown): data is PreviewToEditorMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as { type: string }).type in { scroll: true, ready: true, 'content-height': true }
  );
}
