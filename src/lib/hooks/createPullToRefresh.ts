// https://github.com/Senbonzakura1234/use-pull-to-refresh/blob/main/src/index.ts
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

export const DEFAULT_MAXIMUM_PULL_LENGTH = 240;
export const DEFAULT_REFRESH_THRESHOLD = 180;

export type CreatePullToRefreshParams = {
  isDisabled?: () => boolean;
  // default value is 240
  maximumPullLength?: number;
  onRefresh: () => Promise<void> | void;
  // default value is 180
  refreshThreshold?: number;
};
export type CreatePullToRefreshReturn = {
  isRefreshing: Accessor<boolean>;
  pullPosition: Accessor<number>;
};

const isValid = (maximumPullLength: number, refreshThreshold: number) =>
  maximumPullLength >= refreshThreshold;

export function createPullToRefresh({
  isDisabled = () => false,
  maximumPullLength = DEFAULT_MAXIMUM_PULL_LENGTH,
  onRefresh,
  refreshThreshold = DEFAULT_REFRESH_THRESHOLD,
}: CreatePullToRefreshParams): CreatePullToRefreshReturn {
  const [pullStartPosition, setPullStartPosition] = createSignal(0);
  const [pullPosition, setPullPosition] = createSignal(0);
  const [isRefreshing, setIsRefreshing] = createSignal(false);

  const onPullStart = (event: TouchEvent) => {
    if (isDisabled()) {
      return;
    }

    const touch = event.targetTouches[0];
    if (touch) {
      setPullStartPosition(touch.screenY);
    }
  };

  const onPulling = (event: TouchEvent) => {
    if (isDisabled()) {
      return;
    }

    const touch = event.targetTouches[0];
    if (!touch) {
      return;
    }

    const currentPullLength =
      pullStartPosition() < touch.screenY
        ? Math.abs(touch.screenY - pullStartPosition())
        : 0;

    if (
      currentPullLength <= maximumPullLength &&
      pullStartPosition() < window.screen.height / 3
    ) {
      setPullPosition(currentPullLength);
    }
  };

  const onEndPull = () => {
    if (isDisabled()) {
      return;
    }

    const pullLength = pullPosition();

    setPullStartPosition(0);
    setPullPosition(0);

    if (pullLength < refreshThreshold) {
      return;
    }

    setIsRefreshing(true);
    setTimeout(() => {
      const cb = onRefresh();

      if (cb instanceof Promise) {
        cb.finally(() => setIsRefreshing(false));
      } else {
        setIsRefreshing(false);
      }
    }, 500);
  };

  createEffect(() => {
    if (typeof window === "undefined" || isDisabled()) {
      return;
    }

    const ac = new AbortController();
    const options = {
      passive: true,
      signal: ac.signal,
    };

    window.addEventListener("touchstart", onPullStart, options);
    window.addEventListener("touchmove", onPulling, options);
    window.addEventListener("touchend", onEndPull, options);

    onCleanup(() => ac.abort());
  });

  createEffect(() => {
    if (
      isValid(maximumPullLength, refreshThreshold) ||
      process.env.NODE_ENV === "production" ||
      isDisabled()
    ) {
      return;
    }
    console.warn(
      "usePullToRefresh",
      `'maximumPullLength' (currently ${maximumPullLength}) should be bigger or equal than 'refreshThreshold' (currently ${refreshThreshold})`,
    );
  });

  return { isRefreshing, pullPosition };
}
