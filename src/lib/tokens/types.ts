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
  hidden?: boolean;
  subcategory?: string;
};

export type OverridesMap = Record<string, string>;

export type PreviewMode = 'vignettes' | 'kitchen-sink';

export type ColorSchemeMode = 'light' | 'dark' | 'both';

// Category-to-section scroll mapping (keyed by preview mode)
export const CATEGORY_VIGNETTE_MAP: Record<TokenCategory, string> = {
  colors: 'typography',
  typography: 'typography',
  spacing: 'forms',
  borders: 'forms',
  elevation: 'dialog',
  animation: 'dialog',
  controls: 'buttons',
};

export const CATEGORY_KITCHEN_SINK_MAP: Record<TokenCategory, string> = {
  colors: 'ks-colors',
  typography: 'ks-headings',
  spacing: 'ks-form-elements',
  borders: 'ks-form-elements',
  elevation: 'ks-dialog',
  animation: 'ks-dialog',
  controls: 'ks-form-elements',
};
