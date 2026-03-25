/**
 * generate-registry.ts
 *
 * Build-time script that reads rek-room's core.css, extracts all CSS custom
 * property declarations from :root {}, merges them with TOKEN_METADATA, and
 * writes two auto-generated files:
 *   - src/lib/tokens/registry.ts
 *   - src/lib/tokens/defaults.ts
 *
 * Run via: npm run generate:registry
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ── Paths ──────────────────────────────────────────────────────────────────

const CSS_INPUT = resolve(ROOT, 'node_modules/rek-room/app/css/tokens/core.css');
const REGISTRY_OUTPUT = resolve(ROOT, 'src/lib/tokens/registry.ts');
const DEFAULTS_OUTPUT = resolve(ROOT, 'src/lib/tokens/defaults.ts');

// ── Tokens to skip (composite shorthands) ──────────────────────────────────

const SKIP_TOKENS = new Set(['--border', '--focus-outline', '--button-font-weight', '--button-font-size']);

// ── CSS Parsing ────────────────────────────────────────────────────────────

/**
 * Extract the :root { ... } block from CSS source, then parse all
 * --custom-property: value; declarations within it.
 *
 * Values may be complex (multi-line, nested parens), so we track
 * parenthesis depth character-by-character rather than using a simple regex.
 */
function parseRootDeclarations(css: string): Map<string, string> {
  const declarations = new Map<string, string>();

  // Strip block comments (/* ... */) before searching for :root so we don't
  // match :root examples inside comment blocks.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));

  // Find the :root { ... } block (in comment-stripped source)
  const rootMatch = stripped.match(/:root\s*\{/);
  if (!rootMatch || rootMatch.index === undefined) {
    throw new Error('Could not find :root { } block in CSS');
  }

  const blockStart = rootMatch.index + rootMatch[0].length;
  let depth = 1;
  let i = blockStart;

  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }

  const rootBlock = css.slice(blockStart, i - 1);

  // Parse declarations within the :root block character-by-character
  let pos = 0;

  while (pos < rootBlock.length) {
    // Skip whitespace and comments
    pos = skipWhitespaceAndComments(rootBlock, pos);
    if (pos >= rootBlock.length) break;

    // Check if this looks like a custom property declaration
    if (rootBlock[pos] !== '-' || rootBlock[pos + 1] !== '-') {
      // Skip to next semicolon or opening brace (for nested at-rules, etc.)
      while (pos < rootBlock.length && rootBlock[pos] !== ';') {
        pos++;
      }
      pos++; // skip the semicolon
      continue;
    }

    // Extract property name (up to the colon)
    const nameStart = pos;
    while (pos < rootBlock.length && rootBlock[pos] !== ':' && rootBlock[pos] !== '\n') {
      pos++;
    }
    if (pos >= rootBlock.length || rootBlock[pos] !== ':') {
      pos++;
      continue;
    }

    const propertyName = rootBlock.slice(nameStart, pos).trim();
    pos++; // skip the colon

    // Skip whitespace after colon
    while (pos < rootBlock.length && (rootBlock[pos] === ' ' || rootBlock[pos] === '\t')) {
      pos++;
    }

    // Extract value — track parenthesis depth to handle nested functions
    const valueStart = pos;
    let parenDepth = 0;
    let inString = false;
    let stringChar = '';

    while (pos < rootBlock.length) {
      const ch = rootBlock[pos];

      if (inString) {
        if (ch === stringChar && rootBlock[pos - 1] !== '\\') {
          inString = false;
        }
      } else if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
      } else if (ch === '(') {
        parenDepth++;
      } else if (ch === ')') {
        parenDepth--;
      } else if (ch === ';' && parenDepth === 0) {
        break;
      }

      pos++;
    }

    const rawValue = rootBlock.slice(valueStart, pos).trim();
    pos++; // skip the semicolon

    // Normalize whitespace in the value (collapse runs of whitespace/newlines)
    const value = rawValue.replace(/\s+/g, ' ').trim();

    if (propertyName.startsWith('--') && value.length > 0) {
      declarations.set(propertyName, value);
    }
  }

  return declarations;
}

function skipWhitespaceAndComments(src: string, pos: number): number {
  while (pos < src.length) {
    // Skip whitespace
    if (/\s/.test(src[pos])) {
      pos++;
      continue;
    }
    // Skip /* ... */ comments
    if (src[pos] === '/' && src[pos + 1] === '*') {
      const end = src.indexOf('*/', pos + 2);
      if (end === -1) {
        pos = src.length;
      } else {
        pos = end + 2;
      }
      continue;
    }
    break;
  }
  return pos;
}

// ── Load metadata ──────────────────────────────────────────────────────────

// We import the metadata at runtime. Since this runs via tsx (ESM), dynamic
// import works, but we need to use a relative path that tsx can resolve.
// We'll use a synchronous workaround by requiring the compiled form via tsx.

// Actually, since tsx supports top-level await in scripts we use a main() fn.

async function main() {
  console.log('Reading CSS from:', CSS_INPUT);
  const cssSource = readFileSync(CSS_INPUT, 'utf-8');

  console.log('Parsing :root declarations...');
  const cssValues = parseRootDeclarations(cssSource);
  console.log(`  Found ${cssValues.size} raw declarations in CSS`);

  // Dynamic import of metadata (works in ESM/tsx context)
  const { TOKEN_METADATA } = await import('../src/lib/tokens/metadata.js');

  // ── Build merged token list ──────────────────────────────────────────────

  const warnings: string[] = [];
  const registry: Array<{
    key: string;
    label: string;
    type: string;
    category: string;
    defaultValue: string;
    lightDark?: boolean;
    derivedFrom?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    gradient?: boolean;
    hidden?: boolean;
    subcategory?: string;
  }> = [];

  const defaults: Record<string, string> = {};

  // Process all CSS declarations that have metadata entries
  for (const [prop, value] of cssValues) {
    if (SKIP_TOKENS.has(prop)) {
      console.log(`  Skipping composite token: ${prop}`);
      continue;
    }

    const meta = TOKEN_METADATA[prop];
    if (!meta) {
      warnings.push(`No metadata for CSS token: ${prop}`);
      continue;
    }

    const entry: typeof registry[0] = {
      key: prop,
      label: meta.label,
      type: meta.type,
      category: meta.category,
      defaultValue: value,
    };

    if (meta.lightDark !== undefined) entry.lightDark = meta.lightDark;
    if (meta.derivedFrom !== undefined) entry.derivedFrom = meta.derivedFrom;
    if (meta.min !== undefined) entry.min = meta.min;
    if (meta.max !== undefined) entry.max = meta.max;
    if (meta.step !== undefined) entry.step = meta.step;
    if (meta.unit !== undefined) entry.unit = meta.unit;
    if (meta.gradient !== undefined) entry.gradient = meta.gradient;
    if (meta.hidden !== undefined) entry.hidden = meta.hidden;
    if (meta.subcategory !== undefined) entry.subcategory = meta.subcategory;

    registry.push(entry);
    defaults[prop] = value;
  }

  // Warn about metadata entries that have no CSS counterpart
  for (const prop of Object.keys(TOKEN_METADATA)) {
    if (!cssValues.has(prop) && !SKIP_TOKENS.has(prop)) {
      warnings.push(`Metadata entry has no CSS value: ${prop}`);
    }
  }

  // ── Sort registry by category then by key ──────────────────────────────

  const CATEGORY_ORDER = ['colors', 'typography', 'spacing', 'animation', 'borders', 'elevation', 'controls'];
  registry.sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category);
    const catB = CATEGORY_ORDER.indexOf(b.category);
    if (catA !== catB) return catA - catB;
    return a.key.localeCompare(b.key);
  });

  // ── Write registry.ts ──────────────────────────────────────────────────

  const registryLines = registry.map((entry) => {
    const fields: string[] = [
      `    key: ${JSON.stringify(entry.key)}`,
      `    label: ${JSON.stringify(entry.label)}`,
      `    type: ${JSON.stringify(entry.type)}`,
      `    category: ${JSON.stringify(entry.category)}`,
      `    defaultValue: ${JSON.stringify(entry.defaultValue)}`,
    ];

    if (entry.lightDark !== undefined) fields.push(`    lightDark: ${entry.lightDark}`);
    if (entry.gradient !== undefined) fields.push(`    gradient: ${entry.gradient}`);
    if (entry.hidden !== undefined) fields.push(`    hidden: ${entry.hidden}`);
    if (entry.subcategory !== undefined) fields.push(`    subcategory: ${JSON.stringify(entry.subcategory)}`);
    if (entry.derivedFrom !== undefined) fields.push(`    derivedFrom: ${JSON.stringify(entry.derivedFrom)}`);
    if (entry.min !== undefined) fields.push(`    min: ${entry.min}`);
    if (entry.max !== undefined) fields.push(`    max: ${entry.max}`);
    if (entry.step !== undefined) fields.push(`    step: ${entry.step}`);
    if (entry.unit !== undefined) fields.push(`    unit: ${JSON.stringify(entry.unit)}`);

    return `  {\n${fields.join(',\n')},\n  }`;
  });

  const registryContent = `// AUTO-GENERATED — DO NOT EDIT
// Run \`npm run generate:registry\` to regenerate this file.

import type { TokenDefinition } from './types';

export const TOKEN_REGISTRY: TokenDefinition[] = [
${registryLines.join(',\n')},
];

export const TOKEN_REGISTRY_MAP: Record<string, TokenDefinition> = Object.fromEntries(
  TOKEN_REGISTRY.map((token) => [token.key, token])
);
`;

  writeFileSync(REGISTRY_OUTPUT, registryContent, 'utf-8');
  console.log(`\nWrote registry.ts with ${registry.length} tokens`);

  // ── Write defaults.ts ──────────────────────────────────────────────────

  const defaultsLines = Object.entries(defaults).map(
    ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`
  );

  const defaultsContent = `// AUTO-GENERATED — DO NOT EDIT
// Run \`npm run generate:registry\` to regenerate this file.

export const TOKEN_DEFAULTS: Record<string, string> = {
${defaultsLines.join(',\n')},
};
`;

  writeFileSync(DEFAULTS_OUTPUT, defaultsContent, 'utf-8');
  console.log(`Wrote defaults.ts with ${Object.keys(defaults).length} entries`);

  // ── Report warnings ────────────────────────────────────────────────────

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) {
      console.warn(`  ⚠  ${w}`);
    }
  } else {
    console.log('\nNo warnings — all tokens matched.');
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
