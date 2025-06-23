import type { SetStoreFunction, Store } from "solid-js/store";

import { getOwner, runWithOwner } from "solid-js";

import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function insertNewRow(
  txnId: number,
  meta: Vertex,
  data: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: any } = {},
) {
  if (!data) {
    alert("cant add new row");
    return;
  }
  const outerOwner = getOwner();
  const result = runWithOwner(outerOwner, () =>
    addNewRow(
      txnId || 0,
      meta,
      graph,
      setGraph,
      data,
      properties,
      isRealTime ?? false,
    ),
  );
  if (!result?.error) {
    saveUndoPoint(txnId, graph, setGraph);
  }

  return result;
}
