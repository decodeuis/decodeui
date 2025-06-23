import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona";

import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";

import { uniqueNameKey } from "../../../constants/constant";
import { getChildrenAttrs } from "../../layout/getChildrenAttrs";
import { sortChildren } from "./sortChildren";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getUniqueName } from "~/features/page_designer/functions/form/getUniqueName";

export function getRowProps(
  fromVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
) {
  const props = klona(fromVertex.P);
  delete props.displayOrder;
  const uniqueName = getUniqueName(txnId, graph, setGraph, formVertex, {
    id: 0,
  } as unknown as Vertex);
  return { ...props, [uniqueNameKey]: uniqueName };
}

export function processChildrenAttrs(
  formVertex: Vertex,
  fromVertex: Vertex,
  toVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrMetaVertex: Vertex,
) {
  const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
  const results = [];
  for (const child of childrenVertexes) {
    const props = getRowProps(child, txnId, graph, setGraph, formVertex);
    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toVertex,
      props,
      false,
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];
    processChildrenAttrs(
      formVertex,
      child,
      rowVertex,
      txnId,
      graph,
      setGraph,
      attrMetaVertex,
    );
    results.push(rowResult.vertexId!);
  }
  // Sort children vertices in their parent
  sortChildren(
    graph,
    setGraph,
    txnId,
    undefined,
    toVertex,
    undefined,
    "center",
  );
  return results;
}
