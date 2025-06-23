import { evalExpressionAsync } from "~/lib/expression_eval";

import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

interface TreeNode {
  children?: TreeNode[];
  expanded: boolean;
  id: string;
  key: string;
  P: any;
}

interface TreeOptions {
  addChild?: (child: Vertex) => boolean;
  nameExpr?: (child: Vertex) => string;
}

export async function getTreeDataAPICall(
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options: TreeOptions = {},
) {
  "use server";
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const getChildren = async (
      levels: { [key: string]: any },
      vertexes: Vertex[],
    ): Promise<TreeNode[]> => {
      if (!levels.collection) {
        return [];
      }

      const children = await evalExpressionAsync(levels.collection, {
        dbSession,
        nodes,
        relationships,
        vertexes,
      });

      const childNodes: TreeNode[] = [];
      // Using await Promise.all close the dbSession first, so used for...of
      for (const child of (children || []).sort(
        (a: Vertex, b: Vertex) => a.P.displayOrder - b.P.displayOrder,
      )) {
        const key =
          levels?.nameExpr?.(child) ||
          options?.nameExpr?.(child) ||
          child.P.key;

        const navItem: TreeNode = {
          expanded: true,
          id: child.id,
          key,
          P: child.P,
        };

        if (
          levels.child &&
          ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)
        ) {
          navItem.children = await getChildren(levels.child, [child]);
        }

        childNodes.push(navItem);
      }

      return childNodes;
    };

    const children = await getChildren(treeLevels, vertexes);

    return {
      children,
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
    };
  } catch (error) {
    console.error("Error fetching tree data:", error);
    throw error; // Rethrow the error after logging
  } finally {
    await dbSession.close();
  }
}
