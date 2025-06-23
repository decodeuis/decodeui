import { $PROXY } from "solid-js";

export function createFunctionProxy(
  dynamicFns: () => Record<string, unknown>,
  parentRenderContext: () =>
    | { context?: { fns?: Record<string, unknown> } }
    | undefined,
) {
  return new Proxy(
    {},
    {
      get(_, key: string) {
        try {
          // @ts-expect-error key is proxy after first use.
          if (key === $PROXY) {
            return dynamicFns();
          }
          if (dynamicFns()[key]) {
            return dynamicFns()[key];
          }
          return parentRenderContext()?.context?.fns?.[key];
        } catch (error) {
          console.error("Error in functionProxy:", error);
          return undefined;
        }
      },
    },
  );
}
