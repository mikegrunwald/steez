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

function getSourceTokenKeys(category: TokenCategory): Set<string> {
  const allKeys = new Set(TOKEN_REGISTRY.map((t) => t.key));
  const derived = new Set(
    TOKEN_REGISTRY.filter((t) => t.derivedFrom && t.category === category).map(
      (t) => t.derivedFrom as string
    )
  );
  // Only include sources that are actually in the registry
  return new Set([...derived].filter((k) => allKeys.has(k)));
}

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
  const sourceKeys = getSourceTokenKeys(category);

  // Filter out derived tokens so they appear under their source only
  const topLevelTokens = tokens.filter((t) => !t.derivedFrom);

  // Heading size tokens to conditionally show
  const headingTokens = tokens.filter((t) => HEADING_KEYS.has(t.key));
  const nonHeadingTokens = topLevelTokens.filter((t) => !HEADING_KEYS.has(t.key));

  const renderToken = (token: TokenDefinition) => {
    const hasDerived = sourceKeys.has(token.key);

    return (
      <div key={token.key} className="flex flex-col">
        <div className="flex items-center justify-between gap-4 py-1.5">
          <span className="text-sm font-medium shrink-0 min-w-0 text-foreground">
            {token.label}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <TokenControl token={token} />
          </div>
        </div>
        {hasDerived && <DerivedTokens sourceTokenKey={token.key} />}
      </div>
    );
  };

  if (isTypography) {
    return (
      <div className="flex flex-col gap-0.5">
        {nonHeadingTokens.map(renderToken)}
        <TypeScaleToggle />
        {typeScaleUnlocked && headingTokens.map(renderToken)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {topLevelTokens.map(renderToken)}
    </div>
  );
}
