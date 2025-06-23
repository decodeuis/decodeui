import type { Record } from "neo4j-driver";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/conversion/convertNodeToJson";

import type { EvalExpressionContext } from "../types/EvalExpressionContext";

import { updateNodeRelations } from "./updateRelations";
import type { Vertex } from "~/lib/graph/type/vertex";

export function processResult(
  records: Record[],
  context: EvalExpressionContext,
  nodeLabel: string | string[],
  typeLabel?: string,
) {
  const vertices: Vertex[] = [];
  const labels = Array.isArray(nodeLabel) ? nodeLabel : [nodeLabel];
  const { nodes, relationships: relationshipMap } = context;

  for (const record of records) {
    // Process nodes
    for (let index = 0; index < labels.length; index++) {
      const label = labels[index];
      const node = record.get(label);
      if (node) {
        const vertex = convertNodeToJson(node);
        if (index === 0) {
          vertices.push(vertex);
        }
        if (nodes) {
          nodes[vertex.id] = vertex;
        }
      }
    }

    // Process relationships
    if (!typeLabel) {
      continue;
    }

    const relationshipData = record.get(typeLabel);
    const relationships = Array.isArray(relationshipData)
      ? relationshipData
      : relationshipData
        ? [relationshipData]
        : [];

    for (const relationship of relationships) {
      const convertedRel = convertRelationshipToJson(relationship);
      if (relationshipMap) {
        updateNodeRelations(context.nodes!, convertedRel);
        relationshipMap[convertedRel.id] = convertedRel;
      }
    }
  }

  return vertices;
}
