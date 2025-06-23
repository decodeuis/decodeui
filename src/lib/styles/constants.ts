import type { ThemeContext } from "~/lib/styles/types/types";

// Default theme values
export const DEFAULT_THEME = {
  color: {
    primary: {
      light: "oklch(0.57 0.19 250)", // Blue
      dark: "oklch(0.7 0.15 250)", // Brighter blue
    },
    info: {
      light: "oklch(0.65 0.15 220)", // Sky blue
      dark: "oklch(0.75 0.12 220)", // Brighter sky blue
    },
    success: {
      light: "oklch(0.7 0.15 160)", // Emerald
      dark: "oklch(0.75 0.12 160)", // Brighter emerald
    },
    warning: {
      light: "oklch(0.7 0.2 60)", // Orange
      dark: "oklch(0.8 0.18 60)", // Brighter orange
    },
    error: {
      light: "oklch(0.65 0.25 25)", // Red
      dark: "oklch(0.75 0.22 25)", // Brighter red
    },
    text: {
      light: "oklch(0.2 0.02 250)", // Dark text
      dark: "oklch(0.9 0.02 250)", // Light text
    },
    background: {
      light: "oklch(0.98 0.01 250)", // Light background
      dark: "oklch(0.1 0.02 250)", // Dark background
    },
    border: {
      light: "oklch(0.85 0.02 250)", // Light border
      dark: "oklch(0.3 0.03 250)", // Dark border
    },
    muted: {
      light: "oklch(0.6 0.03 250)", // Muted text
      dark: "oklch(0.6 0.03 250)", // Muted text
    },
  },
} as ThemeContext["var"];

// CSS Reset styles
export const CSS_RESET = `
/* https://www.joshwcomeau.com/css/custom-css-reset/ */
/* 1. Use a more-intuitive box-sizing model */
*, *::before, *::after {
  box-sizing: border-box;
}
/* 2. Remove default margin */
* {
  margin: 0;
}
/* 3. Enable keyword animations */
@media (prefers-reduced-motion: no-preference) {
  html {
    interpolate-size: allow-keywords;
  }
}
body {
  /* 4. Add accessible line-height */
  line-height: 1.5rem;
  /* 5. Improve text rendering */
  -webkit-font-smoothing: antialiased;
}
/* 6. Improve media defaults */
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
/* 7. Inherit fonts for form controls */
input, button, textarea, select {
  font: inherit;
}
/* 8. Avoid text overflows */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
/* 9. Improve line wrapping */
p {
  text-wrap: pretty;
}
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}
`;
