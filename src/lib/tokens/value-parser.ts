/**
 * CSS value parser — identifies var() references in token values
 * for rendering with the @{} alias display protocol.
 */

export type ValueSegment =
  | { type: 'text'; text: string }
  | { type: 'ref'; tokenKey: string };

/**
 * Parse a CSS value string into segments of plain text and var() references.
 * Simplifies calc() expressions for human-readable display.
 */
export function parseValueExpression(value: string): ValueSegment[] {
  // No var() references — return as plain text
  if (!value.includes('var(')) {
    return [{ type: 'text', text: value }];
  }

  // Simple var() reference (entire value is just a var ref)
  const simpleVar = value.match(/^var\((.+?)\)$/);
  if (simpleVar) {
    return [{ type: 'ref', tokenKey: simpleVar[1] }];
  }

  // Strip outer calc() wrapper for display
  let display = value;
  if (display.startsWith('calc(') && display.endsWith(')')) {
    display = display.slice(5, -1);
  }

  // Handle pow() — replace pow(var(--x), N) with var(--x) superscript
  display = display.replace(
    /pow\(var\(([^)]+)\)\s*,\s*(\d+)\)/g,
    (_, varName, exp) => `var(${varName})${toSuperscript(exp)}`,
  );

  // Now split on var() references
  const segments: ValueSegment[] = [];
  const varPattern = /var\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = varPattern.exec(display)) !== null) {
    // Text before this var()
    if (match.index > lastIndex) {
      const text = simplifyMath(display.slice(lastIndex, match.index));
      if (text.trim()) {
        segments.push({ type: 'text', text });
      }
    }

    segments.push({ type: 'ref', tokenKey: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Text after the last var()
  if (lastIndex < display.length) {
    const text = simplifyMath(display.slice(lastIndex));
    if (text.trim()) {
      segments.push({ type: 'text', text });
    }
  }

  return segments;
}

/** Replace * with ×, / with ÷ for display */
function simplifyMath(text: string): string {
  return text
    .replace(/\s*\*\s*/g, ' × ')
    .replace(/\s*\/\s*/g, ' ÷ ');
}

/** Convert a number string to superscript unicode */
function toSuperscript(num: string): string {
  const map: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return [...num].map((ch) => map[ch] ?? ch).join('');
}

/**
 * Check if a CSS value contains any var() references.
 */
export function hasVarReference(value: string): boolean {
  return value.includes('var(');
}
