import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Updates the IN and OUT properties of nodes when a relationship is processed
 * Can work with either a EvalExpressionContext object or a direct nodeObj map
 */
export function updateNodeRelations(
  nodes: Record<string, Vertex>,
  relationship: Edge,
): void {
  if (!nodes) {
    return;
  }

  const sourceNode = nodes[relationship.S];
  if (sourceNode) {
    if (!sourceNode.OUT[relationship.T]) {
      sourceNode.OUT[relationship.T] = [];
    }
    sourceNode.OUT[relationship.T].push(relationship.id);
  }

  const targetNode = nodes[relationship.E];
  if (targetNode) {
    if (!targetNode.IN[relationship.T]) {
      targetNode.IN[relationship.T] = [];
    }
    targetNode.IN[relationship.T].push(relationship.id);
  }
}
