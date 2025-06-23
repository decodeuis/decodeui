import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { ServerResult } from "~/cypher/types/ServerResult";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { SearchBar } from "~/components/styled/SearchBar";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/data/fetchAndSetGraphData";
import { STYLES } from "~/pages/settings/constants";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { ComponentItem } from "./ComponentItem";
import { getCompChildren } from "./functions/getCompChildren";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function ComponentList(props: {
  edgeName: string;
  isFetchData?: boolean;
  onDoubleClick?: (fromVertex: Vertex) => void;
  rootExpression?: string;
  rootVertexes?: Vertex[];
}) {
  const [graph, setGraph] = useGraph();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isFetchingData, setIsFetchingData] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [rootCompVertex, setRootCompVertex] = createSignal<Vertex>();
  const [expandedKeys, setExpandedKeys] = createStore<string[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId!] as Vertex<PageLayoutObject>;

  const formStoreVertex = () => {
    const layoutVertex = layoutStoreVertex();
    return layoutVertex
      ? (graph.vertexes[layoutVertex.P.formId!] as Vertex<FormStoreObject>)
      : undefined;
  };

  function toggleExpand(itemId: Id) {
    setExpandedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }

  // Fetch data function
  async function fetchData() {
    try {
      // * allows the traversal to match a path of one or more ParentComp relationships, i.e., a variable-length path.
      const expression = `${props.rootExpression}<-'${props.edgeName}*'`;
      return await fetchAndSetGraphData(
        graph,
        setGraph,
        expression,
        undefined,
        { skipExisting: true },
      );
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Create effect to handle data changes
  onMount(async () => {
    if (!(props.isFetchData ?? true)) {
      return;
    }
    setIsFetchingData(true);
    setError(null); // Clear any previous errors
    const result = await fetchData();
    if ((result as { error: string })?.error) {
      setError((result as { error: string }).error);
    } else if ((result as ServerResult)?.result) {
      if (props.rootExpression?.startsWith("g:")) {
        setGraphData(graph, setGraph, (result as ServerResult).graph!);
        const [label, key] = props
          .rootExpression!.match(/g:'(\w+)\[(\w+)\]'/)!
          .slice(1);
        const rootVertex = findVertexByLabelAndUniqueId(
          graph,
          label, // Comp
          "key",
          key, // Root
        );
        if (rootVertex) {
          setRootCompVertex(rootVertex);
        } else {
          console.warn("No root vertex found in the result");
        }
      }
    }
    setIsFetchingData(false);
  });

  const showComponentSlot = () => {
    return formStoreVertex()?.P.formId === "Component";
  };

  // Filter children based on search query
  const filteredChildren = createMemo(() => {
    const children =
      props.rootVertexes ||
      (rootCompVertex()
        ? getCompChildren([rootCompVertex()!], props.edgeName, graph)
        : []);
    const query = searchQuery().toLowerCase();

    // First filter by component type if showComponentSlot is true
    const typeFiltered = showComponentSlot()
      ? children
      : children.filter((child) => (child.P.key as string) !== "Slot");

    // Then filter by search query
    return typeFiltered
      .filter((child) =>
        ((child.P.label as string) || (child.P.key as string) || "")
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) =>
        ((a.P.key as string) || "").localeCompare((b.P.key as string) || ""),
      );
  });

  return (
    <>
      <Show when={error()}>
        <As
          as="div"
          css={`return \`._id {
            background-color: \${args.theme.var.color.error_light_50};
            border: 1px solid \${args.theme.var.color.error_light_200};
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
            color: \${args.theme.var.color.error_dark_700};
            font-size: 14px;
          }\`;`}
        >
          Error: {error()}
        </As>
      </Show>
      <Show when={filteredChildren().length >= 5 || searchQuery().trim()}>
        <SearchBar
          handleChange={(value) => {
            setSearchQuery(value);
          }}
          placeholder="Search Component..."
          ref={(el) => props.onDoubleClick && setTimeout(() => el?.focus(), 0)}
          value={searchQuery()}
        />
      </Show>
      <As as="div" css={STYLES.overflowCss}>
        <Show
          fallback={<LoaderNew loaderHeight="55vh" />}
          when={!isFetchingData()}
        >
          <For
            each={filteredChildren()}
            //             fallback={
            //               <As
            //                 as="div"
            //                 css={`return \`._id {
            //   margin: 20px 0px;
            //   padding: 3px;
            //   text-align: center;
            // }\`;`}
            //               >
            //                 No Component Found!
            //               </As>
            //             }
          >
            {(item) => (
              <As
                as="div"
                css={`return \`._id {
  font-weight: 600;
  margin: 8px 0px;
}\`;`}
              >
                <ComponentItem
                  child={item}
                  edgeName={props.edgeName}
                  expandedKeys={expandedKeys}
                  onDoubleClick={props.onDoubleClick}
                  previewPageId={previewPageId()}
                  setPreviewPageId={setPreviewPageId}
                  toggleExpand={toggleExpand}
                />
              </As>
            )}
          </For>
        </Show>
      </As>
    </>
  );
}
