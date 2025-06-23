import { DEFAULT_THEME } from "~/lib/styles/constants";
import { deepMerge } from "~/lib/theme/deepMerge";

import type { ThemeContext } from "~/lib/styles/types/types";
import type { Vertex } from "~/lib/graph/type/vertex";

export function themeConfig(themeVertex?: Vertex): Partial<ThemeContext> {
  // Start with a base theme object with the default theme
  const result: Partial<ThemeContext> = {
    var: deepMerge({}, DEFAULT_THEME) as ThemeContext["var"],
  };

  // Get config from themeVertex
  const vertexData = themeVertex?.P?.data;
  if (!vertexData?.trim()) {
    return result;
  }

  let graphConfig: Record<string, unknown> = {};

  // Parse the theme config from the vertex
  if (vertexData.trim().startsWith("{")) {
    try {
      graphConfig = JSON.parse(vertexData);
    } catch (error) {
      console.error("Error parsing theme config JSON:", error);
      return result;
    }
  } else if (vertexData.trim()) {
    try {
      const configFunction = new Function("variables", vertexData);
      const configResult = configFunction({});
      if (configResult) {
        graphConfig = configResult as Record<string, unknown>;
      }
    } catch (error) {
      console.error("Error evaluating theme config function:", error);
      return result;
    }
  }

  // Handle properties inside the "var" key using deep merge
  if (graphConfig.var) {
    result.var = deepMerge(
      result.var || ({} as ThemeContext["var"]),
      graphConfig.var as ThemeContext["var"],
    ) as ThemeContext["var"];
  }

  // Keep non-var properties at the root level
  Object.keys(graphConfig).forEach((key) => {
    if (key !== "var") {
      (result as Record<string, unknown>)[key] = graphConfig[key];
    }
  });
  return result;
}
