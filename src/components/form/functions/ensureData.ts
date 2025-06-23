import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { useGraph } from "~/lib/graph/context/UseGraph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

export function ensureData(
  dataId: string | undefined,
  formId: string,
  formVertex: () => Vertex<FormStoreObject> | undefined,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  // If data vertex exists, return its ID
  if (dataId) {
    return dataId;
  }

  // Create a new form vertex
  const metaVertex = () => graph.vertexes[formVertex()?.P.formMetaId || ""];
  const metaKey = metaVertex()?.P.key;
  if (!metaKey) {
    console.error("Cannot recreate data ID: No meta key found");
    return null;
  }

  const txnId = formVertex()?.P.txnId;
  if (!txnId) {
    console.error("Cannot recreate data ID: No transaction ID found");
    return null;
  }

  const createResult = createFormVertex(
    graph,
    setGraph,
    txnId,
    metaKey,
    {}, // Empty initial properties
  );

  if (createResult.error) {
    console.error("Error creating new data vertex:", createResult.error);
    return null;
  }

  if (createResult.vertex) {
    mergeVertexProperties(0, formId, graph, setGraph, {
      formDataId: createResult.vertex.id,
    });
  }

  // Return the new vertex ID
  return createResult.vertex?.id;
}
