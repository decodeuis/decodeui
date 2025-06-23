import { onCleanup, runWithOwner, getOwner } from "solid-js";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";

/**
 * Hook for managing component lifecycle events
 * @param options Component lifecycle options
 * @returns Functions for managing component lifecycle
 */
export function useComponentLifecycle(options: {
  dynamicProps: () => DynamicPropsType;
  getFunctionArgumentWithValue: () => FunctionArgumentType;
  setMounted: (mounted: boolean) => void;
}) {
  const owner = getOwner();
  // Initialize lifecycle functions
  const initializeBeforeMount = () => {
    try {
      const beforeMount = options.dynamicProps().beforeMount;
      if (beforeMount && typeof beforeMount === "function") {
        beforeMount(options.getFunctionArgumentWithValue());
      }
    } catch (error) {
      console.error("Error in beforeMount:", error);
    }
  };

  // Setup mount handler
  const setupMount = () => {
    try {
      options.setMounted(true);

      if (owner) {
        runWithOwner(owner, () => {
          const onMountFn = options.dynamicProps().onMount;
          if (onMountFn && typeof onMountFn === "function") {
            const onMountResult = onMountFn();
            if (typeof onMountResult === "function") {
              onCleanup(onMountResult);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error in onMount:", error);
    }
  };

  // Setup cleanup handler
  const setupCleanup = () => {
    try {
      options.setMounted(false);
      const onUnmount = options.dynamicProps().onUnmount;
      if (onUnmount && typeof onUnmount === "function" && owner) {
        runWithOwner(owner, () => {
          onUnmount(options.getFunctionArgumentWithValue());
        });
      }
    } catch (error) {
      console.error("Error in onCleanup:", error);
    }
  };

  return {
    initializeBeforeMount,
    setupMount,
    setupCleanup,
  };
}
