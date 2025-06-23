import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { type IDBPDatabase, openDB } from "idb";
import { createEffect, type JSX, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { v7 as uuidv7 } from "uuid";

import { ZIndex } from "~/components/fields/ZIndex";
import {
  DesignerLayoutStoreContext,
  getInitialDesignerLayoutStore,
  type PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";
import { Title } from "@solidjs/meta";

const RenderMainContent = clientOnly(() => import("./RenderMainContent"));

export function PageDesignerWrapper(): JSX.Element {
  const params = useParams();
  const initialStore = getInitialDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  let dbPromise: Promise<IDBPDatabase<unknown>> | undefined;
  if (!isServer) {
    dbPromise = openDB("keyval-store", 1, {
      upgrade(db) {
        db.createObjectStore("keyval");
      },
    });
  }

  const formId = uuidv7();

  const newOpenVertex = newVertex(uuidv7(), ["OpenForm"], {
    dataId: params.id,
    formId,
    label: params.entity,
    mainPanel: initialStore.mainPanel[0],
  });
  addNewVertex(0, newOpenVertex, graph, setGraph);

  const vertex = newVertex<PageLayoutObject>(
    initialStore.id,
    ["PageDesigner"],
    {
      ...initialStore,
      [`mainPanel${initialStore.mainPanel[0]}Tab`]: formId,
      formId,
      mainFormId: formId,
      openedFormIds: [newOpenVertex.id],
    },
  );
  addNewVertex(0, vertex, graph, setGraph);

  onCleanup(() => {
    for (const vertexId of graph.vertexes[initialStore.id].P.openedFormIds) {
      deleteVertex(0, vertexId, graph, setGraph);
    }
    deleteVertex(0, initialStore.id, graph, setGraph);
  });

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    mergeVertexProperties<PageLayoutObject>(
      0,
      initialStore.id,
      graph,
      setGraph,
      {
        isSmallScreen,
      },
    );
  };

  const debouncedHandleResize = debounce(handleResize, 200);

  onMount(async () => {
    if (isServer) {
      return;
    }

    if (dbPromise) {
      // Get stored layout properties
      const db = await dbPromise;
      const storedLayout = await db.get("keyval", "page_designer_layout");
      if (storedLayout) {
        mergeVertexProperties<PageLayoutObject>(
          0,
          initialStore.id,
          graph,
          setGraph,
          storedLayout,
        );
      }
    }

    handleResize(); // Initial check
    makeEventListener(window, "resize", debouncedHandleResize);
    // fetchCompExamples();
  });

  // Save layout properties on change
  createEffect(() => {
    if (isServer) {
      return;
    }

    const layoutVertex = graph.vertexes[
      initialStore.id
    ] as Vertex<PageLayoutObject>;
    if (!(layoutVertex && dbPromise)) {
      return;
    }

    const widthProps = {
      isLeftOpen: layoutVertex.P.isLeftOpen,
      isRight0Open: layoutVertex.P.isRight0Open,
      isRight1Open: layoutVertex.P.isRight1Open,
      isRight2Open: layoutVertex.P.isRight2Open,
      leftWidth: layoutVertex.P.leftWidth,
      rightWidth0: layoutVertex.P.rightWidth0,
      rightWidth1: layoutVertex.P.rightWidth1,
      rightWidth2: layoutVertex.P.rightWidth2,
      // Note: this does not work because we use uuidv7 for the mainPanel ids
      ...layoutVertex.P.mainPanel.reduce(
        (acc, panel) => ({
          ...acc,
          [`mainPanel${panel}Width`]: layoutVertex.P[`mainPanel${panel}Width`],
        }),
        {},
      ),
    };

    (async () => {
      if (!isServer && dbPromise) {
        const db = await dbPromise;
        await db.put("keyval", widthProps, "page_designer_layout");
      }
    })();
  });

  // Now we are not have comp examples
  // const fetchCompExamples = async () => {
  //   // setGridState("isLoading", true);
  //   const data = await getTableData(
  //     graph,
  //     FormMetaData.CompExample,
  //     "CompExample",
  //     undefined,
  //     undefined,
  //     false,
  //   );
  //   if (isValidResponse(data)) {
  //     setGraphData(graph, setGraph, data.graph!);
  //   } else {
  //     console.error("error", getErrorMessage(data));
  //   }
  // };

  // const layoutStore = () =>
  //   graph.vertexes[initialStore.id].P as PageLayoutObject;

  return (
    <ZIndex>
      <DesignerLayoutStoreContext.Provider value={initialStore.id}>
        <Title>{getTitle(`${params.entity} Builder`, graph)}</Title>
        <RenderMainContent />
      </DesignerLayoutStoreContext.Provider>
    </ZIndex>
  );
}
