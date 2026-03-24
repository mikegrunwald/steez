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
