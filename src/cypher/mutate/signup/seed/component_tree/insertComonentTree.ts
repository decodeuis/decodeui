import type { Session, Transaction } from "neo4j-driver";

import type { ComponentNode } from "./type/ComponentTreeType";

export async function insertComponentTree(
  dbSession: Session | Transaction,
  components: ComponentNode[],
  parentId: null | number | string = null,
): Promise<{ success: boolean }> {
  for (const component of components) {
    // Check if the node already exists
    const findNodeResult = await dbSession.run(
      "MATCH (n:Comp {key: $key}) RETURN elementId(n) AS id",
      { key: component.Component },
    );

    let nodeId: number;

    if (findNodeResult.records.length > 0) {
      nodeId = findNodeResult.records[0].get("id");
    } else {
      // Create the node if it doesn't exist, including the 'info' property
      const createNodeResult = await dbSession.run(
        `CREATE (n:Comp {key: $key, info: $info})
         RETURN elementId(n) AS id`,
        { info: "", key: component.Component },
      );
      nodeId = createNodeResult.records[0].get("id");
    }

    if (parentId !== null) {
      await addEdgeIfNotExists(dbSession, parentId, nodeId);
    }

    // Recursively insert the children
    await insertComponentTree(dbSession, component.children || [], nodeId);
  }
  return { success: true };
}

async function addEdgeIfNotExists(
  dbSession: Session | Transaction,
  parentId: number | string,
  childId: number,
): Promise<void> {
  // Check if the edge already exists
  const findEdgeResult = await dbSession.run(
    `MATCH (parent:Comp)<-[r:ParentComp]-(child:Comp)
     WHERE elementId(parent) = $parentId AND elementId(child) = $childId
     RETURN r`,
    { childId: childId, parentId: parentId },
  );

  if (findEdgeResult.records.length === 0) {
    // Create the edge if it doesn't exist
    await dbSession.run(
      `MATCH (parent:Comp), (child:Comp)
       WHERE elementId(parent) = $parentId AND elementId(child) = $childId
       CREATE (parent)<-[:ParentComp]-(child)`,
      { childId: childId, parentId: parentId },
    );
  }
}
