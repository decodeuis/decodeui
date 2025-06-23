import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";

interface PasteButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function PasteButton(props: Readonly<PasteButtonProps>) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const layoutStoreId = useDesignerLayoutStore();
  const layoutVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const copiedItem = () => layoutVertex().P.copiedItem;

  // Function to process clipboard data containing a graph
  const processClipboardGraph = async (targetItem: Vertex) => {
    try {
      // Read from clipboard
      const clipboardText = await navigator.clipboard.readText();
      let clipboardData: GraphInterface;

      try {
        // Parse the JSON
        clipboardData = JSON.parse(clipboardText);
      } catch (error) {
        console.error("Failed to parse clipboard data as JSON:", error);
        return;
      }

      // Verify this is a valid graph structure
      if (!(clipboardData.vertexes && clipboardData.edges)) {
        console.error("Invalid graph structure in clipboard");
        return;
      }

      // Import the graph structure
      const { metaTxnId, rootVertexIds } = importGraphStructure(
        clipboardData,
        graph,
        setGraph,
      );

      // If we found root vertices, use the first one for cloning
      if (rootVertexIds.length > 0) {
        const rootVertex = graph.vertexes[rootVertexIds[0]];
        if (rootVertex) {
          // Use cloneLayoutAndChildren with the new root vertex
          cloneLayoutAndChildren(
            rootVertex,
            targetItem,
            undefined,
            formStoreVertex()?.P.txnId,
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId] || undefined,
          );
        }
      }

      // Revert the temporary transaction after cloning is complete
      revertTransaction(metaTxnId, graph, setGraph);
    } catch (error) {
      console.error("Error processing clipboard graph:", error);
    }
  };

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
      icon="ph:clipboard"
      onClick={(e) => {
        e.stopPropagation();

        if (e.ctrlKey || e.metaKey) {
          // Cmd/Ctrl+Click - Process clipboard graph
          processClipboardGraph(props.item);
        } else if (copiedItem()) {
          // Regular click - Clone the copied item as a child of the current item
          cloneLayoutAndChildren(
            copiedItem()!,
            props.item,
            undefined,
            formStoreVertex()?.P.txnId,
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId] || undefined,
          );
        }
      }}
      size={props.size}
      title="Paste (Ctrl+Click to paste from clipboard)"
    />
  );
}
