import { DEFAULT_THEME } from "../styles/constants";
import type { ModeSpecificColor } from "../styles/types/types";

// https://github.com/bgrins/TinyColor/blob/master/npm/tinycolor.js#L784
export function getDefaultTheme() {
  return `return {
  "var": {
    "color": {
      "primary": {
        "light": "${(DEFAULT_THEME.color.primary as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.primary as ModeSpecificColor).dark}"
      },
      "info": {
        "light": "${(DEFAULT_THEME.color.info as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.info as ModeSpecificColor).dark}"
      },
      "success": {
        "light": "${(DEFAULT_THEME.color.success as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.success as ModeSpecificColor).dark}"
      },
      "warning": {
        "light": "${(DEFAULT_THEME.color.warning as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.warning as ModeSpecificColor).dark}"
      },
      "error": {
        "light": "${(DEFAULT_THEME.color.error as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.error as ModeSpecificColor).dark}"
      },
      "text": {
        "light": "${(DEFAULT_THEME.color.text as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.text as ModeSpecificColor).dark}"
      },
      "background": {
        "light": "${(DEFAULT_THEME.color.background as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.background as ModeSpecificColor).dark}"
      },
      "border": {
        "light": "${(DEFAULT_THEME.color.border as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.border as ModeSpecificColor).dark}"
      },
      "muted": {
        "light": "${(DEFAULT_THEME.color.muted as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.muted as ModeSpecificColor).dark}"
      }
    }
  }
}`;
}
