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
    const functionArgumentDescriptors = Object.getOwnPropertyDescriptors(
      baseArgsFn(),
    );
    const valueDescriptor = {
      value: {
        get: () => value(),
        enumerable: true,
        configurable: true,
      },
    };
    return Object.defineProperties(
      {},
      { ...functionArgumentDescriptors, ...valueDescriptor },
    ) as FunctionArgumentType;
  });
}
