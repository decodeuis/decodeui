import { runWithOwner } from "solid-js";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

/**
 * Run a function with the parent component's owner
 * @param parentRenderContextFn
 * @param fn The function to run
 * @returns The result of the function, or undefined if an error occurred
 */
export function runWithParentOwnerFunction<T>(
  parentRenderContextFn: () => { context: FunctionArgumentType } | undefined,
  fn: () => T,
): T | undefined {
  const parentContext = parentRenderContextFn();
  try {
    if (parentContext?.context.owner) {
      return runWithOwner(parentContext.context.owner, () => {
        return fn();
      });
    }
    return undefined;
  } catch (error) {
    console.error("Error in runWithParentOwnerFunction:", error);
    return undefined;
  }
}
