/**
 * Bundle rek-room's source CSS into a single file by inlining @import statements.
 * Preserves light-dark(), @layer, and all modern CSS features.
 * The compiled dist CSS resolves light-dark() token values to light-mode only,
 * so we need the unprocessed source for the preview iframes.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = resolve(__dirname, '../../rek-room/app/css');
const OUTPUT = resolve(__dirname, '../public/rek-room-source.css');

function inlineImports(filePath: string, depth = 0): string {
  if (depth > 5) throw new Error(`Too many nested imports at ${filePath}`);

  const content = readFileSync(filePath, 'utf-8');
  const dir = dirname(filePath);

  return content.replace(
    /@import\s+["']([^"']+)["']\s*(layer\([^)]+\))?\s*;/g,
    (_match, importPath, layer) => {
      const fullPath = resolve(dir, importPath);
      const imported = inlineImports(fullPath, depth + 1);
      if (layer) {
        return `@layer ${layer.replace('layer(', '').replace(')', '')} {\n${imported}\n}`;
      }
      return imported;
    }
  );
}

try {
  const entryPoint = join(SOURCE_DIR, 'style.css');
  const bundled = inlineImports(entryPoint);
  writeFileSync(OUTPUT, bundled, 'utf-8');
  console.log(`✓ Bundled rek-room source CSS → public/rek-room-source.css (${(bundled.length / 1024).toFixed(1)}KB)`);
} catch (err) {
  console.error('Failed to bundle rek-room source CSS:', err);
  process.exit(1);
}
