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
