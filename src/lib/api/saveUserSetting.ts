import type { SetStoreFunction } from "solid-js/store";

import { getGlobalStore } from "../graph/get/sync/store/getGlobalStore";
import { commitTxn } from "../graph/transaction/core/commitTxn";
import { generateNewTxnId } from "../graph/transaction/core/generateNewTxnId";
import { submitDataCall } from "./service/data/submitDataCall";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function saveUserSetting(
  properties: { [key: string]: any },
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const newTxn = generateNewTxnId(graph, setGraph);
  mergeVertexProperties(
    newTxn,
    getGlobalStore(graph).P.userSettingId,
    graph,
    setGraph,
    properties,
  );
  const data = commitTxn(newTxn, graph);
  if (!data) {
    return;
  }
  submitDataCall({ ...data }, graph, setGraph, newTxn);
}
