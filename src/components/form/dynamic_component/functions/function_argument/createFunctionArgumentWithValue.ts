import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { untrack } from "solid-js";

/**
 * Creates function arguments with value for dynamic component
 */
export function createFunctionArgumentWithValue(
  baseArgsFn: () => Omit<FunctionArgumentType, "value">,
  value: () => unknown,
): FunctionArgumentType {
  return untrack(() => {
    const baseArgs = baseArgsFn();

    // Add value getter to the existing object
    Object.defineProperty(baseArgs, "value", {
      get: () => value(),
      enumerable: true,
      configurable: true,
    });

    return baseArgs as FunctionArgumentType;
  });
}
