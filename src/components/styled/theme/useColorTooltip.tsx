import { createSignal } from "solid-js";
import { As } from "~/components/As";
import {
  arrow as floatingArrow,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";

// Styles
const tooltipStyles = (isVisible: boolean) => `return \`._id {
  position: absolute;
  z-index: 1000;
  background: \${args.theme.var.color.background_dark_900};
  color: \${args.theme.var.color.background_dark_900_text};
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', monospace;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translateY(-4px);
  opacity: ${isVisible ? 1 : 0};
  visibility: ${isVisible ? "visible" : "hidden"};
  transition: opacity 0.2s ease, visibility 0.2s ease;
}\`;`;

const arrowStyles = () => `return \`._id {
  position: absolute;
  width: 8px;
  height: 8px;
  background: \${args.theme.var.color.background_dark_900};
  transform: rotate(45deg);
  z-index: -1;
}\`;`;

// Hook for tooltip functionality
export const useColorTooltip = () => {
  const [tooltipContent, setTooltipContent] = createSignal("");
  const [showTooltip, setShowTooltip] = createSignal(false);

  let tooltipRef: HTMLDivElement | undefined;
  let arrowRef: HTMLDivElement | undefined;

  const showColorTooltip = async (event: MouseEvent, colorValue: string) => {
    const target = event.currentTarget as HTMLElement;
    setTooltipContent(colorValue);
    setShowTooltip(true);

    if (tooltipRef && arrowRef) {
      const { x, y, placement, middlewareData } = await computePosition(
        target,
        tooltipRef,
        {
          placement: "top",
          middleware: [
            offset(8),
            flip(),
            shift({ padding: 8 }),
            floatingArrow({ element: arrowRef }),
          ],
        },
      );

      Object.assign(tooltipRef.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Position the arrow
      const { x: arrowX, y: arrowY } = middlewareData.arrow!;
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[placement.split("-")[0]]!;

      Object.assign(arrowRef.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-4px",
      });
    }
  };

  const hideColorTooltip = () => {
    setShowTooltip(false);
  };

  return {
    tooltipContent,
    showTooltip,
    tooltipRef: (ref: HTMLDivElement) => {
      tooltipRef = ref;
    },
    arrowRef: (ref: HTMLDivElement) => {
      arrowRef = ref;
    },
    showColorTooltip,
    hideColorTooltip,
  };
};

// Tooltip component
export const ColorTooltip = (props: {
  tooltipContent: () => string;
  showTooltip: () => boolean;
  tooltipRef: (ref: HTMLDivElement) => void;
  arrowRef: (ref: HTMLDivElement) => void;
}) => (
  <As as="div" ref={props.tooltipRef} css={tooltipStyles(props.showTooltip())}>
    {props.tooltipContent()}
    <As as="div" ref={props.arrowRef} css={arrowStyles()} />
  </As>
);
