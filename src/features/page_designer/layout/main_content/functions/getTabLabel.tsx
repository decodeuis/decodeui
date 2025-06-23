import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getTabLabel(openedFormId: Id, graph: GraphInterface) {
  let baseLabel = graph.vertexes[openedFormId]?.P.label || "";

  // Remove "Page" suffix if it's not just "Page"
  if (baseLabel !== "Page" && baseLabel.endsWith("Page")) {
    baseLabel = baseLabel.slice(0, -4);
  }

  // Get formId from openedFormId
  const formId = graph.vertexes[openedFormId]?.P.formId;
  if (!formId) {
    return baseLabel;
  }

  // Get formDataId from formId
  const formDataId = graph.vertexes[formId]?.P.formDataId;
  if (!formDataId) {
    return baseLabel;
  }

  // Get key from formDataId
  const key = graph.vertexes[formDataId]?.P.key;

  return key ? `${baseLabel} - ${key}` : baseLabel;
}
