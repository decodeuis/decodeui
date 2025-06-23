import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import { validateInput } from "~/features/page_designer/settings/properties/validations/validateInput";

import { commitTxn } from "../../transaction/core/commitTxn";
import { generateNewTxnId } from "../../transaction/core/generateNewTxnId";
import { onChangeHandler } from "./onChangeHandler";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function setValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  metaVertex: Vertex,
  dataVertex: Vertex,
  data: unknown,
  isRealTime: boolean,
) {
  if (!dataVertex) {
    return;
  }

  // after commit, we can not use same txnId();
  if (isRealTime) {
    txnId = generateNewTxnId(graph, setGraph);
  }
  let error = "" as string | undefined;
  batch(() => {
    if (metaVertex.P.validation) {
      error = validateInput(
        metaVertex.P.validation,
        data as number | string,
        metaVertex.P.key,
        metaVertex.P.label,
      );
      const errorVertexId = `${dataVertex.id}-error`;
      if (graph.vertexes[errorVertexId]) {
        mergeVertexProperties(0, errorVertexId, graph, setGraph, {
          [metaVertex.P.key]: error || "",
        });
      } else {
        addNewVertex(
          0,
          {
            id: errorVertexId,
            IN: {},
            L: ["Error"],
            OUT: {},
            P: {
              [metaVertex.P.key]: error || "",
            },
          },
          graph,
          setGraph,
        );
      }
    }

    mergeVertexProperties(txnId, dataVertex.id, graph, setGraph, {
      [metaVertex.P[IdAttr]]: data,
    });

    // we directly save the dataType on vertex:
    // don't call setGraph directly.
    // setGraph("vertexes", dataVertex.id, "D", {
    //   [metaVertex.P[IdAttr]]: metaVertex.P.dataType,
    // });

    onChangeHandler(txnId, dataVertex, dataVertex, metaVertex, graph, setGraph);
  });

  if (isRealTime) {
    commitTxn(txnId, graph);
  }
}
