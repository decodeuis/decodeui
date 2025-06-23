import { createMemo, For, Show } from "solid-js";
import { As } from "~/components/As";
import {
  getLightShade,
  getDarkShade,
  resolveColorForMode,
} from "~/lib/styles/colorUtils";
import type {
  ColorDefinition,
  ColorMode,
  ThemeContext,
} from "~/lib/styles/types/types";

// Types
export type ColorEntry = [string, ColorDefinition | undefined];
export type ThemeColorEntries = ColorEntry[];

// Constants
export const COLOR_SHADES = [
  { label: "l900", value: "l900" },
  { label: "l800", value: "l800" },
  { label: "l700", value: "l700" },
  { label: "l600", value: "l600" },
  { label: "l500", value: "l500" },
  { label: "l400", value: "l400" },
  { label: "l300", value: "l300" },
  { label: "l200", value: "l200" },
  { label: "l100", value: "l100" },
  { label: "Base", value: "" },
  { label: "d100", value: "d100" },
  { label: "d200", value: "d200" },
  { label: "d300", value: "d300" },
  { label: "d400", value: "d400" },
  { label: "d500", value: "d500" },
  { label: "d600", value: "d600" },
  { label: "d700", value: "d700" },
  { label: "d800", value: "d800" },
  { label: "d900", value: "d900" },
];

// Styles
export const variationsGridStyles = () => {
  return `return \`._id {
    display: grid;
    grid-template-columns: auto repeat(19, 1fr);
    gap: 0;
    background: \${args.theme.var.color.background};
    border: 1px solid \${args.theme.var.color.border};
    border-radius: 0.75rem;
    overflow-x: auto;
    padding: 1.5rem;
    width: fit-content;
    max-width: 100%;
  }\`;`;
};

export const gridCellStyles = (options: {
  isHeader?: boolean;
  isLabel?: boolean;
  isBase?: boolean;
  isFirstRow?: boolean;
  isLastRow?: boolean;
}) => {
  const { isHeader, isLabel, isBase } = options;

  return `return \`._id {
    padding: ${isHeader || isLabel ? "1rem" : "0.375rem"};
    text-align: ${isLabel ? "left" : "center"};
    font-weight: ${isHeader || isLabel ? "700" : "400"};
    ${
      isBase
        ? `
      background: \${args.theme.var.color.background_light_50};
      border-left: 2px solid \${args.theme.var.color.text_light_100};
      border-right: 2px solid \${args.theme.var.color.text_light_100};
    `
        : ""
    }
  }\`;`;
};

export const shadeSwatchStyles = (shadeColor: string | undefined) => {
  if (!shadeColor) {
    return `return \`._id {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      background: repeating-linear-gradient(
        45deg,
        #f0f0f0,
        #f0f0f0 2px,
        transparent 2px,
        transparent 4px
      );
      opacity: 0.5;
    }\`;`;
  }

  return [
    `return \`._id {
      width: 48px;
      height: 48px;
      background-color: ${shadeColor};
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      cursor: pointer;
    }\`;`,
    `return \`._id:hover {
      transform: scale(1.1);
      z-index: 10;
    }\`;`,
  ];
};

// Helper functions
export function getShadeColor(
  baseColor: ColorDefinition | undefined,
  shade: string,
  colorMode: ColorMode,
): string | undefined {
  if (!baseColor) return undefined;

  // Get the resolved base color for the current mode
  const resolvedBaseColor = resolveColorForMode(baseColor, colorMode);
  if (!resolvedBaseColor) return undefined;

  if (!shade) {
    // Return base color
    return resolvedBaseColor;
  }

  // Generate shade dynamically
  const shadeMatch = shade.match(/([ld])(\d+)/);
  if (shadeMatch) {
    const [, shadeType, shadeValue] = shadeMatch;
    const shadeNum = Number.parseInt(shadeValue, 10);

    // In dark mode, swap light/dark shades for better contrast
    const effectiveShadeType =
      colorMode === "dark" ? (shadeType === "l" ? "d" : "l") : shadeType;

    return effectiveShadeType === "l"
      ? getLightShade(resolvedBaseColor, shadeNum)
      : getDarkShade(resolvedBaseColor, shadeNum);
  }

  return undefined;
}

export function getThemeColorsFromContext(
  themeVar: ThemeContext["var"],
): ThemeColorEntries {
  const colors = themeVar?.color;
  if (!colors || typeof colors !== "object") return [];

  // Get all color keys, filtering out shade variations (keys with _l or _d)
  const colorKeys = Object.keys(colors).filter(
    (key) => !key.includes("_l") && !key.includes("_d"),
  );

  return colorKeys.map((key) => [
    key,
    colors[key as keyof typeof colors] as ColorDefinition,
  ]);
}

// Component props
interface ColorVariationsGridProps {
  themeColors: ThemeColorEntries;
  currentMode: ColorMode;
  showColorTooltip?: (event: MouseEvent, color: string) => void;
  hideColorTooltip?: () => void;
  showTooltip?: boolean;
}

// Main component
export function ColorVariationsGrid(props: ColorVariationsGridProps) {
  return (
    <As as="div" css={variationsGridStyles()}>
      {/* Header Row */}
      <As
        as="div"
        css={gridCellStyles({
          isHeader: true,
          isLabel: true,
          isFirstRow: true,
        })}
      >
        Color
      </As>
      <For each={COLOR_SHADES}>
        {(shade) => (
          <As
            as="div"
            css={gridCellStyles({
              isHeader: true,
              isBase: shade.label === "Base",
              isFirstRow: true,
            })}
          >
            <As
              as="span"
              css={
                shade.label === "Base"
                  ? `return \`._id {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: \${args.theme.var.color.text};
                    text-transform: none;
                  }\`;`
                  : `return \`._id {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: \${args.theme.var.color.muted};
                    text-transform: none;
                  }\`;`
              }
            >
              {shade.label}
            </As>
          </As>
        )}
      </For>

      {/* Color Rows */}
      <For each={props.themeColors}>
        {([colorName, baseColor], rowIndex) => {
          const isLastRow = () => rowIndex() === props.themeColors.length - 1;
          return (
            <>
              <As as="div" css={gridCellStyles({ isLabel: true })}>
                <As
                  as="span"
                  css={`return \`._id {
                    font-size: 0.9rem;
                    text-transform: capitalize;
                    color: \${args.theme.var.color.text};
                  }\`;`}
                >
                  {colorName}
                </As>
              </As>
              <For each={COLOR_SHADES}>
                {(shade) => {
                  const shadeColor = createMemo(() =>
                    getShadeColor(baseColor, shade.value, props.currentMode),
                  );
                  const isBase = shade.label === "Base";

                  return (
                    <As
                      as="div"
                      css={gridCellStyles({
                        isBase,
                        isLastRow: isLastRow(),
                      })}
                    >
                      <Show
                        when={shadeColor()}
                        fallback={
                          <As as="div" css={shadeSwatchStyles(undefined)} />
                        }
                      >
                        <As
                          as="div"
                          css={shadeSwatchStyles(shadeColor())}
                          onMouseEnter={(e) =>
                            props.showColorTooltip?.(e, shadeColor()!)
                          }
                          onMouseLeave={props.hideColorTooltip}
                          title={props.showTooltip ? undefined : shadeColor()}
                        />
                      </Show>
                    </As>
                  );
                }}
              </For>
            </>
          );
        }}
      </For>
    </As>
  );
}
