// https://github.com/corvudev/corvu/blob/c6f0a9dd74207250e9065c57cdd71703e645a380/packages/utils/src/create/floating.ts
import { access, type MaybeAccessor } from "@corvu/utils/reactivity";
import {
  arrow,
  autoPlacement,
  type AutoPlacementOptions,
  autoUpdate,
  computePosition,
  type DetectOverflowOptions,
  flip,
  type FlipOptions,
  hide,
  type HideOptions,
  inline,
  type InlineOptions,
  type Middleware,
  offset,
  type OffsetOptions,
  type Padding,
  type Placement,
  shift,
  type ShiftOptions,
  size,
  type Strategy,
} from "@floating-ui/dom";
import { createEffect, createSignal, mergeProps, onCleanup } from "solid-js";

export type FloatingOptions = {
  arrow?: Padding;
  autoPlacement?: AutoPlacementOptions | boolean;
  flip?: boolean | FlipOptions;
  hide?: boolean | HideOptions;
  inline?: boolean | InlineOptions;
  offset?: OffsetOptions;
  shift?: boolean | ShiftOptions;
  size?: DetectOverflowOptions & {
    fitViewPort?: boolean;
    matchSize?: boolean;
  };
};

export type FloatingState = {
  arrowX: null | number;
  arrowY: null | number;
  height: null | number;
  maxHeight: null | number;
  maxWidth: null | number;
  placement: Placement;
  width: null | number;
  x: number;
  y: number;
};

export const createFloating = (props: {
  arrow?: MaybeAccessor<HTMLElement | null>;
  enabled?: MaybeAccessor<boolean>;
  floating: MaybeAccessor<HTMLElement | null>;
  options?: MaybeAccessor<FloatingOptions | null>;
  placement?: MaybeAccessor<Placement>;
  reference: MaybeAccessor<HTMLElement | null>;
  strategy?: MaybeAccessor<Strategy>;
}) => {
  const defaultedProps = mergeProps(
    {
      enabled: true,
      options: null,
      placement: "bottom" as const,
      strategy: "absolute" as const,
    },
    props,
  );

  const [floatingState, setFloatingState] = createSignal<FloatingState>({
    arrowX: null,
    arrowY: null,
    height: null,
    maxHeight: null,
    maxWidth: null,
    placement: access(defaultedProps.placement),
    width: null,
    x: 0,
    y: 0,
  });

  createEffect(
    () => {
      if (!access(defaultedProps.enabled)) {
        return;
      }

      const reference = access(defaultedProps.reference);
      const floating = access(defaultedProps.floating);
      if (!(reference && floating)) {
        return;
      }

      const middleware: Middleware[] = [];
      const options = access(defaultedProps.options);

      if (options?.offset !== undefined) {
        middleware.push(offset(options.offset));
      }
      if (options?.shift !== undefined && options.shift !== false) {
        const shiftOptions = options.shift === true ? undefined : options.shift;
        middleware.push(shift(shiftOptions));
      }
      const arrowElement = access(defaultedProps.arrow);
      if (arrowElement) {
        middleware.push(
          arrow({
            element: arrowElement,
            padding: options?.arrow,
          }),
        );
      }

      const flipEnabled = options?.flip !== undefined && options.flip !== false;
      const flipOptions =
        typeof options?.flip === "boolean" ? undefined : options?.flip;

      if (flipEnabled && flipOptions?.fallbackStrategy !== "initialPlacement") {
        middleware.push(flip(flipOptions));
      }

      if (options?.size) {
        middleware.push(
          size({
            apply: ({ availableHeight, availableWidth, ...state }) => {
              const newFloatingState: Partial<FloatingState> = {};

              if (options.size!.matchSize === true) {
                if (
                  state.placement.startsWith("top") ||
                  state.placement.startsWith("bottom")
                ) {
                  newFloatingState.width = state.rects.reference.width;
                } else {
                  newFloatingState.height = state.rects.reference.height;
                }
              }
              if (options.size!.fitViewPort === true) {
                if (
                  state.placement.startsWith("top") ||
                  state.placement.startsWith("bottom")
                ) {
                  newFloatingState.maxHeight = availableHeight;
                } else {
                  newFloatingState.maxWidth = availableWidth;
                }
              }

              if (!floatingStatesMatch(floatingState(), newFloatingState)) {
                setFloatingState((state) => ({
                  ...state,
                  ...newFloatingState,
                }));
              }
            },
            ...options.size,
          }),
        );
      }

      if (flipEnabled && flipOptions?.fallbackStrategy === "bestFit") {
        middleware.push(flip(flipOptions));
      }

      if (
        !flipEnabled &&
        options?.autoPlacement !== undefined &&
        options.autoPlacement !== false
      ) {
        const autoPlacementOptions =
          options.autoPlacement === true ? undefined : options.autoPlacement;
        middleware.push(autoPlacement(autoPlacementOptions));
      }

      if (options?.hide !== undefined && options.hide !== false) {
        const hideOptions = options.hide === true ? undefined : options.hide;
        middleware.push(hide(hideOptions));
      }

      if (options?.inline !== undefined && options.inline !== false) {
        const inlineOptions =
          options.inline === true ? undefined : options.inline;
        middleware.push(inline(inlineOptions));
      }

      const updatePosition = () => {
        computePosition(reference, floating, {
          middleware,
          placement: access(defaultedProps.placement),
          strategy: access(defaultedProps.strategy),
        }).then(({ middlewareData, placement, x, y }) => {
          const newFloatingState = {
            arrowX: middlewareData.arrow?.x ?? null,
            arrowY: middlewareData.arrow?.y ?? null,
            placement,
            x,
            y,
          };
          if (!floatingStatesMatch(floatingState(), newFloatingState)) {
            setFloatingState((state) => ({ ...state, ...newFloatingState }));
          }
        });
      };

      const cleanup = autoUpdate(reference, floating, updatePosition);

      // Add resize observer for reference parent element
      // Are you trying to use ResizeObserver to detect size changes when using display: contents? If so, the issue is that display: contents removes the element from the normal box layout, making it effectively invisible for layout purposes
      // Since ResizeObserver only works on elements with a box (i.e., those that participate in layout), it won't trigger callbacks on elements with display: contents.
      const referenceParent = reference.parentElement;
      if (referenceParent) {
        const mutationObserver = new MutationObserver(() => {
          updatePosition();
        });

        mutationObserver.observe(referenceParent, {
          attributes: true,
          childList: true,
          subtree: true,
        });

        onCleanup(() => {
          mutationObserver.disconnect();
        });
      }

      onCleanup(cleanup);
    },
    {
      // ancestorResize: true,
      // ancestorScroll: true,
      // animationFrame: true,
      // elementResize: true,
      // layoutShift: true,
    },
  );

  return floatingState;
};

const floatingStatesMatch = (a: FloatingState, b: Partial<FloatingState>) => {
  return (
    (b.placement === undefined || a.placement === b.placement) &&
    (b.x === undefined || a.x === b.x) &&
    (b.y === undefined || a.y === b.y) &&
    (b.width === undefined || a.width === b.width) &&
    (b.height === undefined || a.height === b.height) &&
    (b.maxWidth === undefined || a.maxWidth === b.maxWidth) &&
    (b.maxHeight === undefined || a.maxHeight === b.maxHeight) &&
    (b.arrowX === undefined || a.arrowX === b.arrowX) &&
    (b.arrowY === undefined || a.arrowY === b.arrowY)
  );
};
