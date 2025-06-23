import type { SetStoreFunction } from "solid-js/store";

import { componentDrop } from "~/features/page_designer/functions/drag_drop/core/componentDrop";
import { evalExpression } from "~/lib/expression_eval";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import { sortChildren } from "../drag_drop/hierachy/sortChildren";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function cloneLayoutAndChildren(
  layoutVertex: Vertex,
  toExternalVertex: undefined | Vertex,
  externalTxnId: number | undefined,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
) {
  let fromVertex = layoutVertex;
  const toVertex = toExternalVertex ?? layoutVertex;
  const txnId2 = externalTxnId ?? txnId;

  const dragPosition = toExternalVertex ? "center" : "after";

  const toParentVertex =
    toExternalVertex ??
    evalExpression("<-Attr", {
      graph,
      vertexes: [toVertex],
    })?.[0];

  const layoutRowId = componentDrop(
    formData,
    txnId2,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
    undefined,
    undefined,
    toVertex,
    dragPosition,
  );
  if (layoutRowId === -1) {
    return;
  }

  fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toParentVertex!,
    toVertex,
    dragPosition,
  );

  saveUndoPoint(txnId2, graph, setGraph);
}
