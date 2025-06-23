import Color from "colorjs.io";

// Configure Color.js to use OKLCH as the default color space
Color.defaults.interpolation_space = "oklch";

import type {
  ColorAdjustments,
  ColorDefinition,
  ColorMode,
  ColorScheme,
  ModeSpecificColor,
} from "~/lib/styles/types/types";

/**
 * Checks if a color definition is mode-specific
 */
export function isModeSpecificColor(
  color: string | number | boolean | ColorDefinition | undefined,
): color is ModeSpecificColor {
  return (
    typeof color === "object" &&
    color !== null &&
    "light" in color &&
    "dark" in color
  );
}

/**
 * Resolves a color definition to a specific color string based on the current mode
 */
export function resolveColorForMode(
  colorDef: string | number | boolean | ColorDefinition | undefined,
  mode: ColorMode,
): string {
  // Handle system mode by defaulting to light
  const resolvedMode = mode === "system" ? "light" : mode;

  if (isModeSpecificColor(colorDef)) {
    return colorDef[resolvedMode];
  }

  // If it's a unified color, return it as-is
  return colorDef as string;
}

/**
 * Uses Color.js to parse a color name and handle variants like 'lightblue' and 'darkred'
 * Returns the color in OKLCH string format for consistent handling in the system
 */
export function parseColorName(colorName: string): string | undefined {
  try {
    // Try to parse the color directly using Color.js
    const color = new Color(colorName);
    if (color) {
      // Convert to OKLCH for consistency with the rest of the system
      return color.to("oklch").toString();
    }
  } catch (error) {
    console.warn(`Failed to parse color name: ${colorName}`, error);
    // Handle variant colors like "lightblue", "darkred", etc.
    const lightMatch = colorName.match(/^light(.+)$/i);
    const darkMatch = colorName.match(/^dark(.+)$/i);

    if (lightMatch) {
      const baseColorName = lightMatch[1];
      try {
        const baseColor = new Color(baseColorName);
        // Lighten the color in OKLCH space
        const oklchColor = baseColor.to("oklch");
        oklchColor.l = Math.min(0.95, (oklchColor.l || 0.7) + 0.15);
        return oklchColor.toString();
      } catch {
        // Ignore parse errors
      }
    }

    if (darkMatch) {
      const baseColorName = darkMatch[1];
      try {
        const baseColor = new Color(baseColorName);
        // Darken the color in OKLCH space
        const oklchColor = baseColor.to("oklch");
        oklchColor.l = Math.max(0.2, (oklchColor.l || 0.5) - 0.15);
        return oklchColor.toString();
      } catch {
        // Ignore parse errors
      }
    }
  }
  return undefined;
}

/**
 * Returns a light shade of the color (1-1000)
 * light_1 = very close to base color, light_1000 = white
 */
export function getLightShade(baseColor: string, shade: number): string {
  try {
    // Ensure shade is between 1 and 1000
    const safeShade = Math.max(1, Math.min(1000, shade));

    // Get the base color and white in Color.js
    const base = new Color(baseColor);
    const white = new Color("white");

    // Linearly interpolate from base color to white
    const ratio = safeShade / 1000;
    const interpolated = base.range(white, { space: "oklch" })(ratio);

    return interpolated.toString({ format: "oklch" });
  } catch {
    return baseColor;
  }
}

/**
 * Returns a dark shade of the color (1-1000)
 * dark_1 = very close to base color, dark_1000 = black
 */
export function getDarkShade(baseColor: string, shade: number): string {
  try {
    // Ensure shade is between 1 and 1000
    const safeShade = Math.max(1, Math.min(1000, shade));

    // Get the base color and black in Color.js
    const base = new Color(baseColor);
    const black = new Color("black");

    // Linearly interpolate from base color to black
    const ratio = safeShade / 1000;
    const interpolated = base.range(black, { space: "oklch" })(ratio);

    return interpolated.toString({ format: "oklch" });
  } catch {
    return baseColor;
  }
}

/**
 * Create a color scheme from a base color with harmonious variations
 */
export function createColorScheme(baseColor: string): ColorScheme {
  try {
    // Convert to OKLCH
    const colorObj = new Color(baseColor).to("oklch");

    // Get the hue in degrees (0-360)
    const h = colorObj.h || 0;

    // Create variants with different hues
    const createVariant = (hueShift: number) => {
      const variant = colorObj.clone();
      variant.h = (h + hueShift + 360) % 360;
      return variant.toString({ format: "oklch" });
    };

    return {
      base: colorObj.toString({ format: "oklch" }),
      analogous1: createVariant(30),
      analogous2: createVariant(-30),
      triadic1: createVariant(120),
      triadic2: createVariant(-120),
      complementary: createVariant(180),
      split1: createVariant(150),
      split2: createVariant(-150),
    };
  } catch {
    return {
      base: baseColor,
      analogous1: baseColor,
      analogous2: baseColor,
      triadic1: baseColor,
      triadic2: baseColor,
      complementary: baseColor,
      split1: baseColor,
      split2: baseColor,
    };
  }
}

/**
 * Create a gradient from a list of colors
 */
export function createGradient(
  type: "linear" | "radial",
  colors: string[],
  stops?: number[],
  angle = 0,
): string {
  if (colors.length < 2) {
    return colors[0] || "transparent";
  }

  const colorStops = colors
    .map((color, i) => {
      if (stops && stops[i] !== undefined) {
        return `${color} ${stops[i]}%`;
      }
      return color;
    })
    .join(", ");

  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${colorStops})`;
  }
  return `radial-gradient(circle, ${colorStops})`;
}

/**
 * Get OKLCH components from a color
 */
export function getHslComponents(color: string): {
  h: number;
  s: number;
  l: number;
  a: number;
} {
  try {
    const oklchColor = new Color(color).to("oklch");
    return {
      h: Math.round(oklchColor.h || 0),
      s: Math.round((oklchColor.c || 0) * 100), // Chroma as saturation
      l: Math.round((oklchColor.l || 0) * 100),
      a:
        oklchColor.alpha !== undefined
          ? Math.round(oklchColor.alpha * 100) / 100
          : 1,
    };
  } catch {
    return { h: 0, s: 0, l: 0, a: 1 };
  }
}

/**
 * Mix two colors together with the specified amount
 */
export function mixColors(
  color1: string,
  color2: string,
  amount = 50,
  preserveOpacity = true,
): string {
  try {
    const c1 = new Color(color1);
    const c2 = new Color(color2);

    // Convert amount from percentage to 0-1 range
    const ratio = amount / 100;

    // Mix colors using interpolation in OKLCH space
    const mixed = c1.range(c2, { space: "oklch" })(ratio);
    if (!preserveOpacity) {
      mixed.alpha = 1;
    }
    return mixed.toString({ format: "oklch" });
  } catch {
    return color1;
  }
}

/**
 * Get contrast ratio between two colors using APCA
 * Returns absolute value for consistency (APCA returns negative for light-on-dark)
 */
export function getContrastRatio(color1: string, color2: string): number {
  try {
    const c1 = new Color(color1);
    const c2 = new Color(color2);
    // Use APCA for more accurate perceptual contrast
    // Taking absolute value since APCA returns negative for light text on dark bg
    return Math.abs(c2.contrastAPCA(c1));
  } catch {
    return 0;
  }
}

/**
 * Check if a color combination meets accessibility standards using APCA
 * APCA recommended minimums:
 * - Body text: 75
 * - Large text (24px+): 60
 * - Non-text elements: 45
 */
export function meetsAccessibilityStandards(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal",
): boolean {
  const ratio = getContrastRatio(foreground, background);

  // APCA thresholds are different from WCAG
  // These are approximate mappings to maintain similar behavior
  if (level === "AA") {
    return size === "normal" ? ratio >= 60 : ratio >= 45;
  }
  // AAA level requires higher contrast
  return size === "normal" ? ratio >= 75 : ratio >= 60;
}

/**
 * Get the most readable color from a list of options against a background
 * Uses APCA (Advanced Perceptual Contrast Algorithm) for better accuracy
 * https://www.myndex.com/APCA/
 */
export function getContrastColor(
  bgColor: string,
  options: string[] = ["#ffffff", "#000000", "oklch(1 0 0)", "oklch(0 0 0)"],
): string {
  try {
    const bg = new Color(bgColor);
    const results = options.map((color) => {
      try {
        const c = new Color(color);
        // APCA gives positive values for light text on dark bg,
        // negative for dark text on light bg. We want absolute values for comparison
        const apcaValue = Math.abs(bg.contrastAPCA(c));
        return {
          color,
          ratio: apcaValue,
        };
      } catch {
        return { color, ratio: 0 };
      }
    });

    // Sort by highest absolute APCA value (best readability)
    return results.sort((a, b) => b.ratio - a.ratio)[0].color;
  } catch {
    return options[0] || "#000000";
  }
}

/**
 * Adjust a color with various transformations
 */
export function adjustColor(
  color: string,
  adjustments: ColorAdjustments,
): string {
  try {
    const c = new Color(color).to("oklch");

    if (adjustments.lighten) {
      c.l = Math.min(1, (c.l || 0) + adjustments.lighten / 200); // Smaller steps for OKLCH lightness
    }

    if (adjustments.darken) {
      c.l = Math.max(0, (c.l || 0) - adjustments.darken / 200); // Smaller steps for OKLCH lightness
    }

    if (adjustments.saturate) {
      c.c = Math.min(0.4, (c.c || 0) + adjustments.saturate / 300); // Chroma (saturation) has a smaller range in OKLCH
    }

    if (adjustments.desaturate) {
      c.c = Math.max(0, (c.c || 0) - adjustments.desaturate / 300);
    }

    if (adjustments.spin) {
      c.h = ((c.h || 0) + adjustments.spin) % 360;
      if (c.h < 0) {
        c.h += 360;
      }
    }

    if (adjustments.alpha !== undefined) {
      c.alpha = adjustments.alpha;
    }

    return c.toString({ format: "oklch" });
  } catch {
    return color;
  }
}

/**
 * Find an accessible color by adjusting a base color until it meets standards
 */
export function findAccessibleColor(
  baseColor: string,
  backgroundColor: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal",
): string {
  try {
    // Start with the base color
    const c = new Color(baseColor).to("oklch");
    const bg = new Color(backgroundColor);

    // If the original color meets standards, return it
    if (
      meetsAccessibilityStandards(c.toString(), backgroundColor, level, size)
    ) {
      return c.toString({ format: "oklch" });
    }

    // Otherwise, adjust lightness until we find a suitable color
    const bgLuminance = bg.get("xyz-d65.y"); // Y component represents luminance
    const isLight = bgLuminance > 0.5;

    // Step size for adjustments - OKLCH lightness needs smaller steps
    const step = 0.03;
    let attempts = 0;
    const maxAttempts = 20;

    // Clone the color for adjustment
    const adjustedColor = c.clone();

    // Iteratively adjust until we find a color that meets standards or hit max attempts
    while (attempts < maxAttempts) {
      attempts++;

      // If background is light, darken the text; if dark, lighten it
      if (isLight) {
        adjustedColor.l = Math.max(0, (adjustedColor.l || 0) - step);
      } else {
        adjustedColor.l = Math.min(1, (adjustedColor.l || 0) + step);
      }

      if (
        meetsAccessibilityStandards(
          adjustedColor.toString(),
          backgroundColor,
          level,
          size,
        )
      ) {
        return adjustedColor.toString({ format: "oklch" });
      }
    }

    // If we can't find a suitable color, return black or white for maximum contrast
    return isLight ? "#000000" : "#ffffff";
  } catch {
    return baseColor;
  }
}
