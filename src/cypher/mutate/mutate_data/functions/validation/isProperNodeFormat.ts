import type { Vertex } from "~/lib/graph/type/vertex";

export function isProperNodeFormat(node: Partial<Vertex>): null | string {
  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    ("Node must be an object");
  }
  if (!("L" in node && Array.isArray(node.L)) || node.L.length < 1) {
    return "Node must contain L (labels) which must be an array with at least one item";
  }
  if (node.L.length > 1) {
    return "node L (labels) must be an array and should contain at least  one item.";
  }
  if (node.L.some((label: any) => typeof label !== "string")) {
    return "Each label in node L must be a string";
  }
  if (
    !("P" in node) ||
    typeof node.P !== "object" ||
    node === null ||
    Array.isArray(node.P)
  ) {
    return "Node must have P (properties) which must be an object";
  }
  if (!("id" in node)) {
    return "Node must have an 'id' key";
  }
  return null;
}
