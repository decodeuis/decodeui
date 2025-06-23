import { createMemo } from "solid-js";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { ColorMode } from "~/lib/styles/types/types";

/**
 * Hook to get the current theme mode (light/dark)
 * @returns A memo that returns the current color mode
 */
export function useThemeMode() {
  const [graph] = useGraph();

  return createMemo(() => {
    const globalStore = getGlobalStore(graph);
    const userSettingId = globalStore?.P?.userSettingId;
    const userThemeColorMode =
      userSettingId && graph.vertexes[userSettingId]?.P?.themeColorMode;
    return (userThemeColorMode || "light") as ColorMode;
  });
}

/**
 * Hook to check if the current theme is dark mode
 * @returns A memo that returns true if dark mode is active
 */
export function useIsDarkMode() {
  const themeMode = useThemeMode();
  return createMemo(() => themeMode() === "dark");
}
