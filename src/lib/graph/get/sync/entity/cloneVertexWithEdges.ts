import type { SetStoreFunction } from "solid-js/store";

import { untrack } from "solid-js";

import { generateNewVertexId } from "../../../mutate/core/generateNewVertexId";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function cloneVertexWithEdges(
  txnId: number,
  vertex: Vertex,
  extraProperties: Record<string, any>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): Vertex {
  const vertexId = untrack(() => generateNewVertexId(graph, setGraph));
  untrack(() => {
    addNewVertex(
      txnId,
      newVertex(vertexId, [...vertex.L], {
        ...vertex.P,
        ...extraProperties,
      }),
      graph,
      setGraph,
    );

    //
    // for (const edgeType in vertex.IN) {
    //   for (const inEdgeType of vertex.IN[edgeType]) {
    //     const inEdge = graph.edges[inEdgeType];
    //     const edgeNew = newEdge(
    //       generateNewVertexId(graph),
    //       inEdge.T,
    //       inEdge.P,
    //       inEdge.S,
    //       vertexId,
    //     );
    //     addNewEdge(txnId, edgeNew, graph, setGraph);
    //   }
    // }

    for (const edgeType in vertex.OUT) {
      for (const outEdgeType of vertex.OUT[edgeType]) {
        const outEdge = graph.edges[outEdgeType];
        const edgeNew = newEdge(
          generateNewVertexId(graph, setGraph),
          outEdge.T,
          outEdge.P,
          vertexId,
          outEdge.E,
        );
        addNewEdge(txnId, edgeNew, graph, setGraph);
      }
    }
  });
  return graph.vertexes[vertexId];
}
