# Combobulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js app for visually editing rek-room's CSS custom properties with live light/dark split preview and CSS export.

**Architecture:** A Next.js App Router app with a right-side control panel (Shadcn/ui accordion groups) and a left-side preview area (two iframes rendering rek-room-styled HTML). State lives in React context as a sparse overrides map, persisted to localStorage, with undo/redo via snapshot history. A build-time script auto-generates the token registry from rek-room's source CSS.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, react-colorful, cmdk, rek-room (npm dependency)

**Spec:** `docs/superpowers/specs/2026-03-23-rek-room-editor-design.md`

---

## File Structure

```
combobulator/
├── app/
│   ├── layout.tsx                    # Root layout, font loading, metadata
│   ├── page.tsx                      # Main editor page — assembles PreviewArea + ControlPanel
│   └── globals.css                   # Tailwind directives + editor-specific global styles
├── components/
│   ├── preview/
│   │   ├── preview-area.tsx          # Top bar (tabs, mode toggle) + iframe container
│   │   ├── preview-iframe.tsx        # Single iframe wrapper — handles postMessage send/receive
│   │   └── preview-content.html      # Static HTML loaded in iframes — vignettes + kitchen sink
│   ├── panel/
│   │   ├── control-panel.tsx         # Right panel shell — header, accordion, export/reset
│   │   ├── token-group.tsx           # Single accordion group — renders controls for a category
│   │   ├── derived-tokens.tsx        # "Derives →" read-only section with override links
│   │   └── type-scale-toggle.tsx     # Ratio vs. individual heading sizes toggle
│   ├── controls/
│   │   ├── color-control.tsx         # Color swatch + react-colorful popover + hex input
│   │   ├── color-pair-control.tsx    # Light/dark paired color control with contrast dots
│   │   ├── dimension-control.tsx     # Slider + number input (spacing, border-width, radius)
│   │   ├── ratio-control.tsx         # Slider + number input for type ratio
│   │   ├── font-control.tsx          # Searchable combobox (cmdk) for Google Fonts + custom
│   │   ├── weight-control.tsx        # Select dropdown for font weights
│   │   ├── duration-control.tsx      # Slider + number input + animation dot preview
│   │   ├── easing-control.tsx        # Select dropdown + bezier curve SVG preview
│   │   ├── shadow-control.tsx        # Preview swatch + popover with x/y/blur/spread sliders
│   │   ├── border-style-control.tsx  # Select dropdown with inline style previews
│   │   └── gradient-builder.tsx      # Direction control + color stop editor
│   ├── contrast-dot.tsx              # WCAG contrast ratio dot with tooltip
│   ├── change-indicator.tsx          # Purple dot + reset button for modified tokens
│   └── ui/                           # Shadcn/ui components (installed via CLI)
├── lib/
│   ├── tokens/
│   │   ├── registry.ts               # Auto-generated token definitions (DO NOT EDIT)
│   │   ├── metadata.ts               # Hand-maintained metadata (labels, categories, ranges)
│   │   ├── types.ts                  # TokenDefinition, TokenType, TokenCategory types
│   │   └── defaults.ts               # Default value lookup map
│   ├── state/
│   │   ├── token-context.tsx         # React context — overrides map + dispatch actions
│   │   ├── history.ts                # Undo/redo snapshot array logic
│   │   └── persistence.ts           # localStorage save/load helpers
│   ├── preview/
│   │   ├── message-protocol.ts       # postMessage types and helpers (editor↔iframe)
│   │   └── css-generator.ts          # Convert overrides map → :root {} CSS string
│   ├── export/
│   │   └── export-css.ts             # Generate downloadable CSS file with comments + @imports
│   ├── contrast.ts                   # WCAG relative luminance + contrast ratio calculation
│   └── google-fonts.ts               # Curated font list + dynamic <link> injection
├── scripts/
│   └── generate-registry.ts          # Build-time: parse rek-room CSS → registry.ts
├── public/
│   └── rek-room.css                  # Compiled rek-room CSS (copied at build time)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── components.json                   # Shadcn/ui config
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components.json`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd ~/ActiveTheory/personal-playground
npx create-next-app@latest combobulator --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

Accept defaults. This creates the base Next.js + Tailwind + TypeScript project.

- [ ] **Step 2: Install dependencies**

```bash
cd ~/ActiveTheory/personal-playground/combobulator
npm install rek-room react-colorful cmdk
```

- [ ] **Step 3: Initialize Shadcn/ui**

```bash
npx shadcn@latest init
```

Select defaults: New York style, Zinc base color, CSS variables.

- [ ] **Step 4: Install required Shadcn components**

```bash
npx shadcn@latest add accordion slider select popover tooltip alert-dialog command switch tabs toggle-group input
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: App loads at `http://localhost:3000` with Next.js default page.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with Shadcn/ui and dependencies"
```

---

## Task 2: Token Type System

**Files:**
- Create: `lib/tokens/types.ts`

- [ ] **Step 1: Create the token type definitions**

Create `lib/tokens/types.ts`:

```typescript
export type TokenType =
  | 'color'
  | 'dimension'
  | 'ratio'
  | 'font'
  | 'weight'
  | 'duration'
  | 'easing'
  | 'shadow'
  | 'border-style';

export type TokenCategory =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'borders'
  | 'elevation'
  | 'animation'
  | 'controls';

export type TokenDefinition = {
  key: string;
  label: string;
  type: TokenType;
  category: TokenCategory;
  defaultValue: string;
  lightDark?: boolean;
  derivedFrom?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  gradient?: boolean; // Whether this token supports gradient values
};

export type OverridesMap = Record<string, string>;

export type PreviewMode = 'vignettes' | 'kitchen-sink';

export type ColorSchemeMode = 'light' | 'dark' | 'both';

// Category-to-vignette scroll mapping
export const CATEGORY_VIGNETTE_MAP: Record<TokenCategory, string> = {
  colors: 'typography',
  typography: 'typography',
  spacing: 'forms',
  borders: 'forms',
  elevation: 'dialog',
  animation: 'dialog',
  controls: 'buttons',
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/tokens/types.ts
git commit -m "feat: add token type definitions"
```

---

## Task 3: Registry Generator Script

**Files:**
- Create: `scripts/generate-registry.ts`, `lib/tokens/metadata.ts`, `lib/tokens/registry.ts`, `lib/tokens/defaults.ts`

- [ ] **Step 1: Create the metadata config file**

Create `lib/tokens/metadata.ts`. This is the hand-maintained mapping that enriches auto-extracted tokens with UI metadata. Include all tokens from the spec, organized by category. Each entry maps a CSS custom property key to its label, type, category, and optional slider ranges, derivedFrom, lightDark, and gradient flags.

Key entries to include:

```typescript
import { TokenDefinition } from './types';

// Hand-maintained metadata for tokens extracted from rek-room.
// Keys match CSS custom property names from tokens/core.css.
// The generate-registry script merges these with extracted default values.
export const TOKEN_METADATA: Record<string, Omit<TokenDefinition, 'key' | 'defaultValue'>> = {
  // === COLORS: Palette ===
  '--color-primary': { label: 'Primary', type: 'color', category: 'colors' },
  '--color-primary-light': { label: 'Primary Light', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-primary-dark': { label: 'Primary Dark', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-primary-contrast': { label: 'Primary Contrast', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-secondary': { label: 'Secondary', type: 'color', category: 'colors' },
  // ... (continue for all secondary/tertiary variants)
  '--color-tertiary': { label: 'Tertiary', type: 'color', category: 'colors' },
  // ... (continue for all tertiary variants)

  // === COLORS: Neutrals ===
  '--color-neutral-0': { label: 'Neutral 0', type: 'color', category: 'colors' },
  // ... through --color-neutral-10
  '--color-black': { label: 'Black', type: 'color', category: 'colors' },
  '--color-white': { label: 'White', type: 'color', category: 'colors' },

  // === COLORS: Semantic (L/D) ===
  '--color-surface': { label: 'Surface', type: 'color', category: 'colors', lightDark: true, gradient: true },
  '--color-surface-raised': { label: 'Surface Raised', type: 'color', category: 'colors', lightDark: true, gradient: true },
  '--color-text-primary': { label: 'Text Primary', type: 'color', category: 'colors', lightDark: true },
  '--color-text-secondary': { label: 'Text Secondary', type: 'color', category: 'colors', lightDark: true },
  '--color-text-tertiary': { label: 'Text Tertiary', type: 'color', category: 'colors', lightDark: true },
  '--color-text-body': { label: 'Text Body', type: 'color', category: 'colors', lightDark: true },
  '--color-border': { label: 'Border', type: 'color', category: 'colors', lightDark: true },
  '--color-viewport-background': { label: 'Viewport BG', type: 'color', category: 'colors', lightDark: true, gradient: true },

  // === COLORS: Role (derived) ===
  '--color-action': { label: 'Action', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-action-light': { label: 'Action Light', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-action-dark': { label: 'Action Dark', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-highlight': { label: 'Highlight', type: 'color', category: 'colors', derivedFrom: '--color-secondary' },
  // ... (continue for highlight variants)

  // === COLORS: Status ===
  '--color-success': { label: 'Success', type: 'color', category: 'colors' },
  '--color-warning': { label: 'Warning', type: 'color', category: 'colors' },
  '--color-error': { label: 'Error', type: 'color', category: 'colors' },
  // ... (continue for status variants)

  // === TYPOGRAPHY ===
  '--font-primary-stack': { label: 'Primary Stack', type: 'font', category: 'typography' },
  '--font-secondary-stack': { label: 'Secondary Stack', type: 'font', category: 'typography' },
  '--font-tertiary-stack': { label: 'Tertiary Stack', type: 'font', category: 'typography' },
  '--font-family': { label: 'Body Font', type: 'font', category: 'typography' },
  '--font-family-heading': { label: 'Heading Font', type: 'font', category: 'typography' },
  '--type-ratio': { label: 'Type Ratio', type: 'ratio', category: 'typography', min: 1.1, max: 1.618, step: 0.001 },
  '--font-size-base': { label: 'Base Size', type: 'dimension', category: 'typography', min: 12, max: 24, step: 1, unit: 'px' },
  '--font-weight-thin': { label: 'Thin', type: 'weight', category: 'typography' },
  // ... (continue for all weights)
  '--font-weight-heading': { label: 'Heading Weight', type: 'weight', category: 'typography' },
  '--font-size-h1': { label: 'H1', type: 'dimension', category: 'typography', min: 16, max: 96, step: 1, unit: 'px' },
  // ... (continue for h2-h6, display, body sizes)
  '--line-height-reset': { label: 'Reset', type: 'dimension', category: 'typography', min: 0.8, max: 2, step: 0.05 },
  '--line-height-text': { label: 'Text', type: 'dimension', category: 'typography', min: 1, max: 2.5, step: 0.05 },
  '--line-height-heading': { label: 'Heading', type: 'dimension', category: 'typography', min: 0.8, max: 2, step: 0.05 },

  // === SPACING ===
  '--spacing-base': { label: 'Base', type: 'dimension', category: 'spacing', min: 4, max: 32, step: 1, unit: 'px' },
  '--spacing-xs': { label: 'XS', type: 'dimension', category: 'spacing', min: 2, max: 16, step: 1, unit: 'px' },
  '--spacing-sm': { label: 'SM', type: 'dimension', category: 'spacing', min: 4, max: 24, step: 1, unit: 'px' },
  '--spacing-md': { label: 'MD', type: 'dimension', category: 'spacing', min: 8, max: 48, step: 1, unit: 'px' },
  '--spacing-lg': { label: 'LG', type: 'dimension', category: 'spacing', min: 16, max: 64, step: 1, unit: 'px' },
  '--spacing-xl': { label: 'XL', type: 'dimension', category: 'spacing', min: 24, max: 96, step: 1, unit: 'px' },

  // === BORDERS ===
  '--border-width': { label: 'Width', type: 'dimension', category: 'borders', min: 0, max: 8, step: 1, unit: 'px' },
  '--border-style': { label: 'Style', type: 'border-style', category: 'borders' },
  '--border-color': { label: 'Color', type: 'color', category: 'borders' },
  '--border-radius': { label: 'Radius', type: 'dimension', category: 'borders', min: 0, max: 24, step: 1, unit: 'px' },
  '--focus-outline-width': { label: 'Focus Width', type: 'dimension', category: 'borders', min: 1, max: 6, step: 1, unit: 'px' },
  '--focus-outline-offset': { label: 'Focus Offset', type: 'dimension', category: 'borders', min: 0, max: 8, step: 1, unit: 'px' },

  // === ELEVATION ===
  '--elevation-1': { label: 'Level 1', type: 'shadow', category: 'elevation' },
  '--elevation-2': { label: 'Level 2', type: 'shadow', category: 'elevation' },
  '--elevation-3': { label: 'Level 3', type: 'shadow', category: 'elevation' },
  '--elevation-4': { label: 'Level 4', type: 'shadow', category: 'elevation' },
  '--elevation-5': { label: 'Level 5', type: 'shadow', category: 'elevation' },

  // === ANIMATION ===
  '--animation-duration': { label: 'Duration', type: 'duration', category: 'animation', min: 0.05, max: 2, step: 0.05, unit: 's' },
  '--animation-duration-slow': { label: 'Slow', type: 'duration', category: 'animation', min: 0.1, max: 4, step: 0.05, unit: 's' },
  '--animation-duration-fast': { label: 'Fast', type: 'duration', category: 'animation', min: 0.01, max: 1, step: 0.01, unit: 's' },
  '--animation-timing': { label: 'Timing', type: 'easing', category: 'animation' },
  // All named easings
  '--linear': { label: 'Linear', type: 'easing', category: 'animation' },
  '--ease': { label: 'Ease', type: 'easing', category: 'animation' },
  '--ease-in': { label: 'Ease In', type: 'easing', category: 'animation' },
  '--ease-out': { label: 'Ease Out', type: 'easing', category: 'animation' },
  '--ease-in-out': { label: 'Ease In Out', type: 'easing', category: 'animation' },
  // ... (continue for sine, quad, cubic, quart, quint, expo, circ, back variants)

  // === CONTROLS ===
  '--control-block-size': { label: 'Height', type: 'dimension', category: 'controls', min: 24, max: 64, step: 1, unit: 'px' },
  '--control-block-size-sm': { label: 'Height SM', type: 'dimension', category: 'controls', min: 20, max: 48, step: 1, unit: 'px' },
  '--control-block-size-lg': { label: 'Height LG', type: 'dimension', category: 'controls', min: 32, max: 72, step: 1, unit: 'px' },
  '--control-font-size': { label: 'Font Size', type: 'dimension', category: 'controls', min: 10, max: 20, step: 1, unit: 'px' },
  '--control-font-weight': { label: 'Font Weight', type: 'weight', category: 'controls' },
  '--control-padding-inline': { label: 'Padding', type: 'dimension', category: 'controls', min: 4, max: 32, step: 1, unit: 'px' },
  '--control-padding-inline-sm': { label: 'Padding SM', type: 'dimension', category: 'controls', min: 2, max: 24, step: 1, unit: 'px' },
  '--control-padding-inline-lg': { label: 'Padding LG', type: 'dimension', category: 'controls', min: 8, max: 48, step: 1, unit: 'px' },
  '--scrollbar-width': { label: 'Scrollbar', type: 'dimension', category: 'controls', min: 2, max: 16, step: 1, unit: 'px' },
};
```

Note: The `// ...` comments indicate where the implementer should fill in the remaining entries following the established pattern. Every token from the spec's "Token Categories & Their Contents" section must have an entry.

- [ ] **Step 2: Create the registry generator script**

Create `scripts/generate-registry.ts`:

```typescript
/**
 * Build-time script: parses rek-room's tokens/core.css to extract
 * CSS custom property declarations and their default values.
 * Merges with hand-maintained metadata to produce the full registry.
 *
 * Run: npx tsx scripts/generate-registry.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { TOKEN_METADATA } from '../lib/tokens/metadata';

const CORE_CSS_PATH = resolve(__dirname, '../node_modules/rek-room/app/css/tokens/core.css');
const OUTPUT_PATH = resolve(__dirname, '../lib/tokens/registry.ts');
const DEFAULTS_PATH = resolve(__dirname, '../lib/tokens/defaults.ts');

// Parse CSS custom property declarations from :root
function extractCustomProperties(css: string): Record<string, string> {
  const props: Record<string, string> = {};
  // Match --property-name: value; declarations
  // Handles multi-line values (e.g., box-shadow with light-dark())
  const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const key = `--${match[1]}`;
    const value = match[2].trim();
    props[key] = value;
  }
  return props;
}

function main() {
  const css = readFileSync(CORE_CSS_PATH, 'utf-8');
  const extracted = extractCustomProperties(css);

  // Build registry entries by merging extracted defaults with metadata
  const entries: string[] = [];
  const defaults: string[] = [];

  for (const [key, meta] of Object.entries(TOKEN_METADATA)) {
    const defaultValue = extracted[key];
    if (!defaultValue) {
      console.warn(`⚠ Token "${key}" has metadata but was not found in core.css`);
      continue;
    }

    entries.push(`  {
    key: ${JSON.stringify(key)},
    label: ${JSON.stringify(meta.label)},
    type: ${JSON.stringify(meta.type)},
    category: ${JSON.stringify(meta.category)},
    defaultValue: ${JSON.stringify(defaultValue)},${meta.lightDark ? `\n    lightDark: true,` : ''}${meta.derivedFrom ? `\n    derivedFrom: ${JSON.stringify(meta.derivedFrom)},` : ''}${meta.min !== undefined ? `\n    min: ${meta.min},` : ''}${meta.max !== undefined ? `\n    max: ${meta.max},` : ''}${meta.step !== undefined ? `\n    step: ${meta.step},` : ''}${meta.unit ? `\n    unit: ${JSON.stringify(meta.unit)},` : ''}${meta.gradient ? `\n    gradient: true,` : ''}
  }`);

    defaults.push(`  ${JSON.stringify(key)}: ${JSON.stringify(defaultValue)}`);
  }

  // Check for tokens in CSS that have no metadata
  for (const key of Object.keys(extracted)) {
    if (key.startsWith('--') && !TOKEN_METADATA[key]) {
      // Skip @property declarations, internal vars, etc.
      if (!key.startsWith('--_')) {
        console.info(`ℹ Token "${key}" found in CSS but has no metadata (skipped)`);
      }
    }
  }

  // Write registry
  const registryContent = `// AUTO-GENERATED — DO NOT EDIT
// Run: npx tsx scripts/generate-registry.ts
import type { TokenDefinition } from './types';

export const TOKEN_REGISTRY: TokenDefinition[] = [
${entries.join(',\n')}
];
`;

  // Write defaults
  const defaultsContent = `// AUTO-GENERATED — DO NOT EDIT
// Run: npx tsx scripts/generate-registry.ts

export const TOKEN_DEFAULTS: Record<string, string> = {
${defaults.join(',\n')}
};
`;

  writeFileSync(OUTPUT_PATH, registryContent);
  writeFileSync(DEFAULTS_PATH, defaultsContent);

  console.log(`✓ Generated ${entries.length} token definitions`);
  console.log(`  → ${OUTPUT_PATH}`);
  console.log(`  → ${DEFAULTS_PATH}`);
}

main();
```

- [ ] **Step 3: Add generate script to package.json**

Add to `package.json` scripts:

```json
"generate:registry": "tsx scripts/generate-registry.ts"
```

Install tsx:

```bash
npm install -D tsx
```

- [ ] **Step 4: Run the generator and verify output**

```bash
npm run generate:registry
```

Expected: Script outputs token count and creates `lib/tokens/registry.ts` and `lib/tokens/defaults.ts`. Check for any warnings about missing tokens.

- [ ] **Step 5: Add build-time CSS copy script**

Add to `package.json` scripts:

```json
"prebuild": "npm run generate:registry && cp node_modules/rek-room/dist/style.css public/rek-room.css"
```

Also run it now for development:

```bash
cp node_modules/rek-room/dist/style.css public/rek-room.css
```

- [ ] **Step 6: Commit**

```bash
git add scripts/ lib/tokens/ public/rek-room.css package.json
git commit -m "feat: add token registry generator and metadata"
```

---

## Task 4: State Management (Context + Undo/Redo + Persistence)

**Files:**
- Create: `lib/state/token-context.tsx`, `lib/state/history.ts`, `lib/state/persistence.ts`

- [ ] **Step 1: Create persistence helpers**

Create `lib/state/persistence.ts`:

```typescript
import type { OverridesMap } from '@/lib/tokens/types';

const STORAGE_KEY = 'combobulator-overrides';

export function loadOverrides(): OverridesMap {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides: OverridesMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function clearOverrides(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 2: Create undo/redo history logic**

Create `lib/state/history.ts`:

```typescript
import type { OverridesMap } from '@/lib/tokens/types';

const MAX_HISTORY = 50;

export type HistoryState = {
  past: OverridesMap[];
  present: OverridesMap;
  future: OverridesMap[];
};

export function createHistory(initial: OverridesMap): HistoryState {
  return { past: [], present: initial, future: [] };
}

export function pushState(history: HistoryState, next: OverridesMap): HistoryState {
  const past = [...history.past, history.present].slice(-MAX_HISTORY);
  return { past, present: next, future: [] };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  const past = history.past.slice(0, -1);
  return { past, present: previous, future: [history.present, ...history.future] };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  const future = history.future.slice(1);
  return { past: [...history.past, history.present], present: next, future };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}
```

- [ ] **Step 3: Create the token context**

Create `lib/state/token-context.tsx`:

```typescript
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { ColorSchemeMode, OverridesMap, PreviewMode } from '@/lib/tokens/types';
import { createHistory, pushState, undo, redo, type HistoryState } from './history';
import { loadOverrides, saveOverrides, clearOverrides } from './persistence';

type State = {
  history: HistoryState;
  previewMode: PreviewMode;
  colorSchemeMode: ColorSchemeMode;
  expandedCategory: string | null;
  typeScaleUnlocked: boolean;
};

type Action =
  | { type: 'SET_TOKEN'; key: string; value: string }
  | { type: 'RESET_TOKEN'; key: string }
  | { type: 'RESET_ALL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_PREVIEW_MODE'; mode: PreviewMode }
  | { type: 'SET_COLOR_SCHEME_MODE'; mode: ColorSchemeMode }
  | { type: 'SET_EXPANDED_CATEGORY'; category: string | null }
  | { type: 'SET_TYPE_SCALE_UNLOCKED'; unlocked: boolean }
  | { type: 'HYDRATE'; overrides: OverridesMap };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TOKEN': {
      const next = { ...state.history.present, [action.key]: action.value };
      return { ...state, history: pushState(state.history, next) };
    }
    case 'RESET_TOKEN': {
      const { [action.key]: _, ...rest } = state.history.present;
      return { ...state, history: pushState(state.history, rest) };
    }
    case 'RESET_ALL':
      return { ...state, history: pushState(state.history, {}) };
    case 'UNDO':
      return { ...state, history: undo(state.history) };
    case 'REDO':
      return { ...state, history: redo(state.history) };
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.mode };
    case 'SET_COLOR_SCHEME_MODE':
      return { ...state, colorSchemeMode: action.mode };
    case 'SET_EXPANDED_CATEGORY':
      return { ...state, expandedCategory: action.category };
    case 'SET_TYPE_SCALE_UNLOCKED':
      return { ...state, typeScaleUnlocked: action.unlocked };
    case 'HYDRATE':
      return { ...state, history: createHistory(action.overrides) };
    default:
      return state;
  }
}

const TokenContext = createContext<{
  overrides: OverridesMap;
  previewMode: PreviewMode;
  colorSchemeMode: ColorSchemeMode;
  expandedCategory: string | null;
  typeScaleUnlocked: boolean;
  changedCount: number;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    history: createHistory({}),
    previewMode: 'vignettes' as PreviewMode,
    colorSchemeMode: 'both' as ColorSchemeMode,
    expandedCategory: 'colors',
    typeScaleUnlocked: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadOverrides();
    if (Object.keys(stored).length > 0) {
      dispatch({ type: 'HYDRATE', overrides: stored });
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    saveOverrides(state.history.present);
  }, [state.history.present]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const overrides = state.history.present;
  const changedCount = Object.keys(overrides).length;

  return (
    <TokenContext.Provider
      value={{
        overrides,
        previewMode: state.previewMode,
        colorSchemeMode: state.colorSchemeMode,
        expandedCategory: state.expandedCategory,
        typeScaleUnlocked: state.typeScaleUnlocked,
        changedCount,
        dispatch,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useTokens must be used within TokenProvider');
  return context;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add lib/state/
git commit -m "feat: add token state context with undo/redo and localStorage persistence"
```

---

## Task 5: CSS Generator & PostMessage Protocol

**Files:**
- Create: `lib/preview/css-generator.ts`, `lib/preview/message-protocol.ts`

- [ ] **Step 1: Create the CSS generator**

Create `lib/preview/css-generator.ts`:

```typescript
import type { OverridesMap } from '@/lib/tokens/types';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';

/**
 * Convert an overrides map to a :root {} CSS string.
 * Groups by category with comments.
 */
export function generateOverrideCSS(overrides: OverridesMap): string {
  if (Object.keys(overrides).length === 0) return '';

  // Merge light/dark pairs into light-dark() values
  const merged: Record<string, string> = {};
  const pairedKeys = new Set<string>();

  for (const [key, value] of Object.entries(overrides)) {
    if (key.endsWith('--light')) {
      const base = key.replace(/--light$/, '');
      const darkKey = `${base}--dark`;
      const darkValue = overrides[darkKey] ?? value;
      merged[base] = `light-dark(${value}, ${darkValue})`;
      pairedKeys.add(key);
      pairedKeys.add(darkKey);
    } else if (key.endsWith('--dark')) {
      const base = key.replace(/--dark$/, '');
      if (!overrides[`${base}--light`]) {
        // Dark-only override — still wrap in light-dark with default light value
        const token = TOKEN_REGISTRY.find((t) => t.key === base);
        const lightDefault = token?.defaultValue ?? value;
        merged[base] = `light-dark(${lightDefault}, ${value})`;
        pairedKeys.add(key);
      }
    }
  }

  // Add non-paired overrides
  for (const [key, value] of Object.entries(overrides)) {
    if (!pairedKeys.has(key)) {
      merged[key] = value;
    }
  }

  // Group by category
  const grouped: Record<string, Array<{ key: string; value: string }>> = {};

  for (const [key, value] of Object.entries(merged)) {
    const token = TOKEN_REGISTRY.find((t) => t.key === key);
    const category = token?.category ?? 'other';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ key, value });
  }

  const categoryOrder = ['colors', 'typography', 'spacing', 'borders', 'elevation', 'animation', 'controls', 'other'];
  const lines: string[] = ['/* rek-room overrides */', ':root {'];

  for (const cat of categoryOrder) {
    const entries = grouped[cat];
    if (!entries) continue;
    lines.push(`  /* ${cat.charAt(0).toUpperCase() + cat.slice(1)} */`);
    for (const { key, value } of entries) {
      lines.push(`  ${key}: ${value};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}
```

- [ ] **Step 2: Create the postMessage protocol**

Create `lib/preview/message-protocol.ts`:

```typescript
/**
 * Message types for communication between editor and preview iframes.
 */

export type EditorToPreviewMessage =
  | { type: 'apply-overrides'; css: string }
  | { type: 'set-preview-mode'; mode: 'vignettes' | 'kitchen-sink' }
  | { type: 'scroll-to-vignette'; vignette: string }
  | { type: 'load-font'; url: string };

export type PreviewToEditorMessage =
  | { type: 'scroll'; scrollTop: number }
  | { type: 'ready' };

export function postToIframe(iframe: HTMLIFrameElement, message: EditorToPreviewMessage): void {
  iframe.contentWindow?.postMessage(message, '*');
}

export function isPreviewMessage(data: unknown): data is PreviewToEditorMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as { type: string }).type in { scroll: true, ready: true }
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/preview/
git commit -m "feat: add CSS generator and iframe postMessage protocol"
```

---

## Task 6: WCAG Contrast Calculation

**Files:**
- Create: `lib/contrast.ts`

- [ ] **Step 1: Create contrast utilities**

Create `lib/contrast.ts`:

```typescript
/**
 * WCAG 2.1 contrast ratio calculation.
 * No external dependencies — pure math.
 */

// Parse hex color to [r, g, b] (0-255)
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

// Relative luminance per WCAG 2.1
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Contrast ratio between two hex colors
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(...hexToRgb(hex1));
  const l2 = relativeLuminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = 'AAA' | 'AA' | 'fail';

export function getWcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'fail';
}

export function getContrastDotColor(level: WcagLevel): string {
  switch (level) {
    case 'AAA': return '#22c55e'; // green
    case 'AA': return '#eab308';  // yellow
    case 'fail': return '#ef4444'; // red
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/contrast.ts
git commit -m "feat: add WCAG contrast ratio calculation"
```

---

## Task 7: Google Fonts Helper

**Files:**
- Create: `lib/google-fonts.ts`

- [ ] **Step 1: Create Google Fonts utility**

Create `lib/google-fonts.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/google-fonts.ts
git commit -m "feat: add Google Fonts helper with curated font list"
```

---

## Task 8: Export CSS

**Files:**
- Create: `lib/export/export-css.ts`

- [ ] **Step 1: Create the export function**

Create `lib/export/export-css.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/export/
git commit -m "feat: add CSS export with Google Fonts @import support"
```

---

## Task 9: Preview Content HTML

**Files:**
- Create: `public/preview.html`

- [ ] **Step 1: Create the preview HTML**

Create `public/preview.html`. This is the static HTML loaded inside the preview iframes. It includes:

- A `<link>` to `/rek-room.css`
- A `<style id="overrides">` element (updated via postMessage)
- All vignette sections with `id` attributes matching the category-to-vignette map
- A kitchen-sink section (hidden by default, shown when `set-preview-mode` message is received)
- A `<script>` that listens for postMessage from the editor and handles:
  - `apply-overrides`: update `#overrides` style element textContent
  - `set-preview-mode`: toggle vignettes/kitchen-sink visibility
  - `scroll-to-vignette`: smooth scroll to the target vignette section
  - `load-font`: inject a `<link>` tag for a Google Font URL
  - Emit `scroll` events back to the parent (for synchronized scrolling)
  - Emit `ready` when the page is loaded

The HTML should include all vignettes from the spec: Typography (h1–h6, p, blockquote, code, links), Buttons (primary, secondary, destructive in default/hover/disabled states), Forms (input, textarea, select, toggle, validation states), Tables, Lists, Media (img, figure, figcaption), Details/Summary, Dialog, Progress/Meter, Popover, Scrollbars.

Each vignette section should use real HTML elements (not mock divs) so rek-room styles them natively.

- [ ] **Step 2: Verify preview.html loads with rek-room styles**

Open `http://localhost:3000/preview.html` directly in the browser.

Expected: All HTML elements are styled by rek-room. The page should look like a well-formatted component gallery.

- [ ] **Step 3: Commit**

```bash
git add public/preview.html
git commit -m "feat: add preview HTML with all vignettes and postMessage handler"
```

---

## Task 10: Preview Components

**Files:**
- Create: `components/preview/preview-iframe.tsx`, `components/preview/preview-area.tsx`

- [ ] **Step 1: Create the iframe wrapper component**

Create `components/preview/preview-iframe.tsx`:

This component:
- Renders an `<iframe>` pointing to `/preview.html`
- On mount, waits for `ready` message from iframe, then sends initial overrides
- Listens for `scroll` messages and forwards to the sync handler
- Exposes a ref for the parent to send messages to
- Accepts a `colorScheme` prop (`'light'` | `'dark'`) and appends it as a query param so the iframe can set `color-scheme` accordingly
- Uses `requestAnimationFrame` throttling when sending override updates

- [ ] **Step 2: Create the preview area component**

Create `components/preview/preview-area.tsx`:

This component:
- Renders the top bar with Shadcn Tabs (Vignettes | Kitchen Sink) and ToggleGroup (Light | Dark | Both)
- Contains one or two `PreviewIframe` components depending on `colorSchemeMode`
- Handles synchronized scrolling: when one iframe emits a scroll event, forwards it to the other
- When `expandedCategory` changes in context, sends `scroll-to-vignette` message using the `CATEGORY_VIGNETTE_MAP`

- [ ] **Step 3: Verify iframes render with rek-room styles**

Start dev server, navigate to the app. Both iframes should load and display the preview HTML with rek-room styling. Light iframe should have light background, dark iframe dark background.

- [ ] **Step 4: Commit**

```bash
git add components/preview/
git commit -m "feat: add preview iframe components with scroll sync"
```

---

## Task 11: Basic Control Components

**Files:**
- Create: `components/controls/color-control.tsx`, `components/controls/dimension-control.tsx`, `components/controls/ratio-control.tsx`, `components/controls/weight-control.tsx`, `components/controls/border-style-control.tsx`, `components/change-indicator.tsx`

- [ ] **Step 1: Create the change indicator component**

Create `components/change-indicator.tsx`:

Shows a small purple dot when the token has been modified, plus a reset button (↺) that dispatches `RESET_TOKEN`. Uses Shadcn Tooltip on the reset button.

- [ ] **Step 2: Create the color control**

Create `components/controls/color-control.tsx`:

Shadcn Popover with `react-colorful` HexColorPicker inside, plus a text input for hex value. The trigger is a color swatch div. On change, dispatches `SET_TOKEN`.

- [ ] **Step 3: Create the dimension control**

Create `components/controls/dimension-control.tsx`:

Shadcn Slider + Shadcn Input (number). Reads `min`, `max`, `step`, `unit` from the token definition. On change, dispatches `SET_TOKEN` with the value + unit.

- [ ] **Step 4: Create the ratio control**

Create `components/controls/ratio-control.tsx`:

Same as dimension but specific to `--type-ratio`. No unit. Slider range 1.1–1.618, step 0.001.

- [ ] **Step 5: Create the weight control**

Create `components/controls/weight-control.tsx`:

Shadcn Select with options: Thin (100), Extra Light (200), Light (300), Regular (400), Medium (500), Semi-Bold (600), Bold (700), Extra-Bold (800), Black (900).

- [ ] **Step 6: Create the border-style control**

Create `components/controls/border-style-control.tsx`:

Shadcn Select with options: solid, dashed, dotted, double, groove, ridge, inset, outset, none. Each option renders a small inline `<span>` with that border-style applied as a visual preview.

- [ ] **Step 7: Verify controls render and dispatch correctly**

Temporarily render one of each control type on the main page. Verify they update context state.

- [ ] **Step 8: Commit**

```bash
git add components/controls/ components/change-indicator.tsx
git commit -m "feat: add basic token control components"
```

---

## Task 12: Advanced Control Components

**Files:**
- Create: `components/controls/color-pair-control.tsx`, `components/controls/font-control.tsx`, `components/controls/duration-control.tsx`, `components/controls/easing-control.tsx`, `components/controls/shadow-control.tsx`, `components/controls/gradient-builder.tsx`, `components/contrast-dot.tsx`

- [ ] **Step 1: Create the color pair control (L/D)**

Create `components/controls/color-pair-control.tsx`:

Renders two color swatches labeled "L" and "D", each opening its own react-colorful popover. Dispatches two keys: `{key}--light` and `{key}--dark` (the CSS generator knows how to wrap these in `light-dark()`). When `colorSchemeMode` is single, shows only one swatch.

- [ ] **Step 2: Create the contrast dot component**

Create `components/contrast-dot.tsx`:

Accepts `textColor` and `surfaceColor` hex strings. Computes contrast ratio, renders a small colored dot (green/yellow/red). Shadcn Tooltip shows "12.6:1 — AAA" on hover.

- [ ] **Step 3: Create the font control**

Create `components/controls/font-control.tsx`:

Shadcn Combobox (Popover + Command via cmdk). Lists curated Google Fonts grouped by category (Sans-Serif, Serif, Monospace). A "System Stack" option at the top. A "Custom..." option at the bottom that switches to a text input. On select, dispatches `SET_TOKEN` and sends a `load-font` message to iframes.

- [ ] **Step 4: Create the duration control**

Create `components/controls/duration-control.tsx`:

Shadcn Slider + number input for seconds. Also renders a small animation preview: a 12px dot that moves across a 60px track using the current duration and the current `--animation-timing` easing. The animation replays on value change.

- [ ] **Step 5: Create the easing control**

Create `components/controls/easing-control.tsx`:

Shadcn Select listing all rek-room easing names. Next to the select, render a small SVG (40x30) showing the bezier curve of the selected easing. The curve is drawn from the cubic-bezier values.

- [ ] **Step 6: Create the shadow control**

Create `components/controls/shadow-control.tsx`:

A small square (24x24) with the current shadow applied as a preview. Click opens a Shadcn Popover with sliders for x-offset (-20..20), y-offset (-20..20), blur (0..50), spread (-10..30), and a color picker for shadow color. Changes are composed into a `box-shadow` value string.

- [ ] **Step 7: Create the gradient builder**

Create `components/controls/gradient-builder.tsx`:

Activated by the Figma-style gradient toggle icon (Shadcn Tooltip: "Switch to gradient"). Renders:
- Direction control: a dial or select for angle (0–360deg) or keywords (to top, to right, etc.)
- Color stops: an array of color + position (%) pairs with add/remove buttons
- Live preview strip showing the gradient

Outputs a `linear-gradient()` CSS string.

- [ ] **Step 8: Commit**

```bash
git add components/controls/ components/contrast-dot.tsx
git commit -m "feat: add advanced controls (color pairs, fonts, easing, shadows, gradients)"
```

---

## Task 13: Control Panel Assembly

**Files:**
- Create: `components/panel/control-panel.tsx`, `components/panel/token-group.tsx`, `components/panel/derived-tokens.tsx`, `components/panel/type-scale-toggle.tsx`

- [ ] **Step 1: Create the derived tokens component**

Create `components/panel/derived-tokens.tsx`:

Renders a subtle sub-section showing tokens that derive from a source token. Each row shows the token name, a small color swatch of the current computed value, and an "override" link. Clicking "override" dispatches `SET_TOKEN` for that derived key with its current computed value, promoting it to an independent control.

- [ ] **Step 2: Create the type scale toggle**

Create `components/panel/type-scale-toggle.tsx`:

A Shadcn Switch labeled "Individual heading sizes". When toggled on, sets `typeScaleUnlocked: true` in context. When toggled off, shows a Shadcn AlertDialog confirming that individual values will be recalculated from the ratio, then recomputes and dispatches.

- [ ] **Step 3: Create the token group component**

Create `components/panel/token-group.tsx`:

Renders a Shadcn AccordionItem for a single token category. Maps each token in the category to the appropriate control component based on `token.type`. For source tokens with derived tokens, renders `DerivedTokens` below the control. For the Typography group, includes the `TypeScaleToggle` and conditionally shows individual heading size controls.

The control routing logic:

```typescript
function controlForToken(token: TokenDefinition) {
  switch (token.type) {
    case 'color': return token.lightDark ? <ColorPairControl /> : <ColorControl />;
    case 'dimension': return <DimensionControl />;
    case 'ratio': return <RatioControl />;
    case 'font': return <FontControl />;
    case 'weight': return <WeightControl />;
    case 'duration': return <DurationControl />;
    case 'easing': return <EasingControl />;
    case 'shadow': return <ShadowControl />;
    case 'border-style': return <BorderStyleControl />;
  }
}
```

- [ ] **Step 4: Create the control panel**

Create `components/panel/control-panel.tsx`:

The right panel shell:
- Header: logo text ("rek-room"), Reset button (triggers AlertDialog), Export button (calls `downloadCSS`)
- Shadcn Accordion with one item per category, controlled by `expandedCategory` in context
- Colors expanded by default
- When a category is expanded, dispatches `SET_EXPANDED_CATEGORY` which triggers the preview auto-scroll

- [ ] **Step 5: Commit**

```bash
git add components/panel/
git commit -m "feat: add control panel with accordion groups and token routing"
```

---

## Task 14: Main Page Assembly

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Update the root layout**

Modify `app/layout.tsx`:
- Wrap children in `TokenProvider`
- Set metadata (title: "Combobulator — rek-room Editor")

- [ ] **Step 2: Update globals.css**

Modify `app/globals.css`:
- Keep Tailwind directives
- Add editor-specific styles: full-height layout (`html, body { height: 100% }`), no scroll on body

- [ ] **Step 3: Build the main page**

Modify `app/page.tsx`:

```tsx
import { PreviewArea } from '@/components/preview/preview-area';
import { ControlPanel } from '@/components/panel/control-panel';

export default function EditorPage() {
  return (
    <div className="flex h-screen">
      <PreviewArea />
      <ControlPanel />
    </div>
  );
}
```

- [ ] **Step 4: Verify the full editor loads**

```bash
npm run dev
```

Navigate to `http://localhost:3000`. Expected:
- Left side: preview area with top bar and two iframes (light/dark)
- Right side: control panel with accordion groups
- Changing a color token updates both iframes in real-time
- Undo/redo with Cmd+Z / Cmd+Shift+Z works
- Collapsing/expanding accordion groups works
- Mode toggle switches between single and split iframe view

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat: assemble main editor page with preview and control panel"
```

---

## Task 15: Responsive Behavior

**Files:**
- Modify: `app/page.tsx`, `components/preview/preview-area.tsx`, `components/panel/control-panel.tsx`

- [ ] **Step 1: Add responsive layout**

Modify the main page layout to stack vertically on small screens:
- `flex-col` on mobile, `flex-row` on `lg:` breakpoint
- Panel gets a max-height and becomes scrollable when stacked
- Preview area uses full width when stacked

- [ ] **Step 2: Add tabbed light/dark for small screens**

In `preview-area.tsx`, when screen width is below `lg` and mode is "both", render Shadcn Tabs (Light | Dark) instead of side-by-side iframes. Show only one iframe at a time.

Use a `useMediaQuery` hook or Tailwind's responsive classes to detect breakpoint.

- [ ] **Step 3: Verify responsive behavior**

Resize browser window. Expected:
- Below `lg`: panel stacks above preview, iframes switch to tabbed
- Above `lg`: side-by-side layout restored

- [ ] **Step 4: Commit**

```bash
git add app/ components/
git commit -m "feat: add responsive layout with tabbed preview on small screens"
```

---

## Task 16: Integration Testing & Polish

**Files:**
- Various existing files

- [ ] **Step 1: Test the full token editing flow**

Manual testing checklist:
1. Change `--color-primary` → verify buttons update in both iframes
2. Change `--type-ratio` slider → verify all heading sizes update
3. Toggle type scale to individual → change H1 size → verify only H1 changes
4. Toggle type scale back → accept AlertDialog → verify sizes recompute
5. Switch to "Light" mode → verify single iframe, single color inputs
6. Switch to "Dark" mode → same
7. Switch back to "Both" → verify split view returns
8. Reset a single token → verify it reverts and purple dot disappears
9. Reset All → accept AlertDialog → verify all tokens revert
10. Undo (Cmd+Z) → verify previous state restores
11. Redo (Cmd+Shift+Z) → verify redo works
12. Reload page → verify overrides persist from localStorage
13. Click Export → verify CSS file downloads with correct content
14. Expand "Typography" → verify preview scrolls to typography vignette
15. Scroll one iframe → verify other iframe scrolls in sync
16. Select a Google Font → verify it loads in preview

- [ ] **Step 2: Fix any issues found during testing**

Address bugs, visual issues, or interaction problems discovered.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "fix: polish and integration fixes"
```

---

## Task 17: Build & Deploy Verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors. The `prebuild` script runs the registry generator and copies rek-room CSS.

- [ ] **Step 2: Test production build locally**

```bash
npm start
```

Navigate to `http://localhost:3000`. Verify the editor works identically to dev mode.

- [ ] **Step 3: Commit any build fixes**

```bash
git add .
git commit -m "fix: production build fixes"
```

---

## Post-Implementation Polish (completed 2026-03-24)

Changes made after the initial 17-task implementation was complete:

### Dark iframe fix
- Added `data-theme="dark"` to the dark iframe's `<html>` element
- Switched preview CSS source from compiled `dist/steez.css` to Vite dev server (`http://localhost:5173/app/css/style.css`) to preserve `light-dark()` function calls

### Shadcn theme & font
- Applied Graphite theme preset (neutral grey palette, 0.35rem radius)
- Set Geist font via `next/font/google`, declared directly in `@theme inline` block

### Editor dark mode
- Added `next-themes` with `ThemeProvider` in layout
- Theme toggle button in panel header (after Export), cycles light ↔ dark
- Defaults to system preference on first load
- Tooltip: "Toggle UI theme"

### Resizable control panel
- Drag handle on left edge of panel (pointer events with capture)
- Default 320px, clamped 280–600px

### Top bar visual unification
- Changed top bar background from `bg-muted/50` to `bg-background` (matches panel)
- Replaced `ToggleGroup` for Light/Dark/Both with `Tabs`/`TabsList`/`TabsTrigger` to match Vignettes/Kitchen Sink style
