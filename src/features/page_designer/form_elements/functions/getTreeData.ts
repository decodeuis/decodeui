import type { SetStoreFunction, Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export interface NavItem {
  children?: NavItem[];
  expanded: boolean;
  id: string;
  key: string;
  P: any;
}

export function getTreeData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    addChild?: (child: Vertex) => boolean;
    nameExpr?: (child: Vertex) => string;
  },
): NavItem[] {
  const getChildren = (
    levels: { [key: string]: any },
    vertexes: Vertex[],
  ): NavItem[] => {
    const result: NavItem[] = [];
    if (!levels.collection) {
      return result;
    }
    const children = evalExpression(levels.collection, {
      graph,
      setGraph,
      vertexes: vertexes,
    }) as Vertex[];
    for (const child of (children || []).sort(
      (a, b) => a.P.displayOrder - b.P.displayOrder,
    )) {
      if (!child?.P?.key) {
        continue;
      }
      const key =
        levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.key;
      const navItem: NavItem = {
        expanded: true,
        ...child,
        key: key,
      };
      if (
        levels.child &&
        ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)
      ) {
        navItem.children = getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  return getChildren(treeLevels, vertexes);
}
