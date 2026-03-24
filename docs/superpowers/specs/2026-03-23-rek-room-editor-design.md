# rek-room Editor — Design Spec

A standalone web app for visually editing rek-room's CSS custom properties with live preview, built as a separate project that imports rek-room as a dependency.

## Audience

Both developers customizing tokens for their projects and designers exploring the design system visually. The UI should be approachable without code knowledge while remaining powerful enough for developer workflows.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/ui (built on Base UI primitives)
- **Theme:** Graphite (shadcn/tweakcn preset — neutral grey palette, tight 0.35rem radius)
- **Dark mode:** next-themes — follows system preference on first load, toggleable via header button
- **Color picker:** `react-colorful` (lightweight, accessible, zero-dep)
- **No backend required** — all state is client-side

## Architecture Overview

### Layout

Side-by-side layout: full-width preview area on the left, resizable control panel on the right (default 320px, drag handle on left edge, 280–600px range).

**Top bar** (within the preview area, same `bg-background` as the panel):
- Preview mode tabs: Vignettes | Kitchen Sink (TabsList style)
- Mode selector: Light | Dark | Both (matching TabsList style)

**Right panel:**
- Header with logo, Reset button, Export button, theme toggle (Sun/Moon icon with tooltip "Toggle UI theme")
- Accordion groups for each token category (7 groups)
- Colors expanded by default, all others collapsed

### Preview Area

Two iframes side by side — one forcing `color-scheme: light`, the other forcing `color-scheme: dark` (via `data-theme="dark"` on `<html>`). Both load rek-room's source CSS from the Vite dev server (`http://localhost:5173/app/css/style.css`) to preserve `light-dark()` function calls that the compiled dist resolves away.

User token overrides are injected via `postMessage`. Iframes provide full CSS isolation between the editor's Tailwind styles and rek-room's styles.

**Synchronized scrolling:** Both iframes share a single scroll position. Scroll events in one iframe are mirrored to the other via `postMessage` so the same content is always visible side by side.

**Single mode:** When "Light" or "Dark" is selected, only one iframe is shown at full width.

### Vignettes

Focused, isolated previews of each HTML primitive that rek-room styles, rendered inside the preview iframes. Each vignette is a labeled section:

- **Typography** — h1–h6, paragraphs, blockquotes, code blocks, links
- **Buttons** — primary, secondary, destructive in default/hover/disabled states
- **Forms** — inputs, textareas, selects, toggles, validation states
- **Tables** — styled table with headers and rows
- **Lists** — ul/ol with `.bullets` class
- **Media** — images, figures, figcaptions
- **Details/Summary** — accordion element
- **Dialog** — native dialog element
- **Progress/Meter** — progress bars and meters
- **Popover** — popover API element
- **Scrollbars** — scrollable container

Each vignette has an inline uppercase label. No additional navigation chrome — the panel-to-preview link provides navigation.

**Context-linking:** Expanding a token category in the panel auto-scrolls the preview to the most relevant vignette. Users can freely scroll to any vignette at any time.

Category-to-vignette mapping:
| Category | Scrolls to |
|----------|-----------|
| Colors | Typography (shows text colors, link colors, then buttons/forms below) |
| Typography | Typography |
| Spacing | Forms (spacing between elements is most visible here) |
| Borders & Radius | Forms (inputs show border/radius most clearly) |
| Elevation | Dialog (elevated surfaces) |
| Animation | Dialog (entry/exit animations) |
| Controls | Buttons |

### Kitchen Sink

A single full page rendering all rek-room HTML elements together. Used for gut-checking that all token changes work in concert.

## Token Data Model

```typescript
type TokenType = 'color' | 'dimension' | 'ratio' | 'font' | 'weight' | 'duration' | 'easing' | 'shadow' | 'border-style';

type TokenDefinition = {
  key: string;              // CSS custom property name, e.g. "--color-primary"
  label: string;            // Human-readable, e.g. "Primary"
  type: TokenType;          // Determines which Shadcn control renders
  category: TokenCategory;  // Panel group
  defaultValue: string;     // Stock rek-room value
  lightDark?: boolean;      // If true, renders paired light/dark inputs
  derivedFrom?: string;     // Source token key (for cascade display)
  min?: number;             // For sliders
  max?: number;             // For sliders
  step?: number;            // For sliders
  unit?: string;            // e.g. "px", "s", "rem"
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

Only source tokens render as editable controls. Derived tokens (e.g., `--color-action` derives from `--color-primary`) are displayed in a read-only "Derives →" sub-section below their source token, showing the current computed value.

Each derived token has an "override" link that promotes it to an independent editable control, breaking the link to its source.

### Light/Dark Handling

Tokens with `lightDark: true` (semantic tokens like `--color-surface`, `--color-text-primary`) render paired inputs with "L" and "D" labels.

Mode selector behavior:
- **Both** — paired inputs, split preview
- **Light Only** — single input per semantic token, single preview iframe
- **Dark Only** — same, but for dark values

Auto-generated dark values: When a user sets a light value, a sensible dark counterpart is auto-generated. Every value is fully overridable — no locked values.

## Control Types

| TokenType | Shadcn Control | Details |
|-----------|---------------|---------|
| `color` | Shadcn Popover + `react-colorful` picker + hex input | `react-colorful` (lightweight, accessible, zero-dep) inside a Shadcn Popover for trigger/dismiss. Figma-style gradient toggle icon with Tooltip ("Switch to gradient" / "Switch to solid"). Gradient mode opens a custom gradient builder (direction + color stops) on top. |
| `dimension` | Slider + number input | For spacing, border-width, radius, font-size. Min/max/step per token. |
| `ratio` | Slider + number input | For `--type-ratio`. Updates all heading sizes in preview as you drag. |
| `font` | Shadcn Combobox (Popover + Command via `cmdk`) | Searchable, filterable font list. Curated Google Fonts loaded dynamically into preview iframes. "Custom..." option for pasting font-family strings. Export includes `@import` or comment noting required fonts. |
| `weight` | Select dropdown | 100–900 in named increments (Thin, Light, Regular, Medium, Semi-Bold, Bold, Extra-Bold, Black). |
| `duration` | Slider + number input | In seconds. Small animation preview (a dot that moves using current easing + duration). |
| `easing` | Select + curve preview | Dropdown of rek-room's named easings with a small bezier curve visualization (custom SVG). |
| `shadow` | Preview swatch + popover builder | Compact shadow preview (a square with the shadow applied). Click opens a popover with individual sliders for x-offset, y-offset, blur, spread, and a color picker for shadow color. |
| `border-style` | Select dropdown | Options: solid, dashed, dotted, double, groove, ridge, inset, outset, none. Each option shows a small inline preview line in that style. |

### Contrast Ratio Feedback

Semantic text color controls (`--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-text-body`) display a WCAG contrast ratio indicator — a small color-coded dot next to each control:

- Green: AAA (7:1+)
- Yellow: AA (4.5:1+)
- Red: fail (below 4.5:1)

The exact ratio and WCAG level are shown in a Shadcn Tooltip on hover (e.g., "12.6:1 — AAA"). In "Both" mode, two dots are shown (one for light surface, one for dark). Calculated using the relative luminance formula — no library needed.

### Gradient Support

Applicable to color tokens used for surfaces and backgrounds. The gradient toggle uses a Figma-style icon (half solid / half gradient swatch) with a Shadcn Tooltip on hover.

When active, the flat color picker is replaced with a gradient builder: direction control + color stop editor. The resulting `linear-gradient()` value works within `light-dark()` — each mode can independently be flat or gradient.

### Type Scale: Ratio vs. Individual

Default: ratio-driven mode. A single `--type-ratio` slider computes all heading sizes automatically.

An "Individual heading sizes" toggle unlocks independent size inputs for h1–h6, display, body, body-sm, body-lg. Once unlocked, the ratio slider no longer affects these values.

Re-locking recomputes all sizes from the current ratio. This triggers a Shadcn AlertDialog confirmation since it overwrites individual values.

## State Management

A React context holds the overrides as a sparse `Record<string, string>` — only changed tokens, never defaults. This map is the single source of truth for:

- Preview injection (converted to `:root {}` block, sent to iframes via `postMessage`)
- Export (serialized to CSS)
- Persistence (auto-saved to `localStorage` on every change, hydrated on load)

### Undo/Redo

An array of state snapshots (the overrides map is small enough to copy cheaply). Keyboard shortcuts `Cmd+Z` / `Cmd+Shift+Z`. Max history depth of 50 snapshots to cap memory. No visible UI buttons — keyboard-only, as both designers and developers expect these shortcuts.

### Change Indicators

Any token modified from its default shows a small purple dot next to the label and a reset button (↺) that reverts that individual value.

### Reset All

The "Reset" button in the panel header triggers a Shadcn AlertDialog: "This will reset all X changed tokens to their defaults. This can't be undone." with Cancel and Reset buttons.

## Export

**CSS overrides snippet** — a `:root {}` block containing only changed values, grouped by category with comments:

```css
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

The user imports stock rek-room normally and includes this snippet alongside it. They stay on the rek-room upgrade path.

If Google Fonts were selected, the export includes the necessary `@import` statement or a comment with the `<link>` tag to add.

## Performance

Preview updates are throttled to one `postMessage` per `requestAnimationFrame` (~60fps). All changed properties are batched into a single message rather than one per property. Inside each iframe, overrides are applied by updating a single `<style>` element's `textContent` rather than individual `setProperty` calls.

## Token Registry

The token registry (the array of `TokenDefinition` objects) is auto-generated at build time by a script that parses rek-room's source CSS (`tokens/core.css`). The script extracts custom property declarations and their default values.

Metadata that can't be inferred from CSS (labels, categories, `derivedFrom` relationships, slider min/max/step, `lightDark` flag) lives in a separate hand-maintained config file that maps to the extracted keys.

Upgrading rek-room is: `npm update` → run the registry script → check if any new tokens need metadata in the config.

## Persistence

State auto-saves to `localStorage` on every change. On load, the overrides map is hydrated from `localStorage`. No backend, no accounts, no URL encoding.

The export (CSS overrides snippet) serves as the sharing mechanism — users share the CSS file if they want to transfer their config.

## Responsive Behavior

On smaller screens, the panel stacks above the preview. The light/dark split switches to a tabbed view (light tab / dark tab) instead of side by side.

## Token Categories & Their Contents

### Colors
- **Palette:** `--color-primary`, `--color-secondary`, `--color-tertiary` (+ light/dark/contrast variants)
- **Neutrals:** `--color-neutral-0` through `--color-neutral-10`, `--color-black`, `--color-white`
- **Semantic (L/D):** `--color-surface`, `--color-surface-raised`, `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-text-body`, `--color-border`, `--color-viewport-background`
- **Role:** `--color-action`, `--color-highlight` (+ light/dark/contrast variants) — derived from primary/secondary
- **Raw palette:** `--color-yellow`, `--color-red`, `--color-green` — base values behind status colors, not directly editable (edit status colors instead)
- **Status:** `--color-success`, `--color-warning`, `--color-error` (+ light/dark/contrast variants)

### Typography
- **Font stacks:** `--font-primary-stack`, `--font-secondary-stack`, `--font-tertiary-stack`
- **Font family:** `--font-family`, `--font-family-heading`
- **Weights:** `--font-weight-thin` through `--font-weight-black`, `--font-weight-heading`
- **Scale:** `--type-ratio`, `--font-size-base`
- **Sizes (unlockable):** `--font-size-h1` through `--font-size-h6`, `--font-size-display`, `--font-size-body`, `--font-size-body-sm`, `--font-size-body-lg`
- **Line heights:** `--line-height-reset`, `--line-height-text`, `--line-height-heading`

### Spacing
- **Base + scale:** `--spacing-base`, `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`

### Borders & Radius
- `--border-width`, `--border-style`, `--border-color`, `--border-radius`
- `--focus-outline-width`, `--focus-outline-offset`

### Elevation
- `--elevation-1` through `--elevation-5` (box shadows, theme-aware)

### Animation
- **Durations:** `--animation-duration`, `--animation-duration-slow`, `--animation-duration-fast`
- **Easings:** `--linear`, `--ease`, `--ease-in`, `--ease-out`, `--ease-in-out`, plus named variants (sine, quad, cubic, quart, quint, expo, circ, back)
- `--animation-timing`

### Controls
- **Block sizes:** `--control-block-size`, `--control-block-size-sm`, `--control-block-size-lg`
- **Font:** `--control-font-size`, `--control-font-weight`
- **Padding:** `--control-padding-inline`, `--control-padding-inline-sm`, `--control-padding-inline-lg`
- **Scrollbar:** `--scrollbar-width`

## Out of Scope (Future)

- Compiled stylesheet export (requires bundling Lightning CSS in-browser or server-side)
- Full library export (modified source files)
- User accounts / saved configurations
- Share URL / shareable links (localStorage is the persistence mechanism; export CSS to share)
- Rek-room version selector (v1 locks to the version in `package.json`)
- `@custom-media` breakpoint editing (resolved at build time, not runtime)
- Component-scoped variable editing (internal to components, not design tokens)
