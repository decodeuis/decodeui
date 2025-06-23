import type { SetStoreFunction } from "solid-js/store";

import { v7 as uuidv7 } from "uuid";

import type {
  OpenFormInfo,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function openInNewInternalTab(
  layoutStoreId: Id,
  child: Vertex | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layoutStore = graph.vertexes[layoutStoreId].P as PageLayoutObject;
  if (!child) {
    return;
  }
  // Check if form with same label and dataId already exists
  const exists =
    child.id !== "new" &&
    layoutStore.openedFormIds.some((formId) => {
      const form = graph.vertexes[formId].P as OpenFormInfo;
      return form.label === child.L[0] && form.dataId === child.id;
    });

  if (exists) {
    // Find the existing form and activate it
    const openFormId = layoutStore.openedFormIds.find((formId) => {
      const form = graph.vertexes[formId].P as OpenFormInfo;
      return form.label === child.L[0] && form.dataId === child.id;
    });
    if (openFormId) {
      const existingForm = graph.vertexes[openFormId].P as OpenFormInfo;
      mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
        [`mainPanel${existingForm.mainPanel}Tab`]: existingForm.formId,
        formId: existingForm.formId,
      });
    }
  } else {
    const newOpenVertex = newVertex<OpenFormInfo>(uuidv7(), ["OpenForm"], {
      dataId: child.id,
      formDataId: child.P.formDataId,
      formId: uuidv7(),
      label: child.L[0],
      mainPanel: layoutStore.mainPanel[0],
      parentId: child.P.parentId,
      txnId: child.P.txnId,
    });
    addNewVertex(0, newOpenVertex, graph, setGraph);
    // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        openedFormIds: [...layoutStore.openedFormIds, newOpenVertex.id],
        // Activate the newly created tab
        [`mainPanel${layoutStore.mainPanel[0]}Tab`]: newOpenVertex.P.formId,
        formId: newOpenVertex.P.formId,
      },
      { cloneProperties: false },
    );
  }
}
