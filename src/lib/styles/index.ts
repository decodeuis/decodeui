// Export the type using export type for isolatedModules
import type { Breakpoint } from "~/lib/styles/types/types";

// ============================
// = CORE CSS HELPER FUNCTIONS
// ============================

// ======================================
// = ADVANCED CSS GENERATION UTILITIES
// ======================================

// Utility for creating CSS class with interactive states
export const withStates = (
  baseStyles: string,
  hoverStyles?: string,
  focusStyles?: string,
  activeStyles?: string,
  focusVisibleStyles?: string,
  disabledStyles?: string,
): string => {
  let result = `._id {\n  ${baseStyles.replace(/\n/g, "\n  ")}\n}`;

  if (hoverStyles) {
    result += `\n\n._id:hover:not(:disabled) {\n  ${hoverStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (focusStyles) {
    result += `\n\n._id:focus {\n  ${focusStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (focusVisibleStyles) {
    result += `\n\n._id:focus-visible {\n  ${focusVisibleStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (activeStyles) {
    result += `\n\n._id:active:not(:disabled) {\n  ${activeStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (disabledStyles) {
    result += `\n\n._id:disabled {\n  ${disabledStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  return result;
};

// ======================================
// = THEME VARIABLE ACCESSORS
// ======================================

// Creates a conditional CSS block based on color mode
export const colorModeStyle = (
  lightStyles: string,
  darkStyles: string,
  systemStyles?: string,
) => {
  let css = `
  @media (prefers-color-scheme: light) {
    :root:not([data-theme='dark']) ._id {
      ${lightStyles}
    }
  }
  
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) ._id {
      ${darkStyles}
    }
  }
  
  :root[data-theme='light'] ._id {
    ${lightStyles}
  }
  
  :root[data-theme='dark'] ._id {
    ${darkStyles}
  }`;

  // Add optional system-based styles
  if (systemStyles) {
    css += `
  
  :root[data-theme='system'] ._id {
    ${systemStyles}
  }`;
  }

  return css;
};

// ======================================
// = RESPONSIVE DESIGN UTILITIES
// ======================================

// Default breakpoints for responsive design
export const DEFAULT_BREAKPOINTS: Record<Breakpoint, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Helper for responsive styles with breakpoints
export const responsiveStyles = (
  styles: Record<string, string>,
  breakpoints: Record<string, string> = DEFAULT_BREAKPOINTS,
) => {
  let result = `._id {\n  ${styles.base.replace(/\n/g, "\n  ")}\n}`;

  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint !== "base" && breakpoints[breakpoint as Breakpoint]) {
      result += `\n\n@media (min-width: ${breakpoints[breakpoint as Breakpoint]}) {\n  ._id {\n    ${style.replace(/\n/g, "\n    ")}\n  }\n}`;
    }
  });

  return result;
};

// Create styles that apply at specific breakpoints without requiring a "base"
export const atBreakpoint = (breakpoint: Breakpoint, styles: string) => {
  return `@media (min-width: ${DEFAULT_BREAKPOINTS[breakpoint]}) {\n  ._id {\n    ${styles.replace(/\n/g, "\n    ")}\n  }\n}`;
};

// Creates styles for container queries
export const containerQuery = (size: string, styles: string) => {
  return `@container (min-width: ${size}) {\n  ._id {\n    ${styles.replace(/\n/g, "\n    ")}\n  }\n}`;
};

// Create CSS with animation keyframes
export const withAnimation = (
  name: string,
  keyframes: Record<string, string>,
  duration = "1s",
  timing = "ease",
  iterationCount: string | number = 1,
  direction = "normal",
  fillMode = "none",
) => {
  let keyframesString = `@keyframes ${name} {\n`;

  Object.entries(keyframes).forEach(([key, value]) => {
    keyframesString += `  ${key} {\n    ${value.replace(/\n/g, "\n    ")}\n  }\n`;
  });

  keyframesString += "}\n\n";

  const animationValue = `${name} ${duration} ${timing} ${iterationCount} ${direction} ${fillMode}`;

  return `${keyframesString}._id {\n  animation: ${animationValue};\n}`;
};
