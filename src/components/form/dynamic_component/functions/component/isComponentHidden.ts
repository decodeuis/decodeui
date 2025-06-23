import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";

/**
 * Determines if a component should be hidden based on properties
 */
export function isComponentHidden(
  props: {
    meta: Vertex;
  },
  options: {
    dynamicProps: () => DynamicPropsType;
    getFunctionArgumentWithValue: () => FunctionArgumentType;
  },
) {
  try {
    // Check for hide property
    const hiddenProp = options.dynamicProps().hide ?? props.meta.P.hide;
    if (hiddenProp !== undefined) {
      const result =
        typeof hiddenProp === "function"
          ? hiddenProp(options.getFunctionArgumentWithValue())
          : hiddenProp;
      if (result) {
        return true;
      }
    }

    // Check for show property (inverse of hide)
    const showProp = options.dynamicProps().show ?? props.meta.P.show;
    if (showProp !== undefined) {
      const result =
        typeof showProp === "function"
          ? showProp(options.getFunctionArgumentWithValue())
          : showProp;
      return !result;
    }

    return false;
  } catch (error) {
    console.error("Error in isHidden:", error);
    return false;
  }
}
