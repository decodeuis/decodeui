import { type Accessor, type Component, createMemo } from "solid-js";
import { ComponentField } from "~/components/fields/component/ComponentField";
import { componentsMap } from "~/components/form/functions/componentsMap";

/**
 * Creates a memo to determine the actual component to render
 */
export function createComponentMemo(
  componentName: Accessor<string | Component | undefined>,
) {
  return createMemo(() => {
    const name = componentName();
    if (typeof name === "string" && name.startsWith("System")) {
      return ComponentField;
    }
    return typeof name === "function"
      ? name
      : (componentsMap[name as string] ?? ComponentField);
  });
}
