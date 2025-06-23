import { sharedConfig } from "solid-js";

let counter = 0;

// taken from packages/solid/src/render/component.ts
export function createUniqueId(prefix = "s"): string {
  const ctx = sharedConfig.context;
  return ctx
    ? `${prefix}${sharedConfig.getNextContextId()}`
    : `${prefix}${counter++}`;
}
