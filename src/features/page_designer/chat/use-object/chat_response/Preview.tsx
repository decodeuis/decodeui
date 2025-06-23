import { createSignal, For, onCleanup, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import { IconButton } from "~/components/styled/IconButton";
import { evalExpression } from "~/lib/expression_eval";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { headerIconButtonCss, toolBarCss } from "~/pages/settings/constants";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../../context/LayoutContext";
import { IFramePreview } from "../../../layout/IFramePreview";
import {
  insertAtPosition,
  insertComponents,
} from "../functions/insertAtPosition";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";

export function Preview(props: {
  message: Vertex;
  object: {
    vertexes: Vertex[];
    edges: Edge[];
    [key: string]: any;
  };
}) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  // Import the graph structure using the utility function
  const importResult = importGraphStructure(props.object, graph, setGraph);

  // Process the imported graph to create parent vertex and organize vertices
  const { metaTxnId, parentId, labelGroups } = processImportedGraph(
    importResult,
    graph,
    setGraph,
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const MainPreview = () => {
    const [isPreview, setIsPreview] = createSignal(true);
    const [insertMode, setInsertMode] = createSignal<
      "after" | "before" | "center"
    >("after");

    const handleRefresh = () => {
      setIsPreview(false);
      setTimeout(() => {
        setIsPreview(true);
      }, 100);
    };

    const formId = uuidv7();
    return (
      <Show
        fallback={
          <As
            as="div"
            css={[
              `return \`._id {text-align: center; padding: 16px; color: \${args.theme.var.color.primary};}\`;`,
            ]}
          >
            No Preview Available
          </As>
        }
        when={
          props.object.vertexes?.length > 0 &&
          (
            (evalExpression("->Attr", {
              graph,
              setGraph,
              vertexes: [graph.vertexes[parentId]],
            }) as Vertex[]) || []
          ).length > 0
        }
      >
        <As
          as="div"
          css={`return \`._id {
  display: none;
}\`;`}
        >
          <PageViewWrapper
            formDataId={parentId}
            hideSaveCancelButton
            isNoPermissionCheck={true}
            isDesignMode={true}
            pageVertexName="Page"
            uuid={formId}
          />
        </As>

        <Show when={graph.vertexes[formId]}>
          <As
            as="div"
            css={[
              toolBarCss,
              `return \`._id {

}\`;`,
            ]}
          >
            <IconButton
              css={headerIconButtonCss}
              size={18}
              icon="ph:arrows-counter-clockwise"
              onClick={handleRefresh}
            />
          </As>
          <Show when={isPreview()}>
            <IFramePreview formStoreId={formId} noMinHeight />
          </Show>

          <As
            as="div"
            css={[
              `return \`._id {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: space-between;
}\`;`,
            ]}
          >
            <As
              as="div"
              css={[
                `return \`._id {
  display: flex;
  gap: 8px;
}\`;`,
              ]}
            >
              <As
                as="select"
                css={`return \`._id {
  padding: 8px;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 6px;
}\`;`}
                onChange={(e) =>
                  setInsertMode(
                    e.currentTarget.value as "after" | "before" | "center",
                  )
                }
                value={insertMode()}
              >
                <option value="before">Insert Before</option>
                <option value="after">Insert After</option>
                <option value="center">Insert Into</option>
              </As>

              <IconButton
                css={`return \`._id {
  background-color: transparent;
  padding: 4px;
  border-radius: 4px;
  hover: {
    background-color: \${args.theme.var.color.primary_light_800};
  }
}\`;`}
                disabled={
                  layoutStoreVertex()?.P.formId === formId ||
                  !layoutStoreVertex()?.P.formId ||
                  !graph.vertexes[
                    graph.vertexes[layoutStoreVertex()?.P.formId]?.P
                      ?.selectedId || ""
                  ]
                }
                icon="ph:plus-circle"
                onClick={() =>
                  insertAtPosition(
                    graph.vertexes[formId],
                    insertMode(),
                    graph,
                    setGraph,
                    layoutStoreVertex,
                  )
                }
                title="Insert"
              />
            </As>
          </As>
        </Show>
      </Show>
    );
  };

  const ComponentPreview = () => {
    const componentVertexes = () =>
      (evalExpression("->Component", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[parentId]],
      }) as Vertex[]) || [];

    return (
      <For each={componentVertexes()}>
        {(componentVertex) => {
          const [isPreview, setIsPreview] = createSignal(true);
          const formId = uuidv7();
          return (
            <As
              as="div"
              css={[
                `return \`._id {
  margin-bottom: 24px;
}\`;`,
              ]}
            >
              <As
                as="div"
                css={[
                  `return \`._id {
  display: none;
}\`;`,
                ]}
              >
                <PageViewWrapper
                  formDataId={componentVertex.id}
                  hideSaveCancelButton
                  isNoPermissionCheck={true}
                  pageVertexName="Component"
                  uuid={formId}
                />
              </As>

              <Show when={graph.vertexes[formId]}>
                <As
                  as="div"
                  css={[
                    toolBarCss,
                    `return \`._id {
  display: none;
}\`;`,
                  ]}
                >
                  <IconButton
                    css={`return \`._id {
  background-color: transparent;
  padding: 4px;
  border-radius: 4px;
  hover: {
    background-color: \${args.theme.var.color.primary_light_800};
  }
}\`;`}
                    icon="ph:arrows-clockwise"
                    onClick={() => {
                      setIsPreview(false);
                      setTimeout(() => setIsPreview(true), 100);
                    }}
                  />
                </As>

                <Show when={isPreview()}>
                  <IFramePreview formStoreId={formId} noMinHeight />
                </Show>

                <As
                  as="div"
                  css={[
                    `return \`._id {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}\`;`,
                  ]}
                >
                  <IconButton
                    css={`return \`._id {
  background-color: transparent;
  padding: 4px;
  border-radius: 4px;
  hover: {
    background-color: \${args.theme.var.color.primary_light_800};
  }
}\`;`}
                    disabled={
                      layoutStoreVertex()?.P.formId === formId ||
                      !layoutStoreVertex()?.P.formId
                    }
                    icon="ph:plus-circle"
                    onClick={() =>
                      insertComponents(
                        [componentVertex],
                        graph,
                        setGraph,
                        layoutStoreVertex,
                      )
                    }
                    title="Insert Component"
                  />
                </As>
              </Show>
            </As>
          );
        }}
      </For>
    );
  };
  return (
    <div>
      <Show
        fallback={
          <As
            as="div"
            css={[
              `return \`._id {
  text-align: center;
  padding: 16px;
  color: \${args.theme.var.color.primary};
}\`;`,
            ]}
          >
            No Preview Available
          </As>
        }
        when={
          props.object.vertexes?.length > 0 &&
          ((
            (evalExpression("->Attr", {
              graph,
              setGraph,
              vertexes: [graph.vertexes[parentId]],
            }) as Vertex[]) || []
          ).length > 0 ||
            (
              (evalExpression("->Component", {
                graph,
                setGraph,
                vertexes: [graph.vertexes[parentId]],
              }) as Vertex[]) || []
            ).length > 0)
        }
      >
        <MainPreview />
        <ComponentPreview />
      </Show>
    </div>
  );
}

// onDelete={(msg) => deleteRow( msg, false,graph,setGraph,formStoreVertex()?.P.txnId!)}
