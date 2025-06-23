import { type Owner, runWithOwner } from "solid-js";

/**
 * Run a function with the current owner
 * @param owner The owner to run the function with
 * @param fn The function to run
 * @returns The result of the function, or undefined if an error occurred
 */
export function runWithOwnerFunction<T>(
  owner: Owner | null,
  fn: () => T,
): T | undefined {
  try {
    if (!owner) {
      return undefined;
    }

    return runWithOwner(owner, () => {
      return fn();
    });
  } catch (error) {
    console.error("Error in runWithOwnerFunction:", error);
    return undefined;
  }
}
