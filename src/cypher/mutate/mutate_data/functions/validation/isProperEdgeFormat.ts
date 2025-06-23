import type { Edge } from "~/lib/graph/type/edge";

export function isProperEdgeFormat(edge: Partial<Edge>): string {
  if (typeof edge !== "object" || edge === null || Array.isArray(edge)) {
    return "edge must be an object";
  }
  if (edge.T === undefined || typeof edge.T !== "string") {
    return "edge must contain T (type) and it must be a string.";
  }
  if (edge.S === undefined) {
    //  || typeof edge.S !== "number"
    return "edge must contain S (start) and it must be an integer.";
  }
  if (edge.E === undefined) {
    //  || typeof edge.E !== "number"
    return "edge must contain E (end) and it must be an integer.";
  }
  if (
    edge.P === undefined ||
    typeof edge.P !== "object" ||
    edge.P === null ||
    Array.isArray(edge.P)
  ) {
    return "edge must have P (properties) key and it must be an object";
  }
  if (edge.id === undefined) {
    return "edge must have id key";
  }
  return "";
}
