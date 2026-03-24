import type { OverridesMap } from '@/lib/tokens/types';
import { generateOverrideCSS } from '@/lib/preview/css-generator';
import { GOOGLE_FONTS, googleFontImport } from '@/lib/google-fonts';

/**
 * Generate a downloadable CSS file with overrides and any required @imports.
 */
export function exportCSS(overrides: OverridesMap): string {
  const parts: string[] = [];

  // Check if any Google Fonts are referenced in overrides
  const fontKeys = ['--font-family', '--font-family-heading', '--font-primary-stack', '--font-secondary-stack', '--font-tertiary-stack'];
  const usedGoogleFonts = new Set<string>();

  for (const key of fontKeys) {
    const value = overrides[key];
    if (!value) continue;
    for (const font of GOOGLE_FONTS) {
      if (value.includes(font.name)) {
        usedGoogleFonts.add(font.name);
      }
    }
  }

  if (usedGoogleFonts.size > 0) {
    for (const fontName of usedGoogleFonts) {
      parts.push(googleFontImport(fontName));
    }
    parts.push('');
  }

  parts.push(generateOverrideCSS(overrides));

  return parts.join('\n');
}

/**
 * Trigger a file download in the browser.
 */
export function downloadCSS(overrides: OverridesMap, filename = 'rek-room-overrides.css'): void {
  const css = exportCSS(overrides);
  const blob = new Blob([css], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
