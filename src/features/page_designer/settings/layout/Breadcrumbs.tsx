import { For, Show, createMemo } from "solid-js";
import { Icon } from "@iconify-icon/solid";

import { As } from "~/components/As";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "../../context/LayoutContext";

interface BreadcrumbsProps {
  selectedVertex: Vertex | undefined;
}

export function Breadcrumbs(props: BreadcrumbsProps) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();

  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  // Build the parent path from the selected vertex up to the root
  const parentPath = createMemo(() => {
    if (!props.selectedVertex) return [];

    const path: Vertex[] = [];
    let currentVertex: Vertex | undefined = props.selectedVertex;

    // Add the selected vertex itself to the path
    path.push(currentVertex);

    // Traverse up the tree to find all parents
    while (currentVertex) {
      const parentElements = evalExpression("<-Attr", {
        graph,
        vertexes: [currentVertex],
      });

      if (parentElements && parentElements.length > 0) {
        currentVertex = parentElements[0];
        path.unshift(currentVertex!); // Add to beginning to maintain root->leaf order
      } else {
        break;
      }
    }

    return path;
  });

  // Get display name for a vertex
  const getVertexName = (vertex: Vertex) => {
    return (
      vertex.P?.layerName ||
      vertex.P?.key ||
      vertex.P?.as ||
      vertex.P?.componentName ||
      "Component"
    );
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (vertex: Vertex) => {
    onLayoutItemClick(
      layoutStoreVertex(),
      formStoreVertex(),
      vertex.id,
      graph,
      setGraph,
    );
  };

  return (
    <Show when={parentPath().length > 0}>
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: \${args.theme.var.color.background_light_50};
          border-bottom: 1px solid \${args.theme.var.color.border};
          gap: 0.25rem;
          min-height: 2rem;
          overflow-x: auto;
          white-space: nowrap;
          
          /* Hide scrollbar for cleaner look */
          scrollbar-width: none;
          -ms-overflow-style: none;
          
          &::-webkit-scrollbar {
            display: none;
          }
        }\`;`}
      >
        <For each={parentPath()}>
          {(vertex, index) => (
            <>
              <Show when={index() > 0}>
                <Icon
                  icon="tabler:chevron-right"
                  css={`return \`._id {
                    color: \${args.theme.var.color.text_light_300};
                    width: 1rem;
                    height: 1rem;
                    flex-shrink: 0;
                  }\`;`}
                />
              </Show>
              <As
                as="button"
                onClick={() => handleBreadcrumbClick(vertex)}
                css={`return \`._id {
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.25rem;
                  font-size: 0.875rem;
                  font-weight: ${
                    index() === parentPath().length - 1 ? "500" : "400"
                  };
                  color: ${
                    index() === parentPath().length - 1
                      ? "${args.theme.var.color.text}"
                      : "${args.theme.var.color.text_light_200}"
                  };
                  background-color: transparent;
                  border: none;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  white-space: nowrap;
                  
                  &:hover {
                    background-color: \${args.theme.var.color.background_light_100};
                    color: \${args.theme.var.color.text};
                  }
                  
                  &:focus-visible {
                    outline: 2px solid \${args.theme.var.color.primary};
                    outline-offset: 2px;
                  }
                }\`;`}
              >
                {getVertexName(vertex)}
              </As>
            </>
          )}
        </For>
      </As>
    </Show>
  );
}
