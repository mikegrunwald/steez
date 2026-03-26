'use client';

import type { TokenCategory, TokenDefinition } from '@/lib/tokens/types';
import { TOKEN_REGISTRY } from '@/lib/tokens/registry';
import { useTokens } from '@/lib/state/token-context';

import { ColorControl } from '@/components/controls/color-control';
import { ColorPairControl } from '@/components/controls/color-pair-control';
import { DimensionControl } from '@/components/controls/dimension-control';
import { RatioControl } from '@/components/controls/ratio-control';
import { FontControl } from '@/components/controls/font-control';
import { WeightControl } from '@/components/controls/weight-control';
import { DurationControl } from '@/components/controls/duration-control';
import { EasingControl } from '@/components/controls/easing-control';
import { ShadowControl } from '@/components/controls/shadow-control';
import { BorderStyleControl } from '@/components/controls/border-style-control';
import { DerivedTokens } from '@/components/panel/derived-tokens';
import { TypeScaleToggle } from '@/components/panel/type-scale-toggle';

interface TokenGroupProps {
  category: TokenCategory;
  tokens: TokenDefinition[];
}

const HEADING_KEYS = new Set([
  '--font-size-h1',
  '--font-size-h2',
  '--font-size-h3',
  '--font-size-h4',
  '--font-size-h5',
  '--font-size-h6',
]);

// Pre-compute source token keys per category at module level (TOKEN_REGISTRY is static)
const SOURCE_KEYS_BY_CATEGORY = (() => {
  const allKeys = new Set(TOKEN_REGISTRY.map((t) => t.key));
  const map = new Map<TokenCategory, Set<string>>();
  for (const t of TOKEN_REGISTRY) {
    if (t.derivedFrom && allKeys.has(t.derivedFrom)) {
      if (!map.has(t.category)) map.set(t.category, new Set());
      map.get(t.category)!.add(t.derivedFrom);
    }
  }
  return map;
})();

function TokenControl({ token }: { token: TokenDefinition }) {
  if (token.type === 'color' && token.lightDark) {
    return <ColorPairControl token={token} />;
  }
  switch (token.type) {
    case 'color':
      return <ColorControl token={token} />;
    case 'dimension':
      return <DimensionControl token={token} />;
    case 'ratio':
      return <RatioControl token={token} />;
    case 'font':
      return <FontControl token={token} />;
    case 'weight':
      return <WeightControl token={token} />;
    case 'duration':
      return <DurationControl token={token} />;
    case 'easing':
      return <EasingControl token={token} />;
    case 'shadow':
      return <ShadowControl token={token} />;
    case 'border-style':
      return <BorderStyleControl token={token} />;
    default:
      return null;
  }
}

export function TokenGroup({ category, tokens }: TokenGroupProps) {
  const { typeScaleUnlocked } = useTokens();
  const isTypography = category === 'typography';

  // Tokens that have derived children within this category
  const sourceKeys = SOURCE_KEYS_BY_CATEGORY.get(category) ?? new Set<string>();

  // Filter out derived tokens and hidden constants
  const topLevelTokens = tokens.filter((t) => !t.derivedFrom && !t.hidden);

  // Heading size tokens to conditionally show
  const headingTokens = tokens.filter((t) => HEADING_KEYS.has(t.key) && !t.hidden);
  const nonHeadingTokens = topLevelTokens.filter((t) => !HEADING_KEYS.has(t.key));

  const renderToken = (token: TokenDefinition) => {
    const hasDerived = sourceKeys.has(token.key);

    return (
      <div key={token.key} className="flex flex-col">
        <div className="group/row flex items-center justify-between gap-4 min-h-[40px]">
          <span className="text-xs font-medium shrink-0 min-w-0 text-muted-foreground group-has-[input:focus]/row:hidden">
            {token.label}
          </span>
          <div className="flex items-center gap-2 shrink-0 group-has-[input:focus]/row:flex-1 group-has-[input:focus]/row:shrink group-has-[input:focus]/row:min-w-0">
            <TokenControl token={token} />
          </div>
        </div>
        {hasDerived && <DerivedTokens sourceTokenKey={token.key} />}
      </div>
    );
  };

  if (isTypography) {
    return (
      <div className="flex flex-col">
        {nonHeadingTokens.map(renderToken)}
        <TypeScaleToggle />
        {typeScaleUnlocked && headingTokens.map(renderToken)}
      </div>
    );
  }

  // Color subcategory grouping
  const isColors = category === 'colors';
  if (isColors) {
    const SUBCATEGORY_ORDER = ['Palette', 'Brand', 'Semantic'];
    const grouped = new Map<string, TokenDefinition[]>();
    const ungrouped: TokenDefinition[] = [];

    for (const token of topLevelTokens) {
      const sub = token.subcategory;
      if (sub) {
        if (!grouped.has(sub)) grouped.set(sub, []);
        grouped.get(sub)!.push(token);
      } else {
        ungrouped.push(token);
      }
    }

    return (
      <div className="flex flex-col">
        {ungrouped.map(renderToken)}
        {SUBCATEGORY_ORDER.map((sub) => {
          const group = grouped.get(sub);
          if (!group?.length) return null;
          return (
            <div key={sub}>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 pb-2 border-b border-border mb-1.5">
                {sub}
              </div>
              {group.map(renderToken)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {topLevelTokens.map(renderToken)}
    </div>
  );
}
