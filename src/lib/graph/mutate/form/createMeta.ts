import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona/json";

import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";

import { generateNewVertexId } from "../core/generateNewVertexId";
import { newRow } from "./addNewRow";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function addMetaVertexes(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  attributes: FieldAttribute[],
) {
  const { showErrorToast } = useToast();

  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }
    const { attributes, ...attr } = klona(attribute);
    // if(attribute.componentName === "DynamicTable") attribute.group = attribute.id;
    const addAttributeResult = newRow(
      graph,
      setGraph,
      txnId,
      vertex,
      "Attr",
      "Attr",
      attr,
    );
    if (addAttributeResult.error) {
      showErrorToast(addAttributeResult.error.toString());
    }
    // todo discard transaction
    // if (attribute.componentName === "DynamicTable" && attribute.attributes) {
    if (attribute.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[addAttributeResult.vertexId!],
        attribute.attributes,
      );
    }
    // todo discard transaction
  }
}

export function createMeta(
  form: IFormMetaData,
  metaTxnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  mainLabel?: string,
): { error: string; txnId?: number; vertex?: Vertex } {
  const { attributes, ...custom } = form;
  // save attributes to vertexes
  const metaMainVertex = newVertex(
    generateNewVertexId(graph, setGraph),
    [mainLabel ?? "Temp"],
    custom,
  );
  const { error } = addNewVertex(metaTxnId, metaMainVertex, graph, setGraph);
  if (error) {
    console.error(error);
    return { error };
  }
  const metaVertex = graph.vertexes[metaMainVertex.id];

  addMetaVertexes(graph, setGraph, metaTxnId, metaVertex, attributes);

  return { error: "", txnId: metaTxnId, vertex: metaVertex };
}
