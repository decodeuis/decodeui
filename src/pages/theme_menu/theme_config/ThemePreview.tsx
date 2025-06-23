import { createMemo, For } from "solid-js";

import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { resolveColorForMode } from "~/lib/styles/colorUtils";
import type { ColorDefinition } from "~/lib/styles/types/types";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";

export function ThemePreview(props: { item: Vertex }) {
  const { currentMode: colorMode } = useThemeToggle();

  const themeData = createMemo(() => {
    return themeConfig(props.item);
  });

  const getColorClass = (color?: ColorDefinition) => {
    if (!color) {
      return "";
    }
    return `background-color:${resolveColorForMode(color, colorMode())};`;
  };

  const colorVariables = ["primary", "background", "border", "muted"];

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  gap: 0.25rem;
}\`;`}
    >
      <For each={colorVariables}>
        {(variable) => (
          <As
            as="div"
            css={`return \`._id {
  ${getColorClass(themeData()?.var?.color?.[variable])}
  height: 20px;
  width: 0.5rem;
}\`;`}
          />
        )}
      </For>
    </As>
  );
}
