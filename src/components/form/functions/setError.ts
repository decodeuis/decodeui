import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { useGraph } from "~/lib/graph/context/UseGraph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";

export function setError(
  errorVertexId: string,
  errorKey: string,
  error: string | undefined,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  if (graph.vertexes[errorVertexId]) {
    mergeVertexProperties(0, errorVertexId, graph, setGraph, {
      [errorKey]: error || "",
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
          [errorKey]: error || "",
        },
      },
      graph,
      setGraph,
    );
  }
}
