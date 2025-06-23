import type { Store } from "solid-js/store";

import { untrack } from "solid-js";

import { isStaticOptions } from "~/components/fields/select/functions/isStaticOptions";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { getParentVertexValue } from "~/lib/graph/get/sync/edge/getParentVertexValue";
import { getSelectedVertexValue } from "~/lib/graph/get/sync/edge/getSelectedVertexValue";
import type { Id } from "~/lib/graph/type/id";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function selectedValue(
  meta: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
): Id[] {
  if (isStaticOptions(meta)) {
    // this is causing maximum call stack error when selecting an option
    return untrack(() => ensureArray(data.P[meta.P[IdAttr]]));
  }
  try {
    // when new row added or modified this gives error.
    return meta.P.inward
      ? getParentVertexValue(graph, data, meta)
      : getSelectedVertexValue(graph, data, meta);
  } catch (_e) {
    console.error("Error getting selected value", _e);
    return [];
  }
}
