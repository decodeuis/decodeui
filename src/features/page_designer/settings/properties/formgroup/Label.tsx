import { toTitle } from "case-switcher-js";

import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";

export function Label(props: Readonly<{ meta: Vertex }>) {
  return (
    <>
      {toTitle(
        props.meta.P.displayName ||
          props.meta.P[IdAttr] ||
          props.meta.P.key ||
          "",
      )}
    </>
  );
}
