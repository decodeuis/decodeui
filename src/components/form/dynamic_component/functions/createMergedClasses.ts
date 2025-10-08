import type { Vertex } from "~/lib/graph/type/vertex";
import { createMemo } from "solid-js";
import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";

/**
 * Creates an object for merged classes
 */
export function createMergedClasses(
  props: {
    meta: Vertex;
    class?: string;
  },
  options: {
    dynamicProps: () => DynamicPropsType;
    styleId: string;
    cssStyle: () => string | undefined;
  },
) {
  return createMemo(() => {
    const metaPropsKeys = Object.keys(props.meta.P);
    const dynamicPropsValue = options.dynamicProps();
    const style = options.cssStyle();

    const classes = [
      ...metaPropsKeys.filter((key) => key.toLowerCase().endsWith("class")),
      ...Object.keys(dynamicPropsValue).filter((key) =>
        key.toLowerCase().endsWith("class"),
      ),
    ].reduce(
      (acc, key) => {
        if (acc[key]) {
          return acc;
        }
        const cssValue = props.meta.P[key];
        acc[key] = `${cssValue || ""} ${dynamicPropsValue[key] || ""}`.trim();
        return acc;
      },
      {} as Record<string, string>,
    );

    if (style) {
      if (classes.class) {
        classes.class = `${classes.class} ${options.styleId}`;
      } else {
        classes.class = options.styleId;
      }
    }
    if (props.class) {
      if (classes.class) {
        classes.class = `${props.class} ${classes.class}`;
      } else {
        classes.class = props.class;
      }
    }

    return classes;
  });
}
