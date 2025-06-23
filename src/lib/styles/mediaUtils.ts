import { DEFAULT_BREAKPOINTS } from "~/lib/styles";
import type { Breakpoint } from "~/lib/styles/types/types";

/**
 * Get media query for a specific breakpoint
 */
export function getMediaQuery(breakpoint: Breakpoint): string {
  return `@media (min-width: ${DEFAULT_BREAKPOINTS[breakpoint]})`;
}

/**
 * Get prefers-color-scheme media query
 */
export function getPrefersColorSchemeQuery(mode: "light" | "dark"): string {
  return `@media (prefers-color-scheme: ${mode})`;
}

/**
 * Get container query with minimum width
 */
export function getContainerQuery(size: string): string {
  return `@container (min-width: ${size})`;
}

/**
 * Get CSS animation definition
 */
export function getAnimationDefinition(
  name: string,
  duration = "300ms",
  timing = "ease",
  delay = "0ms",
  iterationCount: string | number = 1,
  direction = "normal",
  fillMode = "none",
): string {
  return `${name} ${duration} ${timing} ${delay} ${iterationCount} ${direction} ${fillMode}`;
}
