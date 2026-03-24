/**
 * Curated Google Fonts list and dynamic loading helper.
 */

export type FontEntry = {
  name: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';
  weights: number[];
};

// Curated list — popular, high-quality fonts
export const GOOGLE_FONTS: FontEntry[] = [
  { name: 'Inter', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Roboto', category: 'sans-serif', weights: [100, 300, 400, 500, 700, 900] },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Lato', category: 'sans-serif', weights: [100, 300, 400, 700, 900] },
  { name: 'Montserrat', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Source Sans 3', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Nunito', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Raleway', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'DM Sans', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800] },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Source Serif 4', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { name: 'JetBrains Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800] },
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { name: 'IBM Plex Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700] },
];

/**
 * Generate a Google Fonts <link> URL for a given font.
 */
export function googleFontUrl(fontName: string): string {
  const font = GOOGLE_FONTS.find((f) => f.name === fontName);
  if (!font) return '';
  const family = fontName.replace(/\s+/g, '+');
  const weights = font.weights.join(';');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

/**
 * Generate @import statement for CSS export.
 */
export function googleFontImport(fontName: string): string {
  const url = googleFontUrl(fontName);
  if (!url) return '';
  return `@import url('${url}');`;
}
