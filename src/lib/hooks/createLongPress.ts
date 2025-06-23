import { createSignal, type JSX, onCleanup } from "solid-js";

export function createLongPress<T extends HTMLElement>(
  props: Omit<JSX.HTMLAttributes<T>, "onClick"> & {
    longPressDuration?: number;
    onLongPress?: (event: Event) => void;
  },
) {
  const [pressTimer, setPressTimer] = createSignal<NodeJS.Timeout | null>(null);

  const handlePressStart = (event: MouseEvent | TouchEvent) => {
    if (props.onLongPress) {
      const timer = setTimeout(() => {
        props.onLongPress!(event);
      }, props.longPressDuration || 500);
      setPressTimer(timer);
    }
    handleEvent(event, "onMouseDown", "onTouchStart");
  };

  const handlePressEnd = (event: MouseEvent | TouchEvent) => {
    const timer = pressTimer();
    if (timer) {
      clearTimeout(timer);
      setPressTimer(null);
    }
    handleEvent(
      event,
      "onMouseUp",
      "onMouseLeave",
      "onTouchEnd",
      "onTouchCancel",
    );
  };

  const handleEvent = (
    event: MouseEvent | TouchEvent,
    ...handlers: string[]
  ) => {
    for (const handler of handlers) {
      if (
        event.type
          .toLowerCase()
          .includes(handler.toLowerCase().replace("on", "")) &&
        props[handler as keyof typeof props]
      ) {
        if (typeof props[handler as keyof typeof props] === "function") {
          (props[handler as keyof typeof props] as Function)(event as any);
        }
      }
    }
  };

  onCleanup(() => {
    const timer = pressTimer();
    if (timer) {
      clearTimeout(timer);
    }
  });

  return {
    handlePressEnd,
    handlePressStart,
  };
}
