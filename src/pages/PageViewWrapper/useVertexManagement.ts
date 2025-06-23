import { onCleanup } from "solid-js";
import { v7 as uuidv7 } from "uuid";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { createViewVertex } from "~/lib/graph/mutate/vertex/createViewVertex";
import { createCompContextVertex } from "~/lib/graph/mutate/vertex/createCompContextVertex";
import { getInitialFormStore } from "~/components/form/context/FormContext";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { SetStoreFunction } from "solid-js/store";
import type { PageViewWrapperProps } from "~/pages/PageViewWrapper/types";

interface UseVertexManagementOptions {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  id: () => Id | undefined;
}

export function useVertexManagement(
  props: Readonly<PageViewWrapperProps>,
  options: UseVertexManagementOptions,
) {
  const layoutStoreId = props.uuid ?? uuidv7();

  // Create view vertex
  const viewVertexObject = createViewVertex(
    { view: "Desktop" },
    options.graph,
    options.setGraph,
  );

  // Create component vertex
  const componentVertexObject = createCompContextVertex(
    {},
    options.graph,
    options.setGraph,
  );

  // Get initial form store
  const initialFormStore = getInitialFormStore(options.graph, options.setGraph);

  // Create page form vertex
  const pageFormVertexObject = newVertex(layoutStoreId, ["PageForm"], {
    ...initialFormStore,
    componentValue: componentVertexObject.id,
    formId: props.pageVertexName,
    id: options.id()!,
    isFetching: false,
    openedViews: [viewVertexObject.id],
    txnId: props.txnId ?? initialFormStore.txnId,
  });

  // Add page form vertex to graph
  addNewVertex(0, pageFormVertexObject, options.graph, options.setGraph);

  // Form store accessors
  const formStore = () =>
    options.graph.vertexes[pageFormVertexObject.id] as Vertex<FormStoreObject>;

  const setFormStore = (key: string, value: unknown) => {
    mergeVertexProperties<FormStoreObject>(
      0,
      pageFormVertexObject.id,
      options.graph,
      options.setGraph,
      { [key]: value },
    );
  };

  // Error vertex management
  let errorVertexId: string | undefined;

  function createErrorVertex(dataId: string) {
    // Delete previous error vertex if exists
    if (errorVertexId) {
      deleteVertex(0, errorVertexId, options.graph, options.setGraph);
    }

    errorVertexId = `${dataId}-error`;
    const errorVertex = newVertex(errorVertexId, ["Error"], {
      dataId: dataId,
      message: "",
      timestamp: new Date().toISOString(),
    });
    addNewVertex(0, errorVertex, options.graph, options.setGraph);
    return errorVertexId;
  }

  // Setup cleanup handlers
  onCleanup(() => {
    for (const viewId of formStore()?.P?.openedViews ?? []) {
      deleteVertex(0, viewId, options.graph, options.setGraph);
    }
  });

  onCleanup(() => {
    deleteVertex(0, componentVertexObject.id, options.graph, options.setGraph);
  });

  onCleanup(() => {
    if (errorVertexId) {
      deleteVertex(0, errorVertexId, options.graph, options.setGraph);
    }
  });

  // Note: onCleanUp will be called in reverse order of the cleanup functions
  onCleanup(() => {
    deleteVertex(0, pageFormVertexObject.id, options.graph, options.setGraph);
  });

  return {
    layoutStoreId,
    viewVertexObject,
    componentVertexObject,
    pageFormVertexObject,
    formStore,
    setFormStore,
    createErrorVertex,
  };
}
