import { useGraph } from "~/lib/graph/context/UseGraph";
import { saveUserSetting } from "~/lib/api/saveUserSetting";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { ColorMode } from "~/lib/styles/types/types";

/**
 * A hook that provides theme toggle functionality and persists the theme preference
 * to the user settings in the database.
 */
export function useThemeToggle() {
  const [graph, setGraph] = useGraph();

  /**
   * Toggle between light and dark mode and save the preference to user settings
   */
  const toggleTheme = () => {
    // Read the current mode from the user settings or use light as default
    const currentMode =
      graph.vertexes[getGlobalStore(graph).P.userSettingId]?.P
        ?.themeColorMode || "light";
    const newMode: ColorMode = currentMode === "dark" ? "light" : "dark";

    // Save preference to database - newMode will always be different by definition
    saveUserSetting({ themeColorMode: newMode }, graph, setGraph);
  };

  /**
   * Set a specific color mode and save the preference to user settings
   */
  const setColorMode = (mode: ColorMode) => {
    // Save preference to database - only if different from current
    const currentMode =
      graph.vertexes[getGlobalStore(graph).P.userSettingId]?.P?.themeColorMode;
    if (currentMode !== mode) {
      saveUserSetting({ themeColorMode: mode }, graph, setGraph);
    }
  };

  /**
   * Reset theme to default (light mode) and save the preference
   */
  const resetTheme = () => {
    // Default color mode
    const defaultMode: ColorMode = "light";

    // Save preference to database - only if different from current
    const currentMode =
      graph.vertexes[getGlobalStore(graph).P.userSettingId]?.P?.themeColorMode;
    if (currentMode !== defaultMode) {
      saveUserSetting({ themeColorMode: defaultMode }, graph, setGraph);
    }
  };

  return {
    toggleTheme,
    setColorMode,
    resetTheme,
    currentMode: () =>
      graph.vertexes[getGlobalStore(graph).P.userSettingId]?.P
        ?.themeColorMode || "light",
  };
}
