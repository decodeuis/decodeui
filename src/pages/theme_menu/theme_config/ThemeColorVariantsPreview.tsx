import { createMemo, Show } from "solid-js";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import {
  ColorVariationsGrid,
  getThemeColorsFromContext,
} from "~/components/styled/theme/ColorVariationsGrid";

// Styles
const containerStyles = `return \`._id {
  padding: 1.5rem;
  background: \${args.theme.var.color.background};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.75rem;
  margin-top: 1rem;
}\`;`;

const titleStyles = `return \`._id {
  font-size: 1.125rem;
  font-weight: 600;
  color: \${args.theme.var.color.text};
  margin: 0 0 1rem 0;
}\`;`;

export function ThemeColorVariantsPreview(props: { themeVertex: Vertex }) {
  const { currentMode } = useThemeToggle();

  const themeData = createMemo(() => {
    return themeConfig(props.themeVertex);
  });

  const themeColors = createMemo(() => {
    const themeVar = themeData()?.var;
    if (!themeVar) return [];
    return getThemeColorsFromContext(themeVar);
  });

  return (
    <As as="div" css={containerStyles}>
      <As as="h4" css={titleStyles}>
        Theme: {props.themeVertex.P.key}
      </As>

      <Show
        when={themeColors().length > 0}
        fallback={
          <As
            as="p"
            css={`return \`._id {
          color: \${args.theme.var.color.muted};
          font-style: italic;
        }\`;`}
          >
            No colors defined in this theme
          </As>
        }
      >
        <ColorVariationsGrid
          themeColors={themeColors()}
          currentMode={currentMode()}
          showTooltip={false}
        />
      </Show>
    </As>
  );
}
