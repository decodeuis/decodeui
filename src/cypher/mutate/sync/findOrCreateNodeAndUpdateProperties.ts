// Function to handle transfer of a single node.
import type { Session } from "neo4j-driver";

import { findExistingNode } from "~/cypher/get/find/findExistingNode";
import { createNode } from "~/cypher/mutate/sync/createNode";
import { updateNodeProperties } from "~/cypher/mutate/sync/updateNodeProperties";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function findOrCreateNodeAndUpdateProperties(
  // transferNode
  _sessionSource: Session,
  sessionTarget: Session,
  node: Vertex,
  nodeType: string,
) {
  const properties = { ...node.P };
  const existingNode = await findExistingNode(
    sessionTarget,
    nodeType,
    properties.key,
  );

  let createdNode;
  if (existingNode) {
    const existingProperties = existingNode.P;
    const propertiesAreDifferent = Object.keys(properties).some(
      (key) =>
        key !== "createdAt" &&
        key !== "updatedAt" &&
        properties[key] !== existingProperties[key],
    );

    if (propertiesAreDifferent) {
      createdNode = await updateNodeProperties(
        sessionTarget,
        existingNode,
        properties,
      );
    } else {
      createdNode = existingNode;
    }
  } else {
    createdNode = await createNode(sessionTarget, nodeType, properties);
  }
  return createdNode;
}
