import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { SetStoreFunction } from "solid-js/store";

import { IconButton } from "~/components/styled/IconButton";
import {
  useDesignerLayoutStore,
  useDesignerFormIdContext,
} from "~/features/page_designer/context/LayoutContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { VertexMap } from "~/lib/graph/type/vertexMap";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";

interface CopyButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

// Function to extract a complete subgraph including vertex and all its children
function extractSubgraph(
  vertex: Vertex,
  graph: GraphInterface,
): GraphInterface {
  const vertexes: VertexMap = {};
  const edges: EdgeMap = {};

  // Recursive function to collect vertex and its children
  function collectVertexAndChildren(v: Vertex) {
    // Add current vertex to the subgraph
    vertexes[v.id] = v;

    // Get all children of this vertex
    const children = getChildrenAttrs(
      graph,
      undefined as unknown as SetStoreFunction<GraphInterface>,
      v,
    );

    // Process each child recursively
    for (const child of children) {
      // Add child edges to the subgraph
      // Find edges connecting parent to child
      Object.values(graph.edges).forEach((edge) => {
        if (
          (edge.S === v.id && edge.E === child.id) ||
          (edge.S === child.id && edge.E === v.id)
        ) {
          edges[edge.id] = edge;
        }
      });

      // Process this child recursively
      collectVertexAndChildren(child);
    }
  }

  // Start collection from the given vertex
  collectVertexAndChildren(vertex);

  // Return the extracted subgraph
  return {
    vertexes,
    edges,
    vertexLabelIdMap: {},
    broadcastChannels: [],
  };
}

export function CopyButton(props: Readonly<CopyButtonProps>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      css={[
        ICON_BUTTON_STYLES.baseCss,
        ICON_BUTTON_STYLES.defaultCss,
        ...ensureArray(props.css),
        `return \`._id {
        background-color: transparent;
        border: none;
      }\`;`,
      ]}
      icon="ph:copy-simple"
      onClick={(e) => {
        e.stopPropagation();

        // If ctrl/cmd key is pressed, perform duplicate action
        if (e.ctrlKey || e.metaKey) {
          cloneLayoutAndChildren(
            props.item,
            undefined,
            undefined,
            formStoreVertex()?.P.txnId,
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId || ""] || undefined,
          );
        } else {
          // Regular click - copy to context and clipboard
          mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
            copiedItem: props.item,
          });

          // Extract complete subgraph including the vertex and all its children
          const subgraph = extractSubgraph(props.item, graph);

          // Save the subgraph as JSON to clipboard
          const graphJson = JSON.stringify(subgraph, null, 2);
          navigator.clipboard
            .writeText(graphJson)
            .catch((err) => console.error("Failed to copy to clipboard:", err));
        }
      }}
      size={props.size}
      title="Copy (Ctrl+Click to Duplicate)"
    />
  );
}
