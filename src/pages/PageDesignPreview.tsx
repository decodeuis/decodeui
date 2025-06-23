import { createSignal, onMount, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { PageView } from "~/features/page_attr_render/PageView";
import {
  DesignerFormIdContext,
  DesignerLayoutStoreContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { getChannel } from "~/lib/graph/mutate/core/channel/getChannel";
import { handleChannelMessage } from "~/lib/graph/mutate/core/channel/handleChannelMessage";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import type { Id } from "~/lib/graph/type/id";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { Suspense } from "solid-js";
import { reconcile } from "solid-js/store";
import type { JSX } from "solid-js";

export default function PageShareView() {
  const queryParams = new URLSearchParams(window.location.search);
  const mode = queryParams.get("mode");

  if (mode === "isolated") {
    return <IsolatedPreview />;
  }

  const formStoreId = queryParams.get("formStoreId");
  const layoutStoreId = queryParams.get("layoutStoreId");
  if (!formStoreId) {
    return <div>No Form Store ID</div>;
  }
  if (!layoutStoreId) {
    return <div>No Layout Store ID</div>;
  }

  const [graph, setGraph] = useGraph();

  const channel = getChannel(formStoreId);

  channel.onmessage = (msg) =>
    handleChannelMessage(msg, graph, setGraph, formStoreId, formStoreId);

  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const formDataId = () => formStoreVertex()?.P.formDataId;

  onMount(() => {
    window.parent.postMessage({ type: "LOADED" }, "*");
  });

  return (
    <Show when={formStoreVertex() && formDataId()}>
      <DesignerLayoutStoreContext.Provider value={layoutStoreId!}>
        <DesignerFormIdContext.Provider value={formStoreId!}>
          <DroppableWrapper formStoreId={formStoreId}>
            <PageView
              isDesignMode={true}
              isNoPermissionCheck={true}
              metaVertex={graph.vertexes[formDataId()!]}
            />
          </DroppableWrapper>
        </DesignerFormIdContext.Provider>
      </DesignerLayoutStoreContext.Provider>
    </Show>
  );
}

function IsolatedPreview() {
  const queryParams = new URLSearchParams(window.location.search);
  const channelId = queryParams.get("channelId");
  const layoutStoreId = queryParams.get("layoutStoreId");
  const [itemData, setItemData] = createSignal<{
    id: Id;
    pageVertexName: string;
    formMetaId?: Id;
  } | null>(null);
  const [graph, setGraph] = useGraph();

  if (!channelId) {
    return <div>No Channel ID</div>;
  }

  if (!layoutStoreId) {
    return <div>No Layout Store ID</div>;
  }

  const channel = getChannel(channelId);

  onMount(() => {
    // Handle incoming messages
    channel.onmessage = (msg) => {
      const data = JSON.parse(msg);
      if (data.graph && data.item) {
        // Set the initial graph data
        setGraph(reconcile(data.graph));
        setItemData(reconcile(data.item));
      } else {
        // Handle regular channel messages
        handleChannelMessage(msg, graph, setGraph, channelId, channelId);
      }
    };

    // Notify parent that iframe is loaded
    window.parent.postMessage({ type: "LOADED", channelId }, "*");
  });

  return (
    <Show when={itemData()}>
      {(item) => (
        <DesignerLayoutStoreContext.Provider value={layoutStoreId}>
          <Suspense>
            <PageViewWrapper
              formId={item().id}
              formMetaId={item().formMetaId}
              hideSaveCancelButton
              isNoPermissionCheck={true}
              pageVertexName={item().pageVertexName}
            />
          </Suspense>
        </DesignerLayoutStoreContext.Provider>
      )}
    </Show>
  );
}

function DroppableWrapper(props: {
  children: JSX.Element;
  formStoreId: string;
}) {
  const [graph, setGraph] = useGraph();
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const queryParams = new URLSearchParams(window.location.search);
  const noMinHeight = queryParams.get("noMinHeight") === "true";
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId] as Vertex<FormStoreObject>;

  return (
    <As
      as="div"
      css={`return \`._id {
        ${noMinHeight ? "" : "min-height: 300px;"}
        ${isDraggingOver() ? "background-color: ${args.theme.var.color.background_light_100};" : ""}
      }\`;`}
      onClick={() => {
        onLayoutItemClick(
          layoutStoreVertex(),
          formStoreVertex(),
          undefined as unknown as Id,
          graph,
          setGraph,
        );
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDragOver={(e) => {
        e.preventDefault(); // Allow drop
        setIsDraggingOver(true);
      }}
      onDrop={async (e) => {
        setIsDraggingOver(false);
        mergeVertexProperties<PageLayoutObject>(
          0,
          layoutStoreId,
          graph,
          setGraph,
          {
            activeItem: formStoreVertex()?.P.formDataId,
            dragPosition: "center",
          },
        );

        await handleDrop(
          e,
          layoutStoreVertex(),
          formStoreVertex(),
          graph,
          setGraph,
          (error) => console.error(error),
        );
        resetDragDropState(layoutStoreVertex(), graph, setGraph);
      }}
    >
      {props.children}
    </As>
  );
}
