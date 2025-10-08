import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createMemo } from "solid-js";
import { getMetaProps } from "~/components/form/functions/getMetaProps";

import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";

/**
 * Creates a memo for dynamic props
 */
export function createDynamicPropsMemo(
  props: {
    meta: Vertex;
  },
  options: {
    graph: GraphInterface;
    getFunctionArgumentWithValue: () => FunctionArgumentType;
  },
) {
  return createMemo(() => {
    if (!props.meta) {
      return {} as DynamicPropsType;
    }
    try {
      if (typeof props.meta.P.props === "function") {
        const dynamicPropsObj =
          props.meta.P.props!(options.getFunctionArgumentWithValue()) || {};
        return getMetaProps(
          dynamicPropsObj,
          [],
          options.graph,
        ) as DynamicPropsType;
      }
      if (typeof props.meta.P.props === "string") {
        try {
          const propsFunction = new Function("args", props.meta.P.props);
          const dynamicPropsObj =
            propsFunction(options.getFunctionArgumentWithValue()) || {};
          return getMetaProps(
            dynamicPropsObj,
            [],
            options.graph,
          ) as DynamicPropsType;
        } catch (error) {
          console.error(
            "Error evaluating props function:",
            error,
            props.meta.P.props,
          );
          return {} as DynamicPropsType;
        }
      }
      return {} as DynamicPropsType;
    } catch (error) {
      console.error("Error in dynamicProps:", error);
      return {} as DynamicPropsType;
    }
  });
}
