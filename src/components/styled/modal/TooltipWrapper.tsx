import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { createUniqueId } from "~/lib/solid/createUniqueId";
import {
  arrow as floatingArrow,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";
import { mergeRefs, type Ref } from "@solid-primitives/refs";

import { As } from "../../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { SetStoreFunction } from "solid-js/store";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { CssType } from "~/components/form/type/CssType";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";
// Type for tooltip registry in the globalStoreId vertex
type TooltipRegistry = {
  [key: string]: string[]; // Group name -> Array of tooltip IDs
};

// Type for active tooltips
type ActiveTooltips = {
  [key: string]: boolean; // Tooltip ID -> isActive
};

// Register a tooltip within a group
function registerTooltip(
  group: string | undefined,
  tooltipId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!group) {
    return () => {};
  }

  // Get existing registry or create a new one
  const globalStore = getGlobalStore(graph);
  const tooltipRegistry = (globalStore.P.tooltipRegistry ||
    {}) as TooltipRegistry;

  // Add the tooltip to the appropriate group
  const groupTooltips = tooltipRegistry[group] || [];
  if (!groupTooltips.includes(tooltipId)) {
    // Create a new array with the tooltip ID added
    const updatedGroupTooltips = [...groupTooltips, tooltipId];

    // Update the registry in the global store
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      tooltipRegistry: {
        ...tooltipRegistry,
        [group]: updatedGroupTooltips,
      },
    });
  }

  // Return cleanup function to remove tooltip from registry when unmounted
  return () => {
    const latestGlobalStore = getGlobalStore(graph);
    const latestRegistry = (latestGlobalStore.P.tooltipRegistry ||
      {}) as TooltipRegistry;

    if (latestRegistry[group]) {
      // Filter out this tooltip ID
      const filteredTooltips = latestRegistry[group].filter(
        (id) => id !== tooltipId,
      );

      // Update the registry in the global store
      const updatedRegistry = { ...latestRegistry };

      if (filteredTooltips.length === 0) {
        // Remove the group if empty
        delete updatedRegistry[group];
      } else {
        updatedRegistry[group] = filteredTooltips;
      }

      mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
        tooltipRegistry: updatedRegistry,
      });

      // Also remove from active tooltips if present
      const activeTooltips = (latestGlobalStore.P.activeTooltips ||
        {}) as ActiveTooltips;
      if (activeTooltips[tooltipId]) {
        const updatedActiveTooltips = { ...activeTooltips };
        delete updatedActiveTooltips[tooltipId];

        mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
          activeTooltips: updatedActiveTooltips,
        });
      }
    }
  };
}

// Set a tooltip as active in the global state
function setTooltipActive(
  tooltipId: string,
  isActive: boolean,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const globalStore = getGlobalStore(graph);
  const activeTooltips = (globalStore.P.activeTooltips || {}) as ActiveTooltips;

  mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
    activeTooltips: {
      ...activeTooltips,
      [tooltipId]: isActive,
    },
  });
}

// Close all tooltips in a group except the active one
function closeOthersInGroup(
  group: string | undefined,
  activeTooltipId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!group) {
    return;
  }

  // Get existing registry
  const globalStore = getGlobalStore(graph);
  const tooltipRegistry = (globalStore.P.tooltipRegistry ||
    {}) as TooltipRegistry;
  const activeTooltips = (globalStore.P.activeTooltips || {}) as ActiveTooltips;

  // Get tooltips in this group
  const groupTooltips = tooltipRegistry[group] || [];

  // Update active state for all tooltips in this group
  const updatedActiveTooltips = { ...activeTooltips };

  groupTooltips.forEach((tooltipId) => {
    // Set all other tooltips to inactive
    if (tooltipId !== activeTooltipId) {
      updatedActiveTooltips[tooltipId] = false;
    }
  });

  // Make this tooltip active
  updatedActiveTooltips[activeTooltipId] = true;

  // Update the global state
  mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
    activeTooltips: updatedActiveTooltips,
  });
}

export function TooltipWrapper(props: {
  arrowCss?: CssType;
  children: JSX.Element;
  content: JSX.Element;
  contentCss?: CssType;
  group?: string;
  openDelay?: number;
  triggerAs?: string;
  triggerCss?: CssType;
  ref?: Ref<HTMLElement>;
}) {
  const [local, others] = splitProps(props, [
    "children",
    "content",
    "group",
    "openDelay",
    "triggerAs",
    "triggerCss",
    "contentCss",
    "arrowCss",
    "ref",
  ]);

  const [graph, setGraph] = useGraph();
  const [isLocalOpen, setIsLocalOpen] = createSignal(false);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);
  const [tooltip, setTooltip] = createSignal<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = createSignal<HTMLElement | null>(
    null,
  );
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [arrowPosition, setArrowPosition] = createSignal({ x: 0, y: 0 });
  const [placement, setPlacement] = createSignal("top");

  let openTimeout: ReturnType<typeof setTimeout> | undefined;
  const tooltipId = createUniqueId();

  // Check if tooltip is active based on global state
  const isOpen = () => {
    if (!props.group) {
      return isLocalOpen();
    }

    const globalStore = getGlobalStore(graph);
    const activeTooltips = (globalStore.P.activeTooltips ||
      {}) as ActiveTooltips;
    return !!activeTooltips[tooltipId];
  };

  // Close tooltip function
  const closeTooltip = () => {
    clearTimeout(openTimeout);

    if (props.group) {
      setTooltipActive(tooltipId, false, graph, setGraph);
    } else {
      setIsLocalOpen(false);
    }
  };

  // Watch for changes in the global active tooltips state
  createEffect(() => {
    if (!props.group) {
      return;
    }

    const globalStore = getGlobalStore(graph);
    const activeTooltips = (globalStore.P.activeTooltips ||
      {}) as ActiveTooltips;

    // If this tooltip's state changed to inactive in the global state, update local state
    if (activeTooltips[tooltipId] === false && isLocalOpen()) {
      setIsLocalOpen(false);
    }
  });

  // Register with group on mount
  onMount(() => {
    const unregister = registerTooltip(props.group, tooltipId, graph, setGraph);
    onCleanup(unregister);
  });

  const updatePosition = async () => {
    const triggerEl = trigger();
    const tooltipEl = tooltip();
    const arrowEl = arrowElement();

    if (!(triggerEl && tooltipEl)) {
      return;
    }

    const middlewares = [offset(14), flip(), shift()];

    // Only add arrow middleware if arrow element exists
    if (arrowEl) {
      middlewares.push(floatingArrow({ element: arrowEl }));
    }

    const {
      x,
      y,
      placement: newPlacement,
      middlewareData,
    } = await computePosition(triggerEl, tooltipEl, {
      placement: "top",
      middleware: middlewares,
    });

    setPosition({ x, y });
    setPlacement(newPlacement);

    if (middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      setArrowPosition({ x: arrowX ?? 0, y: arrowY ?? 0 });
    }
  };

  const openTooltip = () => {
    if (props.group) {
      closeOthersInGroup(props.group, tooltipId, graph, setGraph);
    }

    clearTimeout(openTimeout);
    openTimeout = setTimeout(() => {
      if (props.group) {
        setTooltipActive(tooltipId, true, graph, setGraph);
      } else {
        setIsLocalOpen(true);
      }

      // Update position after setting to open
      updatePosition();
    }, props.openDelay ?? 200);
  };

  // Set up event listeners for the trigger element
  createEffect(() => {
    const triggerEl = trigger();

    if (!triggerEl) {
      return;
    }

    const handleMouseEnter = () => openTooltip();
    const handleMouseLeave = () => closeTooltip();
    const handleFocus = () => openTooltip();
    const handleBlur = () => closeTooltip();

    triggerEl.addEventListener("mouseenter", handleMouseEnter);
    triggerEl.addEventListener("mouseleave", handleMouseLeave);
    triggerEl.addEventListener("focus", handleFocus);
    triggerEl.addEventListener("blur", handleBlur);

    onCleanup(() => {
      clearTimeout(openTimeout);
      triggerEl.removeEventListener("mouseenter", handleMouseEnter);
      triggerEl.removeEventListener("mouseleave", handleMouseLeave);
      triggerEl.removeEventListener("focus", handleFocus);
      triggerEl.removeEventListener("blur", handleBlur);
    });
  });

  // Update position when dependencies change
  createEffect(() => {
    if (isOpen() && trigger() && tooltip()) {
      updatePosition();

      // Set up auto-update for scrolling and resizing
      const triggerEl = trigger();
      const tooltipEl = tooltip();

      if (!(triggerEl && tooltipEl)) {
        return;
      }

      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      onCleanup(() => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      });
    }
  });

  return (
    <>
      <As
        as={(props.triggerAs as any) || "div"}
        ref={mergeRefs(setTrigger, props.ref)}
        css={local.triggerCss}
        {...others}
        aria-describedby={isOpen() ? tooltipId : undefined}
        tabIndex={0}
      >
        {props.children}
      </As>

      <Show when={isOpen()}>
        <Portal>
          <As
            as="div"
            id={tooltipId}
            ref={setTooltip}
            role="tooltip"
            css={[
              `return \`._id {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 9999;
                transform: translate(${position().x}px, ${position().y}px);
                opacity: 1;
                animation: tooltipFadeIn 200ms ease-out;
                background-color: \${args.theme.var.color.background_dark_800};
                color: \${args.theme.var.color.background_dark_800_text};
                padding: 0.5rem 0.75rem;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                line-height: 1.25rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                max-width: 20rem;
                word-wrap: break-word;
              }\`;`,
              ...ensureArray(props.contentCss),
              `return \`@keyframes tooltipFadeIn {
                  from {
                    opacity: 0;
                    transform: translate(${position().x}px, ${position().y + 5}px);
                  }
                  to {
                    opacity: 1;
                    transform: translate(${position().x}px, ${position().y}px);
                  }
                }\`;`,
            ]}
          >
            {props.content}

            <As
              as="div"
              ref={setArrowElement}
              css={[
                `return \`._id {
                  position: absolute;
                  width: 10px;
                  height: 10px;
                  background-color: \${args.theme.var.color.background_dark_800};
                  transform: rotate(45deg);
                  z-index: -1;
                  
                  /* Position the arrow based on placement */
                  ${
                    placement().includes("top")
                      ? `
                    bottom: -5px;
                    left: ${arrowPosition().x ?? 0}px;
                  `
                      : ""
                  }
                  ${
                    placement().includes("bottom")
                      ? `
                    top: -5px;
                    left: ${arrowPosition().x ?? 0}px;
                  `
                      : ""
                  }
                  ${
                    placement().includes("left")
                      ? `
                    right: -5px;
                    top: ${arrowPosition().y ?? 0}px;
                  `
                      : ""
                  }
                  ${
                    placement().includes("right")
                      ? `
                    left: -5px;
                    top: ${arrowPosition().y ?? 0}px;
                  `
                      : ""
                  }
                }\`;`,
                ...(props.arrowCss ? ensureArray(props.arrowCss) : []),
              ]}
            />
          </As>
        </Portal>
      </Show>
    </>
  );
}
