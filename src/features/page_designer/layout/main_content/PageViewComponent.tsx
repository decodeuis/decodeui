import { createSignal, For, Show, createEffect } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { ResizableContainer } from "~/components/styled/ResizableDivView";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { IFramePreview } from "../IFramePreview";
import { PageTabBar } from "./PageTabBar";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PageViewComponent(props: { mainPanel: Id }) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const [isPreview, setIsPreview] = createSignal(true);
  const [highlightedViewId, setHighlightedViewId] = createSignal<Id | null>(
    null,
  );

  const handleRefresh = () => {
    // Toggle isPreview to force iframe refresh
    setIsPreview(false);
    setTimeout(() => {
      setIsPreview(true);
    }, 100);
  };

  const handleClose = (openedFormId: Id, openedViewId: Id) => {
    const formStore = graph.vertexes[graph.vertexes[openedFormId].P.formId]
      ?.P as FormStoreObject;
    if (!formStore?.openedViews) {
      return;
    }

    const updatedOpenedViews = formStore.openedViews.filter(
      (view) => view !== openedViewId,
    );

    mergeVertexProperties<FormStoreObject>(
      0,
      graph.vertexes[openedFormId].P.formId,
      graph,
      setGraph,
      {
        openedViews: updatedOpenedViews,
      },
    );
    // delete here will call PageViewWrapper onClenup and the UI gives error.
    // TODO: Fix this logic
    // deleteVertex(0, openedFormId, graph, setGraph);
  };

  // Check for newly added views and highlight them
  createEffect(() => {
    const openedFormIds = layoutStore().openedFormIds.filter(
      (id) => graph.vertexes[id].P.mainPanel === props.mainPanel,
    );

    for (const openedFormId of openedFormIds) {
      const formStoreVertex = graph.vertexes[
        graph.vertexes[openedFormId].P.formId
      ] as Vertex<FormStoreObject>;

      if (formStoreVertex?.P.lastAddedViewId) {
        setHighlightedViewId(formStoreVertex.P.lastAddedViewId);

        // Reset the lastAddedViewId after a short delay
        setTimeout(() => {
          mergeVertexProperties<FormStoreObject>(
            0,
            formStoreVertex.id,
            graph,
            setGraph,
            {
              lastAddedViewId: null,
            },
          );
          // Keep highlight effect a bit longer than tracking
          setTimeout(() => {
            setHighlightedViewId(null);
          }, 2000);
        }, 500);

        break;
      }
    }
  });

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}\`;`}
    >
      <For
        each={layoutStore().openedFormIds.filter(
          (id) => graph.vertexes[id].P.mainPanel === props.mainPanel,
        )}
      >
        {(openedFormId) => {
          const isActive = () => {
            // Type assertion for dynamic property access
            const key =
              `mainPanel${props.mainPanel}Tab` as keyof PageLayoutObject;
            // Using type assertion as a workaround for the dynamic property access
            const layoutStoreValue = layoutStore() as Record<string, unknown>;
            return (
              layoutStoreValue[key] === graph.vertexes[openedFormId].P.formId
            );
          };
          const formStoreVertex = () =>
            graph.vertexes[
              graph.vertexes[openedFormId].P.formId
            ] as Vertex<FormStoreObject>;

          return (
            <Show when={formStoreVertex()?.id}>
              <For each={formStoreVertex()?.P.openedViews}>
                {(openedViewId, index) => {
                  const isHighlighted = () =>
                    highlightedViewId() === openedViewId;

                  // Create a reference to scroll to the highlighted view
                  let viewRef: HTMLDivElement | undefined;

                  createEffect(() => {
                    if (isHighlighted() && viewRef) {
                      viewRef.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                      // When a view is highlighted, also scroll its parent container to the top
                      // to ensure the view is fully visible
                      if (viewRef?.parentElement?.parentElement) {
                        viewRef.parentElement.parentElement.scrollTop = 0;
                      }
                    }
                  });

                  return (
                    <As
                      as="div"
                      css={
                        isActive() ? "" : `return \`._id {display: none;}\`;`
                      }
                      ref={viewRef}
                    >
                      <PageTabBar
                        formStoreId={graph.vertexes[openedFormId].P.formId}
                        handleRefresh={handleRefresh}
                        onClose={() => handleClose(openedFormId, openedViewId)}
                        openIndex={index()}
                        previewsLength={formStoreVertex()?.P.openedViews.length}
                      />
                      <ResizableContainer
                        view={openedViewId}
                        css={
                          isHighlighted()
                            ? [
                                `return \`._id {
                          border: 3px solid \${args.theme.var.color.primary};
                          animation: borderPulse 1.5s infinite alternate;
                        }\`;`,
                                `return \`@keyframes borderPulse {
                            from { border-color: \${args.theme.var.color.primary_light_300}; }
                            to { border-color: \${args.theme.var.color.primary}; }
                          }\`;`,
                              ]
                            : ""
                        }
                      >
                        <Show when={isPreview()}>
                          <IFramePreview
                            formStoreId={graph.vertexes[openedFormId].P.formId}
                          />
                        </Show>
                        {/* <PageView
                                  isDesignMode={true}
                                  isNoPermissionCheck={true}
                                  metaVertex={graph.vertexes[vertex()?.P.formDataId!]}
                                /> */}
                      </ResizableContainer>
                    </As>
                  );
                }}
              </For>
            </Show>
          );
        }}
      </For>
    </As>
  );
}
