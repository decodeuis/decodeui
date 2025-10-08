import type { OffsetOptions, Placement, Strategy } from "@floating-ui/dom";

import createFloating from "@corvu/utils/create/floating";
import { createSignal, type JSX, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { mergeRefs, type Ref } from "@solid-primitives/refs";

import { createClickOutside } from "~/lib/hooks/createClickOutside";
import { As } from "~/components/As";

import { useZIndex } from "../../fields/ZIndex";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function DropdownMenu(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    applyDefaultStyles?: boolean;
    boundary?: Element | null;
    offset?: OffsetOptions;
    onClickOutside?: () => void;
    padding?: number;
    parentRef: HTMLElement;
    placement?: Placement;
    useAutoPlacement?: boolean;
    useFlip?: boolean;
    useShift?: boolean;
    useSize?: boolean;
    css?: string | string[];
    ref?: Ref<HTMLDivElement>;
  },
) {
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [graph, setGraph] = useGraph();
  const zIndex = useZIndex();
  const strategy = () => "fixed" as Strategy;

  const floatingState = createFloating({
    // arrow: arrowEl,
    enabled: true,
    floating: floating,
    options: () => ({
      flip: props.useFlip ?? true, // Automatically flip the dropdown if it doesn't fit
      offset: props.offset,
      shift: {
        // padding: props.padding ?? 8, // giving error on development
        boundary: props.boundary as any,
      }, // Adjust the dropdown to stay within the viewport with a padding of 8px
      size: props.useSize ? { fitViewPort: true, matchSize: true } : undefined,
    }),
    placement: () => props.placement ?? "bottom-start",
    reference: () => props.parentRef ?? null,
    strategy,
  });

  createClickOutside(graph, setGraph, (event) => {
    const path = event.composedPath();
    if (!(path.includes(floating()!) || path.includes(props.parentRef))) {
      props.onClickOutside?.();
    }
  });

  const [local, rest] = splitProps(props, ["ref", "parentRef", "css"]);
  const borderClass = `border-radius: 0.375rem;
border: 1px solid \${args.theme.var.color.border};
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
outline-offset: 2px;
outline: 2px solid transparent;
transform-origin: top right`;

  return (
    <Portal mount={document.body}>
      <As
        as="div"
        aria-orientation="vertical"
        css={[
          (props.applyDefaultStyles ?? true)
            ? `return \`._id {
                ${borderClass};
                align-items: flex-start;
                background: \${args.theme.var.color.background_light_100};
                color: \${args.theme.var.color.background_light_100_text};
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                min-width: 12rem;
                overflow-y: auto;
                padding: 0.25rem
              }\`;`
            : "",
          ...ensureArray(local.css),
          `return \`._id {
            left: ${floatingState().x ?? 0}px;
            ${props.useSize ? `max-height: ${floatingState().maxHeight ?? 100}px;` : ""}
            position: ${strategy()};
            top: ${floatingState().y ?? 0}px;
            z-index: ${zIndex};
          }\`;`,
        ].filter(Boolean)}
        ref={mergeRefs(local.ref, (el) => setFloating(el))}
        role="menu"
        {...rest}
      />
    </Portal>
  );
}
