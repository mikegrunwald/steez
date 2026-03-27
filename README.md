# STEEZ :: The Rek-Room Combobulator

**[Live Demo](https://combobulator.vercel.app)**

A visual design token editor for [rek-room](https://github.com/mikegrunwald/rek-room), the zero-dependency CSS framework. Edit colors, typography, spacing, borders, elevation, animation, and control tokens with live light/dark preview — then export a clean CSS overrides file.

## Tech Stack

* **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
* **shadcn/ui** (Base UI primitives) with Graphite theme
* **react-colorful** — lightweight color picker (2KB)
* **cmdk** — searchable comboboxes (fonts, easings, weights, ratios)
* **next-themes** — editor dark mode
* **React Compiler** enabled
* **~7, 000 lines** of TypeScript/TSX

## Getting Started

Rek-room's source CSS is bundled at build time to preserve `light-dark()` function calls that compiled CSS resolves away. No separate dev server needed.

```bash
# Clone both repos side by side (rek-room is a local dependency)
git clone https://github.com/mikegrunwald/rek-room.git
git clone <this-repo> steez

# Install dependencies
cd rek-room && npm install && cd ..
cd steez && npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js pages and layout
├── components/
│   ├── preview/            # Iframe container, sync scrolling, postMessage
│   │   ├── preview-area.tsx    # Top bar + dual iframe layout
│   │   └── preview-iframe.tsx  # Single iframe + message handling
│   ├── panel/              # Accordion, token groups, derived tokens
│   │   ├── control-panel.tsx   # Panel shell, header, resize handle
│   │   ├── token-group.tsx     # Category renderer with subcategories
│   │   ├── derived-tokens.tsx  # Collapsible derived token display
│   │   └── type-scale-toggle.tsx
│   ├── controls/           # One per token type
│   │   ├── color-control.tsx, color-pair-control.tsx
│   │   ├── dimension-control.tsx, ratio-control.tsx
│   │   ├── font-control.tsx, weight-control.tsx
│   │   ├── duration-control.tsx, easing-control.tsx
│   │   ├── shadow-control.tsx, border-style-control.tsx
│   │   └── gradient-builder.tsx
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── tokens/             # Registry (auto-generated), metadata, types
│   ├── state/              # React Context + useMemo, undo/redo, localStorage
│   ├── preview/            # postMessage protocol, CSS generation
│   ├── export/             # CSS export with font imports
│   ├── contrast.ts         # WCAG luminance + ratio calculation
│   └── google-fonts.ts     # Curated font list + URL builder
├── scripts/
│   ├── generate-registry.ts    # Parse rek-room CSS → token definitions
│   └── bundle-source-css.ts    # Inline @imports → single CSS file
└── public/
    ├── preview.html            # Static HTML for preview iframes
    ├── rek-room-source.css     # Bundled source CSS (preserves light-dark())
    └── steez.svg               # Logo
```
