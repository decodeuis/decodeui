import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import type { FieldAttribute } from "../meta/FormMetadataType";

/**
 * Creates a wrapper that displays a popover when the user hovers over an action element
 *
 * @param action - The element that triggers the popover
 * @param popoverSchema - The schema for the popover content
 * @returns A schema that wraps the action with popover functionality
 */
export const popoverWrapperSchema = (
  action: FieldAttribute,
  popoverSchema: FieldAttribute,
) => {
  return {
    attributes: [
      {
        attributes: [
          {
            as: "div",
            attributes: [action],
            componentName: "Html",
            props: (options: FunctionArgumentType) => {
              return {
                onMount: () => {
                  const popoverState = options.contextData
                    .popoverState as ReturnType<
                    typeof createStore<{
                      action: HTMLElement | null;
                      isVisible: boolean;
                      x: number;
                      y: number;
                    }>
                  >;
                  const actionEl = options.ref() as HTMLElement;
                  popoverState[1]("action", actionEl);
                  const handleMouseEnter = () => {
                    popoverState[1]("isVisible", true);
                  };

                  const handleMouseLeave = () => {
                    popoverState[1]("isVisible", false);
                  };

                  actionEl.addEventListener("mouseenter", handleMouseEnter);
                  actionEl.addEventListener("mouseleave", handleMouseLeave);

                  onCleanup(() => {
                    actionEl.removeEventListener(
                      "mouseenter",
                      handleMouseEnter,
                    );
                    actionEl.removeEventListener(
                      "mouseleave",
                      handleMouseLeave,
                    );
                  });
                },
              };
            },
          },
          {
            as: "div",
            attributes: [popoverSchema],
            componentName: "Html",
            css: (options: FunctionArgumentType) => {
              const popoverState = options.contextData
                .popoverState as ReturnType<
                typeof createStore<{
                  action: HTMLElement | null;
                  isVisible: boolean;
                  x: number;
                  y: number;
                }>
              >;
              return popoverState[0]?.isVisible
                ? `return \`._id {
              position:fixed;
              z-index:9999;
            }\`;`
                : `return \`._id {
              display:none;
            }\`;`;
            },
            props: (options: FunctionArgumentType) => {
              const popoverState = options.contextData
                .popoverState as ReturnType<
                typeof createStore<{
                  action: HTMLElement | null;
                  isVisible: boolean;
                  x: number;
                  y: number;
                }>
              >;

              return {
                onMount: () => {
                  const actionEl = popoverState[0]?.action;

                  if (!actionEl) {
                    console.error("Action element not found");
                    return;
                  }
                  const el = options.ref() as HTMLElement;

                  const updatePosition = () => {
                    computePosition(actionEl, el, {
                      middleware: [offset(6), flip(), shift({ padding: 5 })],
                      placement: "top",
                    }).then(({ x, y }) => {
                      popoverState[1]("x", x);
                      popoverState[1]("y", y);
                    });
                  };

                  // Update position when popover becomes visible
                  createEffect(() => {
                    if (popoverState[0]?.isVisible) {
                      updatePosition();
                    }
                  });

                  // Update position on window resize
                  const handleResize = () => {
                    if (popoverState[0]?.isVisible) {
                      updatePosition();
                    }
                  };
                  window.addEventListener("resize", handleResize);

                  onCleanup(() => {
                    window.removeEventListener("resize", handleResize);
                  });
                },
                style: {
                  left: `${popoverState[0]?.x}px`,
                  top: `${popoverState[0]?.y}px`,
                },
              };
            },
          },
        ],
        css: `return \`._id {
  position: relative;
}\`;`,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    contextName: "popoverState",

    props: () => ({
      data: createStore({
        isVisible: false,
        x: 0,
        y: 0,
      }),
    }),
  };
};
