import type { SetStoreFunction, Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";

import { deleteRow } from "./deleteRow";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function deleteNestedLayout(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertexes: Vertex[] = [],
  _options?: {
    addChild?: (child: Vertex) => boolean;
    nameExpr?: (child: Vertex) => string;
  },
) {
  const deleteChildren = (vertexes: Vertex[]) => {
    const children = evalExpression("->Attr", {
      graph,
      vertexes,
    });
    for (const child of children || []) {
      // delete children
      deleteChildren([child]);

      // delete properties:
      const AttrProps = evalExpression("->$0Prop", {
        graph,
        vertexes,
      });
      if (AttrProps) {
        for (const vertex of AttrProps) {
          // delete in edges and out edges of properties
          deleteRow(vertex, false, graph, setGraph, txnId);
          // no commitTxn because, it's not realtime
        }
      }

      // delete in edges and out edges and attr
      deleteRow(child, false, graph, setGraph, txnId);
    }
  };

  deleteChildren(vertexes);
  for (const child of vertexes) {
    deleteRow(child, false, graph, setGraph, txnId);
  }
}
