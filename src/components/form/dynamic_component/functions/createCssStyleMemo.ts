import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createUniqueId } from "~/lib/solid/createUniqueId";
import { createMemo } from "solid-js";
import { processCssContent } from "~/lib/styles/processCss";

/**
 * Creates a memo for CSS styles
 */
export function createCssStyleMemo(
  props: {
    meta: Vertex;
  },
  options: {
    getFunctionArgumentWithValue: () => FunctionArgumentType;
  },
) {
  const styleId = createUniqueId();

  const cssStyle = createMemo(() => {
    try {
      const functionArgs = options.getFunctionArgumentWithValue();
      if (functionArgs.mounted() === false) {
        return "";
      }
      return processCssContent(props.meta.P.css, functionArgs, styleId);
    } catch (error) {
      console.error("Error in css:", error);
      return "";
    }
  });

  return { cssStyle, styleId };
}
