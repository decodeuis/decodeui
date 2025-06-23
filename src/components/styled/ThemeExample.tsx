import { createMemo } from "solid-js";
import { As } from "../As";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import {
  ColorVariationsGrid,
  getThemeColorsFromContext,
} from "./theme/ColorVariationsGrid";
import { useColorTooltip, ColorTooltip } from "./theme/useColorTooltip";

// Styles
const containerStyles = [
  `return \`._id {
    padding: 2rem;
    background: linear-gradient(135deg, \${args.theme.var.color.background_light_200} 0%, \${args.theme.var.color.background_light_100} 100%);
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 1400px;
    margin: 2rem auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 2rem;
    grid-template-areas: 
      "header header"
      "controls controls"
      "shades shades";
  }\`;`,
  `return \`@media (max-width: 768px) {
    ._id {
      padding: 1.5rem;
      gap: 1.5rem;
      grid-template-columns: 1fr;
      grid-template-areas: 
        "header"
        "controls"
        "shades";
    }
  }\`;`,
];

const mainHeaderStyles = `return \`._id {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, \${args.theme.var.color.primary} 0%, \${args.theme.var.color.info} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0;
  letter-spacing: -0.02em;
}\`;`;

const sectionHeaderStyles = [
  `return \`._id {
    font-size: 1.5rem;
    font-weight: 700;
    color: \${args.theme.var.color.text};
    margin: 0 0 1.5rem 0;
    position: relative;
  }\`;`,
  `return \`._id::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 100%;
    height: 3px;
    background: \${args.theme.var.color.primary};
    border-radius: 2px;
  }\`;`,
];

const buttonStyles = [
  `return \`._id {
    background-color: \${args.theme.var.color.primary};
    color: \${args.theme.var.color.primary_text};
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }\`;`,
  `return \`._id:hover {
    background-color: \${args.theme.var.color.primary_light_200};
    color: \${args.theme.var.color.primary_light_200_text};
  }\`;`,
  `return \`._id:active {
    background-color: \${args.theme.var.color.primary_light_100};
    color: \${args.theme.var.color.primary_light_100_text};
  }\`;`,
];

const sectionCardStyles = (gridArea?: string) => {
  return [
    `return \`._id {
      ${gridArea ? `grid-area: ${gridArea};` : ""}
      padding: 2rem;
      border-radius: 1rem;
      background: \${args.theme.var.color.background};
      border: 1px solid \${args.theme.var.color.border};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }\`;`,
    `return \`._id:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
      transform: translateY(-2px);
    }\`;`,
  ];
};

// Component parts
const HeaderSection = () => (
  <As
    as="div"
    css={`return \`._id { grid-area: header; text-align: center; margin-bottom: 1rem; }\`;`}
  >
    <As as="h1" css={mainHeaderStyles}>
      Theme Designer
    </As>
    <As
      as="p"
      css={`return \`._id {
          font-size: 1.1rem; 
          color: \${args.theme.var.color.muted}; 
          margin: 1rem 0 0 0; 
          font-weight: 400;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }\`;`}
    >
      Explore and customize your application's color system with live theme
      controls
    </As>
  </As>
);

const ThemeControlsSection = () => {
  const { toggleTheme, resetTheme, currentMode } = useThemeToggle();

  return (
    <As as="div" css={sectionCardStyles("controls")}>
      <As as="h2" css={sectionHeaderStyles}>
        Theme Controls
      </As>
      <As
        as="div"
        css={`return \`._id > * { margin-bottom: 1rem; } ._id > *:last-child { margin-bottom: 0; }\`;`}
      >
        <As as="button" css={buttonStyles} onClick={toggleTheme}>
          Toggle {currentMode() === "dark" ? "Light" : "Dark"} Mode
        </As>

        <As as="button" css={buttonStyles} onClick={resetTheme}>
          Reset Theme
        </As>

        <As
          as="div"
          css={`return \`._id {
              font-size: 1rem; 
              color: \${args.theme.var.color.text};
              opacity: 0.8; 
              margin-top: 1rem;
              padding: 1rem;
              background: \${args.theme.var.color.background};
              border-radius: 0.5rem;
              text-align: center;
              font-weight: 500;
            }\`;`}
        >
          Current mode: <strong>{currentMode()}</strong>
        </As>
      </As>
    </As>
  );
};

// Main component
export function ThemeExample() {
  const theme = useTheme();
  const { currentMode } = useThemeToggle();
  const themeColors = createMemo(() => getThemeColorsFromContext(theme.var));
  const {
    tooltipContent,
    showTooltip,
    tooltipRef,
    arrowRef,
    showColorTooltip,
    hideColorTooltip,
  } = useColorTooltip();

  return (
    <As as="div" css={containerStyles}>
      <HeaderSection />
      <ThemeControlsSection />
      <As as="div" css={sectionCardStyles("shades")}>
        <As as="h2" css={sectionHeaderStyles}>
          Color Variations
        </As>
        <As
          as="p"
          css={`return \`._id {
              font-size: 1rem; 
              color: \${args.theme.var.color.muted}; 
              margin: 0 0 2rem 0; 
              font-weight: 400;
            }\`;`}
        >
          Complete color scale from lightest (l900) to darkest (d900) variations
        </As>
        <ColorVariationsGrid
          themeColors={themeColors()}
          currentMode={currentMode()}
          showColorTooltip={showColorTooltip}
          hideColorTooltip={hideColorTooltip}
          showTooltip={true}
        />
      </As>
      <ColorTooltip
        tooltipContent={tooltipContent}
        showTooltip={showTooltip}
        tooltipRef={tooltipRef}
        arrowRef={arrowRef}
      />
    </As>
  );
}
