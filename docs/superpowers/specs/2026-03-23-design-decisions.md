# Steez — Design Decisions & Tradeoffs

A record of every design decision made during brainstorming, the alternatives considered, and why we chose what we did.

> **Last updated:** 2026-03-26 — entries marked with ✦ were updated to reflect the shipped application.

---

## 1. Audience

**Decision:** Both developers and designers.

**Why:** The tool should be approachable enough for designers to explore the design system visually without touching code, while remaining powerful enough for developers customizing tokens for their projects. This dual audience influenced every subsequent UI decision.

---

## 2. Separation from rek-room

**Decision:** Separate repo/project, imports rek-room as a dependency.

**Alternatives considered:**
- (B) Inside rek-room as a subdirectory

**Why:** Keeps the CSS library clean and focused. The editor has a completely different tech stack (Next.js/React vs. pure CSS) and deployment model. Decoupling means both can evolve independently.

---

## 3. Tech Stack

**Decision:** Next.js (App Router), TypeScript, Tailwind CSS.

**Why:** User requirement — non-negotiable. These were specified as hard constraints.

---

## 4. Component Library: Shadcn/ui over Tweakpane

**Decision:** Shadcn/ui (Radix primitives + Tailwind) instead of Tweakpane.

**Alternatives considered:**
- Tweakpane (user's initial idea)
- Radix UI primitives directly
- Custom-built controls

**Why:** Tweakpane is vanilla JS — integrating into React requires community wrappers (`tweakpane-react`) that aren't officially maintained. Its accessibility story is inconsistent (some controls lack proper ARIA labels, keyboard navigation has gaps). Shadcn gives Tweakpane-style panel UX (collapsible groups, inline controls, compact layout) with full Radix accessibility baked in, styled with Tailwind, and the user owns the code.

---

## 5. Color Picker: react-colorful

**Decision:** `react-colorful` inside a Shadcn Popover.

**Alternatives considered:**
- (A) Build custom from Radix primitives — non-trivial canvas math
- (C) Native `<input type="color">` — no alpha, no gradient, OS-dependent styling

**Why:** Shadcn doesn't ship a color picker. react-colorful is lightweight (2KB), accessible, zero-dep, and battle-tested. Wrapping it in Shadcn Popover gives consistent trigger/dismiss behavior.

---

## 6. Font Selector: Shadcn Combobox (cmdk)

**Decision:** Searchable combobox using Shadcn's Popover + Command pattern.

**Why:** A basic Select won't work for browsing hundreds of Google Fonts. The Combobox pattern (built on `cmdk`) provides search, filtering, and grouping. This was identified as a gap during the component audit.

---

## 7. Layout: Side-by-Side Panel (Right) + Preview

**Decision:** Fixed 280px panel on the right, full-width preview on the left.

**Alternatives considered:**
- (A) Panel on the left — initially proposed
- (B) Floating draggable panel — user initially selected this
- (C) Tabbed workspace — guided but adds friction

**Journey:** User initially chose (B) floating panel, then asked to see (A) for comparison. After seeing both mockups, switched to (A) with the panel on the right side. The floating panel was more complex to build (drag/dock/resize logic, mobile treatment, state persistence) without meaningful UX benefit for this use case. Right-side placement mirrors Figma's inspector panel — familiar to the target audience.

---

## 8. Preview: Light/Dark Split with Synchronized Scrolling

**Decision:** Two iframes side by side, scroll-synced via postMessage.

**Key constraint:** Both iframes must scroll together — user explicitly requested they NOT scroll independently. Same content must always be visible side by side for comparison.

**Single mode:** When "Light" or "Dark" is selected, one iframe at full width. Mode selector order: Light | Dark | Both (user-specified ordering).

---

## 9. Vignettes vs. Kitchen Sink

**Decision:** Both views, toggled via tabs. Vignettes are context-linked to the panel.

**Key discussion:** User questioned how vignettes differ from kitchen sink if they're all scrollable. The distinction was sharpened: vignettes are curated previews that auto-scroll to the relevant section when a panel category is expanded. Kitchen sink is the full page for gut-checking everything together.

**Important constraint:** Rek-room only styles HTML primitives — no cards, badges, or layout components. Vignettes must use only what rek-room actually styles: headings, paragraphs, buttons, forms, tables, lists, media, details, dialog, progress, popover, scrollbars.

---

## 10. Vignette Navigation: Inline Labels Only (No Nav Chrome)

**Decision:** No pill bar, no side rail dots — just inline section labels within the scroll area.

**Alternatives considered:**
- (A) Horizontal pill bar — clear but takes vertical space
- (B) Side rail dots — compact but less discoverable

**Why:** The panel-to-preview link (expanding a category auto-scrolls to the vignette) IS the navigation. Adding separate nav chrome is redundant. Start minimal, add explicit nav later only if needed.

**Category-to-vignette mapping:**
| Category | Scrolls to |
|----------|-----------|
| Colors | Typography |
| Typography | Typography |
| Spacing | Forms |
| Borders & Radius | Forms |
| Elevation | Dialog |
| Animation | Dialog |
| Controls | Buttons |

---

## 11. Token Scope: All Categories, Collapsed UI ✦

**Decision:** All 7 token categories available from day one. All accordion sections collapsed by default, single-open behavior.

**Evolution:** Originally defaulted to Colors expanded. Changed to all-collapsed to treat all categories equally and give users a full map of what's available before they commit attention. Reduces initial layout shift and keeps the preview area as the visual anchor on load.

---

## 12. Source vs. Derived Tokens

**Decision:** Only source tokens get editable controls. Derived tokens shown read-only with "override" links.

**Example:** `--color-primary` is editable. `--color-action` (which maps to `--color-primary`) is shown in a "Derives →" sub-section. Clicking "override" on a derived token promotes it to an independent control.

**Principle:** Everything is overridable. Smart defaults with full override capability.

---

## 13. Light/Dark Mode Handling

**Decision:** Three modes (Light | Dark | Both). In "Both" mode, semantic tokens show paired L/D inputs. Auto-generate dark values from light picks, but every value is fully overridable.

**Key principle from user:** "I just want to make sure everything is overridable." No locked values, ever.

---

## 14. Type Scale: Ratio vs. Individual

**Decision:** Default to ratio-driven mode. Toggle to unlock individual heading sizes. Re-locking recomputes from ratio with AlertDialog confirmation.

**Why:** Rek-room's type scale uses `pow()` with a single ratio, which is elegant. But some users need specific heading sizes. The toggle gives both workflows without cluttering the default experience.

---

## 15. Gradient Support

**Decision:** Figma-style gradient toggle icon with Shadcn Tooltip on hover. Available on applicable color tokens (surfaces, backgrounds).

**Icon:** Figma's pattern — half solid / half gradient swatch. NOT the ∇ (nabla) symbol, which was a placeholder. Tooltip says "Switch to gradient" or "Switch to solid".

---

## 16. Reset All Confirmation

**Decision:** Shadcn AlertDialog with explicit message: "This will reset all X changed tokens to their defaults. This can't be undone."

**Why:** User raised this — resetting all overrides is destructive and needs a confirmation gate.

---

## 17. Custom Fonts

**Decision:** Curated Google Fonts list (searchable combobox) + "Custom..." option for pasting font-family strings.

**Handling:** Google Fonts loaded dynamically into preview iframes. Custom fonts fall back to system font in preview but export includes the custom value. Export includes `@import` statement for Google Fonts used.

---

## 18. Contrast Ratio Feedback

**Decision:** Small color-coded dots next to text color controls. Ratio shown in Tooltip on hover.

**Alternatives considered:**
- (A) Pill badges with ratio numbers — most scannable, takes most space
- (B) Inline ratio text — lighter weight
- (C) Dot indicator with tooltip — most compact ✓

**Why:** Dots are compact and unobtrusive. Green = AAA (7:1+), Yellow = AA (4.5:1+), Red = fail. In "Both" mode, two dots (one per mode). Exact ratio + WCAG level in Tooltip on hover.

---

## 19. Undo/Redo

**Decision:** Snapshot-based history (array of overrides maps), keyboard-only (Cmd+Z / Cmd+Shift+Z), max 50 snapshots.

**Why:** No visible buttons — both designers and developers expect these shortcuts. The overrides map is small enough to copy cheaply, so snapshots are simpler than diffing.

---

## 20. Persistence: localStorage (Not URL Sharing)

**Decision:** Auto-save to localStorage. No share URLs, no accounts.

**User initiated:** User suggested dropping the share URL in favor of localStorage. This eliminated `lz-string` dependency, URL hash encoding, and the URL length concern entirely.

**Sharing mechanism:** Export the CSS file. If someone wants to share their config, they share the CSS.

---

## 21. Rek-room Loading

**Decision:** Bundle rek-room's compiled CSS as a static asset at build time. Version locked to `package.json`.

**Alternative considered:**
- (B) CDN loading with version selector — more complex, CORS concerns

**Why:** Simpler, no external runtime dependency, no CORS. Version selector can come later.

---

## 22. Token Registry Maintenance

**Decision:** Build-time script auto-generates registry by parsing rek-room's source CSS. Metadata (labels, categories, ranges) in a separate hand-maintained config.

**Alternative considered:**
- (A) Fully manual registry — error-prone, misses new tokens on upgrade

**Why:** Auto-extraction catches new/removed tokens automatically. Upgrading rek-room is `npm update` → run script → check new tokens need metadata.

---

## 23. Elevation Controls

**Decision:** Hybrid — compact shadow preview swatch, popover with individual sliders on click.

**Alternatives considered:**
- (A) Full shadow builder always visible — 25 controls (5 levels × 5 params)
- (B) Raw text input — not designer-friendly

**Why:** Most people won't touch elevation. Compact by default, full control on demand.

**Note from review:** Rek-room's elevation values are multi-layer `light-dark()` shadows — parsing/rebuilding in the editor will be non-trivial.

---

## 24. Border Style Control

**Decision:** Select dropdown with inline style preview lines.

**Straightforward:** Options are the standard CSS border-style values (solid, dashed, dotted, etc.). Each shows a small visual preview in the dropdown.

---

## 25. Performance

**Decision:** Throttle postMessage to requestAnimationFrame (~60fps), batch all properties into single messages, update via single `<style>` element textContent.

**Why:** Two iframes being updated on every slider drag could be janky without throttling.

---

## 26. Copy Individual Token — Dropped

**Decision:** Not included.

**Why:** User questioned the use case. If someone wants one value, they can read it. If they want multiple, they use export. The feature seemed nice but didn't solve a real problem. YAGNI.

---

## 27. Dark Iframe: Bundled Source CSS ✦

**Decision:** Bundle rek-room's source CSS at build time by inlining its `@import` tree into a single file (`public/rek-room-source.css`). Dark iframe uses `?scheme=dark` query parameter.

**Problem:** The compiled `dist/steez.css` resolves `light-dark()` calls in custom property values to their light-mode values at build time. `--color-surface: light-dark(var(--color-white), var(--color-neutral-9))` becomes `--color-surface: #fff` — dark mode tokens are lost.

**Original fix:** Loaded source CSS from rek-room's Vite dev server at runtime. Required two servers running simultaneously.

**Final fix:** A build script (`scripts/bundle-source-css.ts`) inlines rek-room's 20 `@import` files into a single 58KB CSS file preserving all `light-dark()` calls. The app is now fully self-contained and deployable to Vercel with no runtime dependency.

**Tradeoff:** Source CSS must be rebundled when rek-room changes (`npm run prebuild`). Acceptable — same workflow as updating the token registry.

---

## 28. Editor Dark Mode: next-themes + Graphite Theme

**Decision:** Use `next-themes` for editor UI dark mode with the Graphite theme preset from shadcn/tweakcn.

**Theme:** Graphite — neutral grey palette (`#f0f0f0` light / `#1a1a1a` dark), tight `0.35rem` border radius, muted charcoal tones.

**Font:** Geist (via `next/font/google`) — kept instead of Graphite's suggested Montserrat/Inter. Declared directly in `@theme inline` as `"Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif` (not via `var()` reference, which creates circular resolution in Tailwind v4's theme block).

**Toggle behavior:** Defaults to system preference. Button cycles between light (sun icon) and dark (moon icon) — no "system" state exposed in the toggle since users don't need a third state. Tooltip: "Toggle UI theme".

---

## 29. Resizable Control Panel

**Decision:** Panel width is user-resizable via a drag handle on the left edge.

**Implementation:** Pointer events with `setPointerCapture` for smooth dragging. Default 400px, clamped to 280–600px range. The handle is a 6px-wide strip with `cursor: col-resize` and subtle hover/active highlights.

**Why:** Fixed width was too constrained for some token categories (especially colors with paired L/D swatches and contrast dots). Users can widen the panel when needed.

---

## 30. Unified Tab Styles in Top Bar

**Decision:** Both the Vignettes/Kitchen Sink toggle and the Light/Dark/Both toggle use the same `TabsList`/`TabsTrigger` components.

**Why:** Originally the mode selector used `ToggleGroup`/`ToggleGroupItem` which had a visually different style. Unifying to the same tab component makes the top bar look cohesive. The top bar background also matches the panel (`bg-background`) instead of the previous `bg-muted/50`.

---

## 31. Context Value Memoization ✦

**Decision:** Wrap TokenContext provider value in `useMemo` with explicit dependencies.

**Why:** The context had 13+ consumers. Without memoization, every state change (even to unrelated fields like `expandedCategory`) re-rendered every control. A single `useMemo` prevents this without the complexity of splitting into multiple contexts.

---

## 32. Module-Level Token Lookups ✦

**Decision:** Pre-compute `TOKENS_BY_CATEGORY` and `SOURCE_KEYS_BY_CATEGORY` as module-level `Map` objects instead of calling `.filter()` on TOKEN_REGISTRY per render.

**Why:** TOKEN_REGISTRY is static — it never changes at runtime. Computing lookups once at import time is correct and eliminates 7+ filter calls per render cycle.

---

## 33. Specific CSS Transition Properties ✦

**Decision:** Replace all `transition-all` with specific property lists (`transition-[opacity,transform]`, `transition-[border-color,box-shadow]`, etc.).

**Why:** `transition-all` transitions layout properties that shouldn't animate (padding, margin during theme switches). Specifying exact properties prevents accidental animations and lets the browser optimize compositing.

---

## 34. CSS Cross-Fade for Theme Icon ✦

**Decision:** Both Sun and Moon icons always mounted in the DOM; cross-faded with CSS transitions instead of conditional rendering or a motion library.

**Why:** Avoids adding framer-motion as a dependency for a single animation. CSS transitions handle interruption naturally if the user clicks rapidly. Uses `opacity`, `scale(0.25→1)`, and `blur(4px→0)` with `cubic-bezier(0.2, 0, 0, 1)`.

---

## 35. Project Rename: Combobulator → Steez ✦

**Decision:** Renamed from "The Rek-Room Combobulator" to "Steez" — matching the rek-room compiled CSS output filename (`steez.css`) and the SVG logo.

---

## Decisions Made by User (Non-Negotiable)

These were stated as requirements, not open to alternatives:
- Next.js + Tailwind + TypeScript (tech stack)
- Separate repo from rek-room
- Panel on the right side
- Mode selector order: Light | Dark | Both
- Light/dark iframes must scroll in sync (not independently)
- All token categories in v1 (not a subset)
- Everything must be overridable
- Geist font for the editor UI
- Graphite theme for shadcn components
