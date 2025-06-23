import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";

import { insertNewRow } from "~/components/fields/table_field/functions/insertNewRow";
import { openInNewInternalTab } from "~/features/page_designer/form_elements/pages/functions/openInNewInternalTab";
import { handleDropAtPosition } from "~/features/page_designer/functions/drag_drop/core/handleDropAtPosition";
import { evalExpression } from "~/lib/expression_eval";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { setPreventUndoAtOrBeforeIndex } from "~/lib/graph/transaction/steps/setPreventUndoAtOrBeforeIndex";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function insertAtPosition(
  fromStoreVertex: Vertex,
  insertMode: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreVertex: () => Vertex<PageLayoutObject>,
) {
  if (
    !fromStoreVertex ||
    layoutStoreVertex()?.P.formId === fromStoreVertex.P.formId ||
    !layoutStoreVertex()?.P.formId
  ) {
    console.warn("cannot insert at position");
    return;
  }

  const toStoreVertex = graph.vertexes[
    layoutStoreVertex().P.formId!
  ] as Vertex<FormStoreObject>;
  if (!(toStoreVertex && graph.vertexes[toStoreVertex.P.selectedId!])) {
    console.warn("cannot insert at position");
    return;
  }

  const formDataVertex = graph.vertexes[fromStoreVertex.P.formDataId!];

  const Attrs =
    evalExpression("->Attr", { graph, setGraph, vertexes: [formDataVertex] }) ||
    [];
  // Check for Component and insert if exists
  const componentVertexes =
    (evalExpression("->Component", {
      graph,
      setGraph,
      vertexes: [formDataVertex],
    }) as Vertex[]) || [];

  const newTxnId = Attrs.length === 0 ? undefined : toStoreVertex.P.txnId;
  insertComponents(
    componentVertexes,
    graph,
    setGraph,
    layoutStoreVertex,
    fromStoreVertex.P.formDataId!,
    newTxnId,
  );

  // TODO: modify function to use new component Ids for component connected with "Attr".
  handleDropAtPosition(
    graph,
    setGraph,
    toStoreVertex.P.txnId,
    graph.vertexes[toStoreVertex.P.formDataId!],
    formDataVertex,
    graph.vertexes[toStoreVertex.P.selectedId!],
    insertMode,
  );
}

export function insertComponents(
  componentVertexes: Vertex[],
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreVertex: () => Vertex<PageLayoutObject>,
  formDataId?: string, // to link with parent form
  txnId?: number,
) {
  for (const componentVertex of componentVertexes) {
    const newTxnId = txnId ? txnId : generateNewTxnId(graph, setGraph);
    const componentId = generateNewVertexId(graph, setGraph);
    const componentResult = addNewVertex(
      newTxnId,
      {
        id: componentId,
        IN: {},
        L: ["Component"],
        OUT: {},
        P: { ...componentVertex.P },
      },
      graph,
      setGraph,
    );

    if (componentResult.error) {
      continue;
    }

    setPreventUndoAtOrBeforeIndex(newTxnId, graph, setGraph);

    // Check for ComponentVariant
    const variantVertexes =
      (evalExpression("->ComponentVariant", {
        graph,
        setGraph,
        vertexes: [componentVertex],
      }) as Vertex[]) || [];

    for (const variantVertex of variantVertexes) {
      // Insert ComponentVariant
      const variantRow = insertNewRow(
        newTxnId,
        { P: { type: "ComponentVariant" } } as unknown as Vertex,
        graph.vertexes[componentId],
        false,
        graph,
        setGraph,
        variantVertex.P,
      );

      // Check for ComponentVariantOptions
      const optionsVertexes =
        (evalExpression("->ComponentVariantOption", {
          graph,
          setGraph,
          vertexes: [variantVertex],
        }) as Vertex[]) || [];

      for (const optionsVertex of optionsVertexes) {
        // Insert ComponentVariantOptions
        const _optionsRow = insertNewRow(
          newTxnId,
          { P: { type: "ComponentVariantOption" } } as unknown as Vertex,
          graph.vertexes[variantRow!.vertexId!],
          false,
          graph,
          setGraph,
          optionsVertex.P,
        );
      }
    }

    const fromVertex1 = {
      ...componentVertex,
      L: ["Page"],
      P: { ...componentVertex.P, as: "", componentName: "Html" },
    } as Vertex;
    handleDropAtPosition(
      graph,
      setGraph,
      newTxnId,
      graph.vertexes[componentId],
      fromVertex1,
      graph.vertexes[componentId],
      "center",
    );

    openInNewInternalTab(
      layoutStoreVertex().id,
      {
        ...graph.vertexes[componentId],
        P: {
          formDataId: componentId,
          parentId: formDataId,
          txnId: newTxnId,
          ...graph.vertexes[componentId].P,
        },
      } as Vertex,
      graph,
      setGraph,
    );
  }
}
