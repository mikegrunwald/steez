'use client';

/**
 * Visual prototype page for the @{} alias display protocol.
 * Shows three styling options for alias pills so the user can pick one.
 * TEMPORARY — delete after decision is made.
 */

/* ── Example data ───────────────────────────────────────── */

type Segment =
  | { type: 'ref'; label: string; color?: string }
  | { type: 'text'; text: string };

const EXAMPLES: { title: string; description: string; segments: Segment[] }[] = [
  {
    title: 'Pure alias — weight',
    description: 'var(--font-weight-bold)',
    segments: [{ type: 'ref', label: 'Bold' }],
  },
  {
    title: 'Pure alias — easing',
    description: 'var(--ease-out-cubic)',
    segments: [{ type: 'ref', label: 'ease-out-cubic' }],
  },
  {
    title: 'Color alias',
    description: 'var(--color-primary)',
    segments: [{ type: 'ref', label: 'primary', color: '#81A1C1' }],
  },
  {
    title: 'Derived — spacing',
    description: 'calc(var(--spacing-base) × 0.375)',
    segments: [
      { type: 'ref', label: 'spacing-base' },
      { type: 'text', text: ' × 0.375' },
    ],
  },
  {
    title: 'Derived — type scale',
    description: 'calc(var(--font-size-base) × var(--type-ratio)³)',
    segments: [
      { type: 'ref', label: 'base' },
      { type: 'text', text: ' × ' },
      { type: 'ref', label: 'ratio' },
      { type: 'text', text: '³' },
    ],
  },
  {
    title: 'Light/dark color pair',
    description: 'light-dark(var(--color-white), var(--color-neutral-9))',
    segments: [
      { type: 'ref', label: 'white', color: '#ffffff' },
      { type: 'text', text: ' / ' },
      { type: 'ref', label: 'neutral-9', color: '#1a1a2e' },
    ],
  },
  {
    title: 'Derived — duration',
    description: 'calc(var(--animation-duration) ÷ 2)',
    segments: [
      { type: 'ref', label: 'duration' },
      { type: 'text', text: ' ÷ 2' },
    ],
  },
  {
    title: 'Font alias',
    description: 'var(--font-primary-stack)',
    segments: [{ type: 'ref', label: 'Primary Font Stack' }],
  },
];

/* ── Renderers ──────────────────────────────────────────── */

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 rounded-sm border border-current/20 align-middle"
      style={{ backgroundColor: color }}
    />
  );
}

/* Style A — Pill badge */
function PillRef({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
      <span className="text-primary font-semibold">@</span>
      {color && <ColorSwatch color={color} />}
      <span className="text-foreground">{label}</span>
    </span>
  );
}

function PillStyle({ segments }: { segments: Segment[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-xs">
      {segments.map((seg, i) =>
        seg.type === 'ref' ? (
          <PillRef key={i} label={seg.label} color={seg.color} />
        ) : (
          <span key={i} className="text-muted-foreground font-mono">
            {seg.text}
          </span>
        ),
      )}
    </span>
  );
}

/* Style B — Monospace inline */
function MonoRef({ label, color }: { label: string; color?: string }) {
  return (
    <span className="font-mono text-xs">
      <span className="text-primary font-semibold">@</span>
      {color && (
        <>
          <ColorSwatch color={color} />{' '}
        </>
      )}
      <span className="text-foreground">{label}</span>
    </span>
  );
}

function MonoStyle({ segments }: { segments: Segment[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-0.5 text-xs font-mono">
      {segments.map((seg, i) =>
        seg.type === 'ref' ? (
          <MonoRef key={i} label={seg.label} color={seg.color} />
        ) : (
          <span key={i} className="text-muted-foreground">
            {seg.text}
          </span>
        ),
      )}
    </span>
  );
}

/* Style C — Bordered inline */
function BorderRef({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs font-mono">
      <span className="text-primary font-semibold">@</span>
      {color && <ColorSwatch color={color} />}
      <span className="text-foreground">{label}</span>
    </span>
  );
}

function BorderStyle({ segments }: { segments: Segment[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-xs">
      {segments.map((seg, i) =>
        seg.type === 'ref' ? (
          <BorderRef key={i} label={seg.label} color={seg.color} />
        ) : (
          <span key={i} className="text-muted-foreground font-mono">
            {seg.text}
          </span>
        ),
      )}
    </span>
  );
}

/* ── Page ───────────────────────────────────────────────── */

const STYLES = [
  { name: 'Pill Badge', description: 'Rounded chip with muted background fill', Component: PillStyle },
  { name: 'Monospace Inline', description: 'Colored mono text, no background or border', Component: MonoStyle },
  { name: 'Bordered Inline', description: 'Thin border + radius, no fill', Component: BorderStyle },
] as const;

export default function PrototypePage() {
  return (
    <div className="fixed inset-0 bg-background text-foreground p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            @&#123;&#125; Alias Display Prototype
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare three visual styles for displaying token aliases and derived expressions. Pick the one that feels right.
          </p>
        </div>

        {STYLES.map(({ name, description, Component }) => (
          <section key={name} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground w-1/4">Token</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground w-1/3">CSS Value</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Rendered</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((ex, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3 text-xs font-medium">{ex.title}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{ex.description}</td>
                      <td className="px-4 py-3">
                        <Component segments={ex.segments} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Side-by-side comparison in a control-panel-like context */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">In Context — Control Panel Row</h2>
            <p className="text-xs text-muted-foreground">How each style looks in a typical token control row (12px base font)</p>
          </div>

          {STYLES.map(({ name, Component }) => (
            <div key={name} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{name}</p>

              {/* Simulate control panel rows at 12px */}
              <div className="text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Heading Weight</span>
                  <Component segments={[{ type: 'ref', label: 'Bold' }]} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Animation Timing</span>
                  <Component segments={[{ type: 'ref', label: 'ease-out-cubic' }]} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Spacing XS</span>
                  <Component
                    segments={[
                      { type: 'ref', label: 'spacing-base' },
                      { type: 'text', text: ' × 0.375' },
                    ]}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Border Color</span>
                  <Component segments={[{ type: 'ref', label: 'border', color: '#81A1C1' }]} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Surface</span>
                  <Component
                    segments={[
                      { type: 'ref', label: 'white', color: '#ffffff' },
                      { type: 'text', text: ' / ' },
                      { type: 'ref', label: 'neutral-9', color: '#1a1a2e' },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
