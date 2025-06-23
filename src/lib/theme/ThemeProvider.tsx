import { type Component, createMemo, type JSX } from "solid-js";
import { StyleRenderer } from "~/components/StyleRenderer";
import { getGlobalThemeVertex } from "../graph/get/sync/store/getGlobalThemeVertex";
import { getGlobalStore } from "../graph/get/sync/store/getGlobalStore";
import { themeConfig } from "../graph/get/sync/theme/themeConfig";
import { CSS_RESET } from "../styles/constants";
import { createSafeThemeProxy, ThemeContext } from "./ThemeContext";
import type {
  ColorMode,
  ThemeContext as ThemeContextType,
} from "~/lib/styles/types/types";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface ThemeProviderProps {
  children: JSX.Element;
}
export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const [graph] = useGraph();

  const currentMode = createMemo(() => {
    const globalStore = getGlobalStore(graph);
    const userSettingId = globalStore?.P?.userSettingId;
    const userThemeColorMode =
      userSettingId && graph.vertexes[userSettingId]?.P?.themeColorMode;
    return (userThemeColorMode || "light") as ColorMode;
  });

  const themeMemo = createMemo(() => {
    return themeConfig(getGlobalThemeVertex(graph));
  });

  const themeProxy = new Proxy(
    {},
    {
      get(_target: Partial<ThemeContextType>, prop: string | symbol) {
        if (typeof prop === "string" && prop === "var") {
          const safeTheme = themeMemo();
          const themeVar = safeTheme.var || {};
          return createSafeThemeProxy(themeVar, [], currentMode);
        }
        return themeMemo()[prop as keyof ThemeContextType];
      },
    },
  );

  // Generate CSS styles based on the theme
  const themeCssVars = createMemo(() => {
    const safeTheme = themeMemo();
    const themeVar = safeTheme.var || ({} as ThemeContextType["var"]);
    const safeThemeVars = createSafeThemeProxy(
      themeVar,
      [],
      currentMode,
    ) as ThemeContextType["var"];

    // font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    return `
      ${CSS_RESET}

      body {
        background-color: ${safeThemeVars.color?.background};
        color: ${safeThemeVars.color?.text};
        
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Code and preformatted text */
      code, pre, kbd {
        font-family: "Roboto Mono", Menlo, Monaco, Consolas, monospace;
      }
    `;
  });

  return (
    <ThemeContext.Provider value={themeProxy as ThemeContextType}>
      <StyleRenderer cssContent={[themeCssVars()]} id="theme-variables" />
      {props.children}
    </ThemeContext.Provider>
  );
};
