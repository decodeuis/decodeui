import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";

export function getToEdge(meta: Vertex, vertex: Vertex): string {
  if (meta.P.type) {
    return meta.P.type;
  }

  const attributeId = meta.P[IdAttr];
  return (
    capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId)
  );
}
