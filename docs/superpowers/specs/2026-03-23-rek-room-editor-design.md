# Steez — Design Spec

A standalone web app for visually editing rek-room's CSS custom properties with live light/dark preview and CSS export, built as a separate Next.js project that imports rek-room as a local dependency.

> **Last updated:** 2026-03-26 — reflects the shipped application state.

## Audience

Both developers customizing tokens for their projects and designers exploring the design system visually. The UI is approachable without code knowledge while remaining powerful enough for developer workflows.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React Compiler enabled
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Base UI primitives)
- **Theme:** Graphite (neutral grey palette, 0.35rem radius)
- **Dark mode:** next-themes — follows system preference, toggleable via header button
- **Color picker:** `react-colorful` (2KB, accessible, zero-dep)
- **Font search:** `cmdk` (searchable combobox)
- **Icons:** lucide-react
- **Font:** Geist (via next/font/google)
- **No backend required** — all state is client-side
- **~7,000 lines** of TypeScript/TSX

## Architecture Overview

### Layout

Side-by-side layout: full-width preview area on the left, resizable control panel on the right (default 400px, drag handle on left edge, 280–600px range, keyboard-accessible with arrow keys).

**Top bar** (67px, within the preview area):
- Left: Steez SVG logo + ":: STEEZ ::" wordmark
- Right: Preview mode tabs (Vignettes | Kitchen Sink) + color scheme tabs (Light | Dark | Both)

**Right panel** (67px header + scrollable accordion):
- Header: changed-count badge, Reset button, Export button, theme toggle (Sun/Moon with animated cross-fade)
- 7 accordion groups (all collapsed by default, single-open behavior)

### Responsive Behavior

- **Desktop (≥1024px):** Flex row — preview fills remaining space, panel is resizable 280–600px
- **Mobile (<1024px):** Flex column — preview on top, panel below (max 50vh, scrollable). In "Both" mode, a tab switcher replaces the side-by-side layout (Light tab / Dark tab)

### Preview System

Two iframes side by side — one light, one dark (via `?scheme=dark` query parameter). Both load bundled source CSS from `/rek-room-source.css` (built at build time by inlining rek-room's `@import` tree). This preserves `light-dark()` function calls that the compiled dist resolves to static light-mode values.

User token overrides are injected via `postMessage` as a `:root {}` CSS block into a `<style id="overrides">` element. Iframes provide full CSS isolation between the editor's Tailwind styles and rek-room's styles.

**Synchronized scrolling:** In "Both" mode, iframes share a scroll container. Scroll events are mirrored via `postMessage` so the same content is always visible side by side.

**Single mode:** When "Light" or "Dark" is selected, one iframe at full width.

**Message protocol (postMessage):**

| Direction | Type | Payload |
|-----------|------|---------|
| Editor → Preview | `apply-overrides` | `{ css: string }` |
| Editor → Preview | `set-preview-mode` | `{ mode: 'vignettes' \| 'kitchen-sink' }` |
| Editor → Preview | `scroll-to-vignette` | `{ vignette: string }` |
| Editor → Preview | `set-scroll-mode` | `{ mode: 'internal' \| 'external' }` |
| Editor → Preview | `load-font` | `{ url: string }` |
| Preview → Editor | `ready` | — |
| Preview → Editor | `scroll` | `{ scrollTop: number }` |
| Preview → Editor | `content-height` | `{ height: number }` |

### Vignettes

Curated previews of each HTML primitive rek-room styles, rendered inside the preview iframes:

- **Typography** — h1–h6, paragraphs, blockquotes, code blocks, links
- **Buttons** — primary, secondary, destructive in default/hover/disabled states
- **Forms** — inputs, textareas, selects, toggles, validation states
- **Tables** — styled table with headers and rows
- **Lists** — ul/ol with `.bullets` class
- **Media** — images, figures, figcaptions
- **Details/Summary** — accordion element
- **Dialog** — native dialog element
- **Progress/Meter** — progress bars and meters
- **Scrollbars** — scrollable container

Each vignette has an inline uppercase label. No navigation chrome — expanding a panel category auto-scrolls the preview to the relevant vignette.

**Category-to-vignette mapping:**

| Category | Vignettes mode | Kitchen Sink mode |
|----------|---------------|-------------------|
| Colors | typography | ks-colors |
| Typography | typography | ks-headings |
| Spacing | forms | ks-form-elements |
| Borders | forms | ks-form-elements |
| Elevation | dialog | ks-dialog |
| Animation | dialog | ks-dialog |
| Controls | buttons | ks-form-elements |

### Kitchen Sink

A comprehensive page rendering all rek-room HTML elements together — colors, headings, text blocks, details, dialogs, popovers, text elements, buttons, every form input type, tables, output, meters, progress bars, lists, and media. Used for gut-checking that all token changes work in concert.

## Token Data Model

```typescript
type TokenType = 'color' | 'dimension' | 'ratio' | 'font' | 'weight' | 'duration' | 'easing' | 'shadow' | 'border-style';

type TokenDefinition = {
  key: string;              // CSS custom property name, e.g. "--color-primary"
  label: string;            // Human-readable, e.g. "Primary"
  type: TokenType;          // Determines which control renders
  category: TokenCategory;  // Panel accordion group
  defaultValue: string;     // Stock rek-room value
  lightDark?: boolean;      // If true, renders paired light/dark inputs
  derivedFrom?: string;     // Source token key (for cascade display)
  min?: number;             // For sliders
  max?: number;             // For sliders
  step?: number;            // For sliders
  unit?: string;            // e.g. "px", "s", "rem"
  gradient?: boolean;       // Enable gradient builder toggle
  hidden?: boolean;         // Don't show in UI
  subcategory?: string;     // Visual grouping (Palette, Brand, Semantic)
};

type TokenCategory =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'borders'
  | 'elevation'
  | 'animation'
  | 'controls';
```

### Source vs. Derived Tokens

Only source tokens render as editable controls. Derived tokens (e.g., `--color-action` derives from `--color-primary`) are displayed in a collapsible sub-section below their source token with left border indentation.

Each derived token shows its alias value (the expression it derives from). Clicking it promotes the token to an independent editable control, breaking the link to its source.

### Light/Dark Handling

Tokens with `lightDark: true` (semantic tokens like `--color-surface`, `--color-text-primary`) render paired color swatches labeled "L" and "D".

Mode selector behavior:
- **Both** — both swatches visible, split preview
- **Light** — light swatch only, single preview iframe
- **Dark** — dark swatch only, single preview iframe

Overrides are stored as `--key--light` and `--key--dark` suffixed keys. The CSS generator merges them back into `light-dark(light, dark)` for export and preview injection.

## Control Types

| TokenType | Control | Details |
|-----------|---------|---------|
| `color` | Popover + `react-colorful` picker + hex input | Swatch trigger opens popover with color picker. Tokens with `gradient: true` show a gradient toggle icon. |
| `color` (lightDark) | `ColorPairControl` — dual swatch with L/D labels | Text color tokens (`--color-text-*`) additionally show WCAG contrast dots comparing against `--color-surface`. |
| `dimension` | Slider + number input | For spacing, border-width, radius, font-size. Min/max/step per token. Some show raw `clamp()` expressions as read-only when unoverridden. |
| `ratio` | Combobox (Popover + Command) | Searchable list of named ratios (Minor Second 1.067, Major Second 1.125, Minor Third 1.2, etc.) |
| `font` | Combobox (Popover + Command via `cmdk`) | Searchable list of 18 curated Google Fonts grouped by category (sans-serif, serif, monospace) plus system stacks. Fonts loaded dynamically into preview iframes. |
| `weight` | Combobox (Popover + Command) | Named weights: Thin (100) through Black (900). |
| `duration` | Slider + number input | Duration in seconds with min/max/step. |
| `easing` | Combobox (Popover + Command) | Grouped easings: Standard (linear, ease, ease-in, ease-out, ease-in-out) and named variants (sine, quad, cubic, quart, quint, expo, circ, back) in In/Out/InOut groups. |
| `shadow` | Multi-layer shadow builder | Parses `light-dark(shadow, shadow)` values. Tabs for light/dark. Per-layer sliders for x, y, blur, spread with color picker. Recomposes full shadow string. |
| `border-style` | Select dropdown | Standard CSS border-style values with inline visual preview lines. |

### WCAG Contrast Feedback

Semantic text color tokens (`--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-text-body`) display color-coded dots:

- Green: AAA (7:1+)
- Yellow: AA (4.5:1+)
- Red: fail (below 4.5:1)

Exact ratio and WCAG level shown in tooltip on hover (e.g., "12.6:1 — AAA"). In "Both" mode, two dots appear (one per scheme). Contrast is calculated against the current `--color-surface` value using the relative luminance formula.

The resolver follows `var()` references up to 3 levels deep and approximates `color-mix()` for the neutral scale. Tokens using `oklch()` expressions show as unresolvable (fail) since they can't be converted to hex without a CSS engine.

### Gradient Support

Tokens with `gradient: true` show a toggle icon. When active, the flat color picker is replaced with a gradient builder:
- Direction: 8 presets (to right, to left, to bottom, to top, diagonals, 45°, 135°)
- Color stops: add/remove/reorder with individual color pickers and position inputs
- Output: `linear-gradient(direction, color position, ...)` value

### Type Scale: Ratio vs. Individual

Default: ratio-driven mode. The `--type-ratio` combobox selects a named ratio that computes all heading sizes.

A toggle unlocks independent size inputs for h1–h6 headings. These appear as additional dimension controls below the ratio control.

### Color Subcategories

The Colors accordion groups tokens into labeled subsections:
- **Palette** — Black, White, Neutrals 0–10, Green, Red, Yellow + status colors
- **Brand** — Primary, Secondary, Tertiary (+ light/dark/contrast variants as derived tokens)
- **Semantic** — Surface, Surface Raised, Text colors, Border Color, Viewport Background (all light-dark pairs)

## State Management

A React context (`TokenProvider`) holds all editor state via `useReducer`. The context value is memoized with `useMemo` to prevent unnecessary re-renders across 13+ consuming components.

```typescript
type State = {
  history: HistoryState;           // past/present/future snapshots
  previewMode: PreviewMode;        // 'vignettes' | 'kitchen-sink'
  colorSchemeMode: ColorSchemeMode; // 'light' | 'dark' | 'both'
  expandedCategory: string | null; // current open accordion
  typeScaleUnlocked: boolean;      // individual heading sizes
};

// Context exposes:
overrides: OverridesMap;            // Record<string, string> — only changed tokens
previewMode, colorSchemeMode, expandedCategory, typeScaleUnlocked;
changedCount: number;               // derived from Object.keys(overrides).length
dispatch: React.Dispatch<Action>;
```

**Actions:** `SET_TOKEN`, `RESET_TOKEN`, `RESET_ALL`, `UNDO`, `REDO`, `SET_PREVIEW_MODE`, `SET_COLOR_SCHEME_MODE`, `SET_EXPANDED_CATEGORY`, `SET_TYPE_SCALE_UNLOCKED`, `HYDRATE`.

### Undo/Redo

Snapshot-based history (array of overrides maps). Keyboard shortcuts `Cmd+Z` / `Cmd+Shift+Z`. Max 50 snapshots. No visible UI buttons.

### Change Indicators

Modified tokens show a purple dot next to the label and a reset button (↺) that reverts that individual value. The header badge shows the total changed count.

### Reset All

The Reset button triggers an AlertDialog: "This will reset all X changed tokens to their defaults. This can't be undone." with Cancel and Reset buttons.

## Export

Downloads `rek-room-overrides.css` containing:
- `@import` statements for any Google Fonts used
- A `:root {}` block with only changed values, grouped by category with comments
- Light/dark pairs merged back to `light-dark(light, dark)` syntax

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

/* rek-room overrides */
:root {
  /* Colors */
  --color-primary: #ff6600;
  --color-surface: light-dark(#fafafa, #111111);

  /* Typography */
  --type-ratio: 1.333;
  --font-family: "Inter", sans-serif;
}
```

## Performance

- Context value memoized with `useMemo` (prevents re-renders when unrelated state changes)
- TOKEN_REGISTRY lookups pre-computed at module level as `Map` (no per-render filtering)
- Source token keys per category pre-computed once at import time
- CSS transitions use specific properties (no `transition-all`)
- Dynamic numbers use `tabular-nums` to prevent layout shift

## Token Registry

Auto-generated at build time by `scripts/generate-registry.ts` which parses rek-room's source CSS. Metadata (labels, categories, ranges, `derivedFrom` relationships) maintained separately in `src/lib/tokens/metadata.ts`.

A second build script (`scripts/bundle-source-css.ts`) inlines rek-room's 20-file `@import` tree into a single `public/rek-room-source.css` for the preview iframes.

Upgrading rek-room: `npm update` → `npm run prebuild` → check if new tokens need metadata.

## Persistence

- **Storage key:** `steez-overrides`
- Auto-saves to `localStorage` on every change
- Hydrated on mount via `HYDRATE` action
- No backend, no accounts, no URL encoding
- Sharing: export the CSS file

## Accessibility

- Resize handle: keyboard-accessible (Arrow keys ±10px, Shift+Arrow ±50px) with ARIA role and label
- Change indicators: sr-only "Modified" text for screen readers
- Contrast dots: sr-only labels with exact ratio
- All popover triggers have `aria-label`
- Focus-visible ring styling on interactive elements
- SVG logo has `role="img"` and `aria-labelledby`
- Icon-only buttons have `aria-hidden` on icons and `aria-label` on containers

## Out of Scope (Future)

- Responsive preview controls (viewport width slider)
- Animation preview for duration/easing tokens
- Token search (`Cmd+K` to jump to any token)
- Diff view on export (before/after values)
- Preset themes (curated starting configurations)
- User accounts / saved configurations
- Share URLs (export CSS to share)
- Rek-room version selector
- `@custom-media` breakpoint editing
- Component-scoped variable editing
