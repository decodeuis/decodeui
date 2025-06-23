import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import type { Vertex } from "~/lib/graph/type/vertex";

export function getInEdge(meta: Vertex, vertex: Vertex) {
  if (meta.P.type) {
    return meta.P.type;
  }

  const parentLabel = meta.P.parentLabel;
  const childLabel = meta.P.childLabel;
  if (!parentLabel) {
    return "";
  }
  return (
    capitalizeFirstLetter(parentLabel) +
    capitalizeFirstLetter(childLabel || vertex.L[0])
  );
}
