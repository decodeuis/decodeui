import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import type { Accessor } from "solid-js";

/**
 * Creates dynamic functions for the component
 */
export function createDynamicFunctions(
  graph: GraphInterface,
  meta: Vertex,
  getFunctionArgumentWithValue: () => FunctionArgumentType,
  parentRenderContext: () => { context: FunctionArgumentType } | undefined,
  componentName: Accessor<string>,
): Record<string, unknown> {
  try {
    // Helper to evaluate fns from a vertex
    const evaluateFns = (
      fns:
        | ((args: FunctionArgumentType) => Record<string, unknown>)
        | string
        | undefined
        | null,
    ) => {
      if (typeof fns === "function") {
        return fns(getFunctionArgumentWithValue());
      }
      if (typeof fns === "string" && fns.trim() !== "") {
        try {
          return new Function("args", fns)(getFunctionArgumentWithValue());
        } catch (error) {
          console.error("Error evaluating fns:", error);
          return undefined;
        }
      }
      return undefined;
    };

    return new Proxy(
      {},
      {
        get(_, key: string) {
          const metaFns = evaluateFns(meta.P.fns);
          if (metaFns && key in metaFns) {
            return metaFns[key];
          }
          // For Component type, merge fns from component vertex and meta
          const componentVertex = findVertexByLabelAndUniqueId(
            graph,
            "Component",
            "key",
            componentName(),
          );
          if (componentVertex) {
            const componentFns = evaluateFns(componentVertex.P.fns);
            if (componentFns && key in componentFns) {
              return componentFns[key];
            }
          }
          return parentRenderContext()?.context?.fns?.[key];
        },
      },
    );
  } catch (error) {
    console.error("Error in dynamicFns:", error);
    return parentRenderContext()?.context?.fns ?? {};
  }
}
