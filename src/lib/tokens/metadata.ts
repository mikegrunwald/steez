import type { TokenDefinition } from './types';

export const TOKEN_METADATA: Record<string, Omit<TokenDefinition, 'key' | 'defaultValue'>> = {

  // ── Palette: Base ──
  '--color-black': { label: 'Black', type: 'color', category: 'colors' },
  '--color-white': { label: 'White', type: 'color', category: 'colors' },
  '--color-yellow': { label: 'Yellow', type: 'color', category: 'colors' },
  '--color-red': { label: 'Red', type: 'color', category: 'colors' },
  '--color-green': { label: 'Green', type: 'color', category: 'colors' },

  // ── Palette: Neutral Scale ──
  '--color-neutral-0': { label: 'Neutral 0', type: 'color', category: 'colors', derivedFrom: '--color-white' },
  '--color-neutral-1': { label: 'Neutral 1', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-2': { label: 'Neutral 2', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-3': { label: 'Neutral 3', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-4': { label: 'Neutral 4', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-5': { label: 'Neutral 5', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-6': { label: 'Neutral 6', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-7': { label: 'Neutral 7', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-8': { label: 'Neutral 8', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-9': { label: 'Neutral 9', type: 'color', category: 'colors', derivedFrom: '--color-neutral-10' },
  '--color-neutral-10': { label: 'Neutral 10', type: 'color', category: 'colors', derivedFrom: '--color-black' },

  // ── Palette: Primary ──
  '--color-primary': { label: 'Primary', type: 'color', category: 'colors' },
  '--color-primary-light': { label: 'Primary Light', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-primary-dark': { label: 'Primary Dark', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-primary-light-contrast': { label: 'Primary Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-primary-dark-contrast': { label: 'Primary Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-primary' },

  // ── Palette: Secondary ──
  '--color-secondary': { label: 'Secondary', type: 'color', category: 'colors' },
  '--color-secondary-light': { label: 'Secondary Light', type: 'color', category: 'colors', derivedFrom: '--color-secondary' },
  '--color-secondary-dark': { label: 'Secondary Dark', type: 'color', category: 'colors', derivedFrom: '--color-secondary' },
  '--color-secondary-light-contrast': { label: 'Secondary Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-secondary' },
  '--color-secondary-dark-contrast': { label: 'Secondary Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-secondary' },

  // ── Palette: Tertiary ──
  '--color-tertiary': { label: 'Tertiary', type: 'color', category: 'colors' },
  '--color-tertiary-light': { label: 'Tertiary Light', type: 'color', category: 'colors', derivedFrom: '--color-tertiary' },
  '--color-tertiary-dark': { label: 'Tertiary Dark', type: 'color', category: 'colors', derivedFrom: '--color-tertiary' },
  '--color-tertiary-light-contrast': { label: 'Tertiary Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-tertiary' },
  '--color-tertiary-dark-contrast': { label: 'Tertiary Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-tertiary' },

  // ── Role Colors: Action ──
  '--color-action': { label: 'Action', type: 'color', category: 'colors', derivedFrom: '--color-primary' },
  '--color-action-light': { label: 'Action Light', type: 'color', category: 'colors', derivedFrom: '--color-action' },
  '--color-action-dark': { label: 'Action Dark', type: 'color', category: 'colors', derivedFrom: '--color-action' },
  '--color-action-light-contrast': { label: 'Action Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-action' },
  '--color-action-dark-contrast': { label: 'Action Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-action' },

  // ── Role Colors: Highlight ──
  '--color-highlight': { label: 'Highlight', type: 'color', category: 'colors', derivedFrom: '--color-secondary' },
  '--color-highlight-light': { label: 'Highlight Light', type: 'color', category: 'colors', derivedFrom: '--color-highlight' },
  '--color-highlight-dark': { label: 'Highlight Dark', type: 'color', category: 'colors', derivedFrom: '--color-highlight' },
  '--color-highlight-light-contrast': { label: 'Highlight Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-highlight' },
  '--color-highlight-dark-contrast': { label: 'Highlight Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-highlight' },

  // ── Status Colors: Success ──
  '--color-success': { label: 'Success', type: 'color', category: 'colors', derivedFrom: '--color-green' },
  '--color-success-light': { label: 'Success Light', type: 'color', category: 'colors', derivedFrom: '--color-success' },
  '--color-success-dark': { label: 'Success Dark', type: 'color', category: 'colors', derivedFrom: '--color-success' },
  '--color-success-light-contrast': { label: 'Success Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-success' },
  '--color-success-dark-contrast': { label: 'Success Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-success' },

  // ── Status Colors: Warning ──
  '--color-warning': { label: 'Warning', type: 'color', category: 'colors', derivedFrom: '--color-yellow' },
  '--color-warning-light': { label: 'Warning Light', type: 'color', category: 'colors', derivedFrom: '--color-warning' },
  '--color-warning-dark': { label: 'Warning Dark', type: 'color', category: 'colors', derivedFrom: '--color-warning' },
  '--color-warning-light-contrast': { label: 'Warning Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-warning' },
  '--color-warning-dark-contrast': { label: 'Warning Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-warning' },

  // ── Status Colors: Error ──
  '--color-error': { label: 'Error', type: 'color', category: 'colors', derivedFrom: '--color-red' },
  '--color-error-light': { label: 'Error Light', type: 'color', category: 'colors', derivedFrom: '--color-error' },
  '--color-error-dark': { label: 'Error Dark', type: 'color', category: 'colors', derivedFrom: '--color-error' },
  '--color-error-light-contrast': { label: 'Error Light Contrast', type: 'color', category: 'colors', derivedFrom: '--color-error' },
  '--color-error-dark-contrast': { label: 'Error Dark Contrast', type: 'color', category: 'colors', derivedFrom: '--color-error' },

  // ── Semantic Colors ──
  '--color-surface': { label: 'Surface', type: 'color', category: 'colors', lightDark: true, gradient: true },
  '--color-surface-raised': { label: 'Surface Raised', type: 'color', category: 'colors', lightDark: true, gradient: true },
  '--color-text-primary': { label: 'Text Primary', type: 'color', category: 'colors', lightDark: true },
  '--color-text-secondary': { label: 'Text Secondary', type: 'color', category: 'colors', lightDark: true },
  '--color-text-tertiary': { label: 'Text Tertiary', type: 'color', category: 'colors', lightDark: true },
  '--color-text-body': { label: 'Text Body', type: 'color', category: 'colors', lightDark: true },
  '--color-border': { label: 'Border Color', type: 'color', category: 'colors', lightDark: true },
  '--color-viewport-background': { label: 'Viewport Background', type: 'color', category: 'colors', lightDark: true, gradient: true },

  // ── Typography: Font Stacks ──
  '--font-primary-stack': { label: 'Primary Font Stack', type: 'font', category: 'typography' },
  '--font-secondary-stack': { label: 'Secondary Font Stack', type: 'font', category: 'typography' },
  '--font-tertiary-stack': { label: 'Tertiary Font Stack', type: 'font', category: 'typography' },
  '--font-family': { label: 'Font Family', type: 'font', category: 'typography' },
  '--font-family-heading': { label: 'Heading Font Family', type: 'font', category: 'typography' },

  // ── Typography: Font Weights ──
  '--font-weight-thin': { label: 'Weight Thin', type: 'weight', category: 'typography' },
  '--font-weight-extra-light': { label: 'Weight Extra Light', type: 'weight', category: 'typography' },
  '--font-weight-light': { label: 'Weight Light', type: 'weight', category: 'typography' },
  '--font-weight-normal': { label: 'Weight Normal', type: 'weight', category: 'typography' },
  '--font-weight-medium': { label: 'Weight Medium', type: 'weight', category: 'typography' },
  '--font-weight-semi-bold': { label: 'Weight Semi Bold', type: 'weight', category: 'typography' },
  '--font-weight-bold': { label: 'Weight Bold', type: 'weight', category: 'typography' },
  '--font-weight-extra-bold': { label: 'Weight Extra Bold', type: 'weight', category: 'typography' },
  '--font-weight-black': { label: 'Weight Black', type: 'weight', category: 'typography' },
  '--font-weight-heading': { label: 'Heading Weight', type: 'weight', category: 'typography' },

  // ── Typography: Type Scale ──
  '--type-ratio': { label: 'Type Ratio', type: 'ratio', category: 'typography', min: 1.067, max: 1.618, step: 0.001 },
  '--font-size-base': { label: 'Font Size Base', type: 'dimension', category: 'typography', min: 12, max: 24, step: 1, unit: 'px' },
  '--font-size-h1': { label: 'Font Size H1', type: 'dimension', category: 'typography', min: 16, max: 96, step: 1, unit: 'px' },
  '--font-size-h2': { label: 'Font Size H2', type: 'dimension', category: 'typography', min: 14, max: 72, step: 1, unit: 'px' },
  '--font-size-h3': { label: 'Font Size H3', type: 'dimension', category: 'typography', min: 12, max: 60, step: 1, unit: 'px' },
  '--font-size-h4': { label: 'Font Size H4', type: 'dimension', category: 'typography', min: 12, max: 48, step: 1, unit: 'px' },
  '--font-size-h5': { label: 'Font Size H5', type: 'dimension', category: 'typography', min: 12, max: 36, step: 1, unit: 'px' },
  '--font-size-h6': { label: 'Font Size H6', type: 'dimension', category: 'typography', min: 10, max: 24, step: 1, unit: 'px' },
  '--font-size-display': { label: 'Font Size Display', type: 'dimension', category: 'typography', min: 24, max: 128, step: 1, unit: 'px' },
  '--font-size-body': { label: 'Font Size Body', type: 'dimension', category: 'typography', min: 12, max: 24, step: 1, unit: 'px' },
  '--font-size-body-sm': { label: 'Font Size Body SM', type: 'dimension', category: 'typography', min: 10, max: 20, step: 1, unit: 'px' },
  '--font-size-body-lg': { label: 'Font Size Body LG', type: 'dimension', category: 'typography', min: 14, max: 28, step: 1, unit: 'px' },

  // ── Typography: Line Heights ──
  '--line-height-reset': { label: 'Line Height Reset', type: 'dimension', category: 'typography', min: 0.8, max: 2.5, step: 0.05 },
  '--line-height-text': { label: 'Line Height Text', type: 'dimension', category: 'typography', min: 0.8, max: 2.5, step: 0.05 },
  '--line-height-heading': { label: 'Line Height Heading', type: 'dimension', category: 'typography', min: 0.8, max: 2.5, step: 0.05 },

  // ── Spacing ──
  '--spacing-base': { label: 'Spacing Base', type: 'dimension', category: 'spacing', min: 4, max: 32, step: 1, unit: 'px' },
  '--spacing-xs': { label: 'Spacing XS', type: 'dimension', category: 'spacing', min: 2, max: 16, step: 1, unit: 'px' },
  '--spacing-sm': { label: 'Spacing SM', type: 'dimension', category: 'spacing', min: 2, max: 24, step: 1, unit: 'px' },
  '--spacing-md': { label: 'Spacing MD', type: 'dimension', category: 'spacing', min: 4, max: 32, step: 1, unit: 'px' },
  '--spacing-lg': { label: 'Spacing LG', type: 'dimension', category: 'spacing', min: 8, max: 64, step: 1, unit: 'px' },
  '--spacing-xl': { label: 'Spacing XL', type: 'dimension', category: 'spacing', min: 8, max: 96, step: 1, unit: 'px' },

  // ── Animation/Easing: Basic ──
  '--linear': { label: 'Linear', type: 'easing', category: 'animation' },
  '--ease': { label: 'Ease', type: 'easing', category: 'animation' },
  '--ease-in': { label: 'Ease In', type: 'easing', category: 'animation' },
  '--ease-out': { label: 'Ease Out', type: 'easing', category: 'animation' },
  '--ease-in-out': { label: 'Ease In Out', type: 'easing', category: 'animation' },

  // ── Animation/Easing: Ease In Variants ──
  '--ease-in-quad': { label: 'Ease In Quad', type: 'easing', category: 'animation' },
  '--ease-in-cubic': { label: 'Ease In Cubic', type: 'easing', category: 'animation' },
  '--ease-in-quart': { label: 'Ease In Quart', type: 'easing', category: 'animation' },
  '--ease-in-quint': { label: 'Ease In Quint', type: 'easing', category: 'animation' },
  '--ease-in-sine': { label: 'Ease In Sine', type: 'easing', category: 'animation' },
  '--ease-in-expo': { label: 'Ease In Expo', type: 'easing', category: 'animation' },
  '--ease-in-circ': { label: 'Ease In Circ', type: 'easing', category: 'animation' },
  '--ease-in-back': { label: 'Ease In Back', type: 'easing', category: 'animation' },

  // ── Animation/Easing: Ease Out Variants ──
  '--ease-out-quad': { label: 'Ease Out Quad', type: 'easing', category: 'animation' },
  '--ease-out-cubic': { label: 'Ease Out Cubic', type: 'easing', category: 'animation' },
  '--ease-out-quart': { label: 'Ease Out Quart', type: 'easing', category: 'animation' },
  '--ease-out-quint': { label: 'Ease Out Quint', type: 'easing', category: 'animation' },
  '--ease-out-sine': { label: 'Ease Out Sine', type: 'easing', category: 'animation' },
  '--ease-out-expo': { label: 'Ease Out Expo', type: 'easing', category: 'animation' },
  '--ease-out-circ': { label: 'Ease Out Circ', type: 'easing', category: 'animation' },
  '--ease-out-back': { label: 'Ease Out Back', type: 'easing', category: 'animation' },

  // ── Animation/Easing: Ease In-Out Variants ──
  '--ease-in-out-quad': { label: 'Ease In Out Quad', type: 'easing', category: 'animation' },
  '--ease-in-out-cubic': { label: 'Ease In Out Cubic', type: 'easing', category: 'animation' },
  '--ease-in-out-quart': { label: 'Ease In Out Quart', type: 'easing', category: 'animation' },
  '--ease-in-out-quint': { label: 'Ease In Out Quint', type: 'easing', category: 'animation' },
  '--ease-in-out-sine': { label: 'Ease In Out Sine', type: 'easing', category: 'animation' },
  '--ease-in-out-expo': { label: 'Ease In Out Expo', type: 'easing', category: 'animation' },
  '--ease-in-out-circ': { label: 'Ease In Out Circ', type: 'easing', category: 'animation' },
  '--ease-in-out-back': { label: 'Ease In Out Back', type: 'easing', category: 'animation' },

  // ── Animation: Duration & Timing ──
  '--animation-duration': { label: 'Animation Duration', type: 'duration', category: 'animation', min: 0.05, max: 2, step: 0.05, unit: 's' },
  '--animation-duration-slow': { label: 'Animation Duration Slow', type: 'duration', category: 'animation', min: 0.1, max: 4, step: 0.05, unit: 's' },
  '--animation-duration-fast': { label: 'Animation Duration Fast', type: 'duration', category: 'animation', min: 0.01, max: 1, step: 0.01, unit: 's' },
  '--animation-timing': { label: 'Animation Timing', type: 'easing', category: 'animation' },

  // ── Borders ──
  '--border-width': { label: 'Border Width', type: 'dimension', category: 'borders', min: 0, max: 8, step: 1, unit: 'px' },
  '--border-style': { label: 'Border Style', type: 'border-style', category: 'borders' },
  '--border-color': { label: 'Border Color', type: 'color', category: 'borders' },
  '--border-radius': { label: 'Border Radius', type: 'dimension', category: 'borders', min: 0, max: 24, step: 1, unit: 'px' },
  '--focus-outline-width': { label: 'Focus Outline Width', type: 'dimension', category: 'borders', min: 1, max: 6, step: 1, unit: 'px' },
  '--focus-outline-offset': { label: 'Focus Outline Offset', type: 'dimension', category: 'borders', min: 0, max: 8, step: 1, unit: 'px' },

  // ── Elevation ──
  '--elevation-1': { label: 'Elevation 1', type: 'shadow', category: 'elevation' },
  '--elevation-2': { label: 'Elevation 2', type: 'shadow', category: 'elevation' },
  '--elevation-3': { label: 'Elevation 3', type: 'shadow', category: 'elevation' },
  '--elevation-4': { label: 'Elevation 4', type: 'shadow', category: 'elevation' },
  '--elevation-5': { label: 'Elevation 5', type: 'shadow', category: 'elevation' },

  // ── Scrollbar ──
  '--scrollbar-width': { label: 'Scrollbar Width', type: 'dimension', category: 'controls', min: 2, max: 16, step: 1, unit: 'px' },

  // ── Controls ──
  '--control-block-size-sm': { label: 'Control Block Size SM', type: 'dimension', category: 'controls', min: 24, max: 48, step: 1, unit: 'px' },
  '--control-block-size': { label: 'Control Block Size', type: 'dimension', category: 'controls', min: 32, max: 64, step: 1, unit: 'px' },
  '--control-block-size-lg': { label: 'Control Block Size LG', type: 'dimension', category: 'controls', min: 40, max: 80, step: 1, unit: 'px' },
  '--control-font-size': { label: 'Control Font Size', type: 'dimension', category: 'controls', min: 10, max: 20, step: 1, unit: 'px' },
  '--control-font-weight': { label: 'Control Font Weight', type: 'weight', category: 'controls' },
  '--control-padding-inline-sm': { label: 'Control Padding Inline SM', type: 'dimension', category: 'controls', min: 4, max: 24, step: 1, unit: 'px' },
  '--control-padding-inline': { label: 'Control Padding Inline', type: 'dimension', category: 'controls', min: 8, max: 32, step: 1, unit: 'px' },
  '--control-padding-inline-lg': { label: 'Control Padding Inline LG', type: 'dimension', category: 'controls', min: 12, max: 48, step: 1, unit: 'px' },
};
