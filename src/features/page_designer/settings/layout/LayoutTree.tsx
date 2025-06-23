import { createSignal, For, Show, onCleanup } from "solid-js";
import { createStore, reconcile, type SetStoreFunction } from "solid-js/store";
import { Icon } from "@iconify-icon/solid";
import { debounce } from "@solid-primitives/scheduled";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { As } from "~/components/As";
import { evalExpression } from "~/lib/expression_eval";
import { undo, undoAllowed } from "~/lib/graph/transaction/history/undo";
import { redo, redoAllowed } from "~/lib/graph/transaction/history/redo";
import { useToast } from "~/components/styled/modal/Toast";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { addComponentAttrInPage } from "~/features/page_designer/functions/drag_drop/attributes/addComponentAttrInForm";
import { saveAndCaptureForm } from "~/features/page_designer/utils/saveAndCapture";
import { deleteLayoutAttr } from "~/features/page_designer/functions/layout/deleteLayoutAttr";
import { SearchBar } from "~/components/styled/SearchBar";

import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "../../context/LayoutContext";
import { LayoutTreeItem } from "./LayoutTreeItem";
import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { toggleHidden } from "./HideShowIcon";
import { sortChildren } from "../../functions/drag_drop/hierachy/sortChildren";
import { useNavigate } from "@solidjs/router";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { Breadcrumbs } from "./Breadcrumbs";

// ---- Utility Functions ----

/**
 * Filter tree items based on search query
 * @param vertex The vertex to check
 * @param query The search query string
 * @param graph The current graph
 * @param setGraph The graph setter function
 * @returns Object containing match results
 */
function filterTreeVertex(
  vertex: Vertex,
  query: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): { match: boolean; matchedChildren: boolean } {
  if (!query.trim()) {
    return { match: true, matchedChildren: false };
  }

  const queryLower = query.toLowerCase();

  // Early termination check for direct match - check most common properties first
  const vertexKey = String(vertex.P?.key || "").toLowerCase();
  if (vertexKey.includes(queryLower)) {
    return { match: true, matchedChildren: false };
  }

  const vertexLayerName = String(vertex.P?.layerName || "").toLowerCase();
  if (vertexLayerName.includes(queryLower)) {
    return { match: true, matchedChildren: false };
  }

  const vertexText = String(vertex.P?.text || "").toLowerCase();
  if (vertexText.includes(queryLower)) {
    return { match: true, matchedChildren: false };
  }

  const vertexAs = String(vertex.P?.as || "").toLowerCase();
  if (vertexAs.includes(queryLower)) {
    return { match: true, matchedChildren: false };
  }

  // Get children once instead of repeatedly
  const children = getChildrenAttrs(graph, setGraph, vertex);

  // Early return if no children
  if (children.length === 0) {
    return { match: false, matchedChildren: false };
  }

  // Use some() to short-circuit evaluation once a match is found
  const hasMatchingChild = children.some((child) => {
    // Ensure we're getting a proper result object, not an Element
    const childResult = filterTreeVertex(child, queryLower, graph, setGraph);
    if (typeof childResult !== "object" || childResult === null) {
      return false;
    }
    return childResult.match || childResult.matchedChildren;
  });

  return { match: false, matchedChildren: hasMatchingChild };
}

/**
 * Check if a vertex should be expanded during search
 * @param vertex The vertex to check
 * @param query The search query string
 * @param collapsedKeys Array of collapsed keys
 * @param graph The current graph
 * @param setGraph The graph setter function
 * @returns Whether the vertex should be expanded
 */
function shouldExpandVertexForSearch(
  vertex: Vertex,
  query: string,
  collapsedKeys: Id[],
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): boolean {
  if (!query.trim()) {
    return !collapsedKeys.includes(vertex.id);
  }

  const result = filterTreeVertex(vertex, query, graph, setGraph);
  // Only expand if necessary
  if (result.matchedChildren) {
    return true;
  }

  // Fall back to normal collapsed state
  return !collapsedKeys.includes(vertex.id);
}

/**
 * Filter the root vertices based on search query
 * @param roots Array of root vertices
 * @param query The search query string
 * @param graph The current graph
 * @param setGraph The graph setter function
 * @returns Filtered array of vertices
 */
function filterRootVertices(
  roots: Vertex[],
  query: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): Vertex[] {
  const queryTrim = query.trim();

  if (!queryTrim) {
    return roots;
  }

  // Only process if we have search query and roots
  if (roots.length === 0) {
    return [];
  }

  return roots.filter((vertex) => {
    const result = filterTreeVertex(vertex, queryTrim, graph, setGraph);
    return result.match || result.matchedChildren;
  });
}

// ---- Component ----

export function LayoutTree() {
  const [graph, setGraph] = useGraph();
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);
  const [treeRef, setTreeRef] = createSignal<HTMLElement>();
  const [jsonEditorOpenItems, setJsonEditorOpenItems] = createStore<
    Record<Id, boolean>
  >({});
  const [searchQuery, setSearchQuery] = createSignal("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = createSignal("");
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const navigate = useNavigate();

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();

  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }

  const rootVertexes = () => {
    return formStoreVertex()?.P.formDataId
      ? graph.vertexes[formStoreVertex()?.P.formDataId]
        ? [graph.vertexes[formStoreVertex()?.P.formDataId]]
        : []
      : [];
  };

  const toggleAllJsonEditors = () => {
    // Toggle the global setting
    const newGlobalSetting = !(
      formStoreVertex()?.P.showAllJsonEditors ?? false
    );

    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      showAllJsonEditors: newGlobalSetting,
    });

    // Reset all individual item settings to ensure global setting is applied uniformly
    setJsonEditorOpenItems(reconcile({}));
  };

  // Function to toggle JSON editor for a specific item
  const toggleJsonEditorForItem = (itemId: Id) => {
    // Get the current global setting
    const globalSetting = formStoreVertex()?.P.showAllJsonEditors ?? false;

    // Get the current item-specific setting, defaulting to the global setting if not set
    const currentItemSetting =
      itemId in jsonEditorOpenItems
        ? jsonEditorOpenItems[itemId as string]
        : globalSetting;

    // Toggle this specific item's setting
    setJsonEditorOpenItems(itemId as string, !currentItemSetting);
  };

  // Function to check if JSON editor is open for a specific item
  const isJsonEditorOpen = (itemId: Id) => {
    // If we have an explicit setting for this item, use it
    if (itemId in jsonEditorOpenItems) {
      return jsonEditorOpenItems[itemId as string];
    }

    // Otherwise use the global setting
    return formStoreVertex()?.P.showAllJsonEditors ?? false;
  };

  // Focus the currently selected item
  const focusSelectedItem = () => {
    const currentSelectedId = formStoreVertex()?.P.selectedId;
    if (!currentSelectedId) {
      return;
    }

    const treeElement = treeRef();
    if (!treeElement) {
      return;
    }

    // Short delay to ensure the DOM has updated
    setTimeout(() => {
      const selectedElement = treeElement.querySelector(
        `[data-item-id="${currentSelectedId}"]`,
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.focus();
      }
    }, 10);
  };

  // Save function from SaveIconButton
  const handleSaveForm = async () => {
    // Unfocus (blur) any active text input before saving
    if (
      document.activeElement instanceof HTMLElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA")
    ) {
      document.activeElement.blur();
    }

    const isMainForm = layoutStoreVertex().P.mainFormId === formStoreId;
    return await saveAndCaptureForm(
      formStoreVertex,
      graph,
      setGraph,
      showErrorToast,
      showLoadingToast,
      showWarningToast,
      navigate,
      isMainForm,
    );
  };

  // Check if save is disabled
  const isSaveDisabled = () => {
    const txnId = formStoreVertex()?.P.txnId;
    return !!txnId && isDisabledTxn(txnId, graph);
  };

  // Function to add an HTML component at a specific dragPosition relative to selected item
  const addHtmlComponent = (dragPosition: "center" | "before" | "after") => {
    // Get the currently selected component
    const currentSelectedId = formStoreVertex()?.P.selectedId;
    if (!currentSelectedId) {
      return;
    }

    const selectedVertex = graph.vertexes[currentSelectedId];
    if (!selectedVertex) {
      return;
    }

    // Get form data and transaction ID
    const formDataId = formStoreVertex()?.P.formDataId;
    if (!formDataId) {
      return;
    }

    const txnId = formStoreVertex()?.P.txnId || 0;
    const formDataVertex = graph.vertexes[formDataId];
    const formVertex = rootVertexes()[0];

    if (!(formDataVertex && formVertex)) {
      return;
    }

    // Default HTML component properties - a simple div with padding
    const htmlProps = {
      as: "div",
      css: `return \`._id {
        padding: 10px;
      }\`;`,
    };

    let parentVertex: Vertex;
    let targetVertex: Vertex | undefined = selectedVertex;

    // Determine where to add the component based on dragPosition
    if (dragPosition === "center") {
      // Adding as a child - use selected vertex as parent
      parentVertex = selectedVertex;
      targetVertex = undefined; // Don't need target when adding as child
    } else {
      // For before/after - find the parent of selected vertex
      const parentElements =
        evalExpression("<-Attr", {
          graph,
          vertexes: [selectedVertex],
        }) || [];

      parentVertex =
        parentElements.length > 0
          ? parentElements[0] // Use parent if found
          : formDataVertex; // Fall back to root if no parent
    }

    // Add the HTML component
    const newComponentId = addComponentAttrInPage(
      formVertex, // Form vertex
      parentVertex, // Parent to add to
      txnId, // Transaction ID
      graph, // Graph
      setGraph, // Graph setter
      "Html", // Component type
      htmlProps, // Component properties
      dragPosition !== "center" ? targetVertex : undefined, // Target vertex
      dragPosition, // Position
    );

    if (newComponentId === -1) {
      return;
    }

    // Sort children for before/after positions to ensure correct order
    if (dragPosition !== "center") {
      const newComponentVertex = {
        id: newComponentId,
        IN: {},
        L: ["Comp"],
        OUT: {},
        P: { key: "Html" },
      } as Vertex;

      sortChildren(
        graph,
        setGraph,
        txnId,
        newComponentVertex,
        parentVertex,
        targetVertex,
        dragPosition,
      );
    }

    // Select the newly created component
    onLayoutItemClick(
      layoutStoreVertex(),
      formStoreVertex(),
      newComponentId,
      graph,
      setGraph,
    );

    // Focus the newly created item
    setTimeout(focusSelectedItem, 20);
  };

  // Handle keyboard navigation with DOM-based approach
  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip handling if the tree element doesn't have focus
    const treeElement = treeRef();

    // First check for shortcuts from other components
    // ----------------------------------------------

    // Add HTML components with shortcuts
    // Cmd+C - Add HTML component center
    if ((e.metaKey || e.ctrlKey) && e.key === "k" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      addHtmlComponent("center");
      return;
    }

    // Cmd+B - Add HTML component before
    if ((e.metaKey || e.ctrlKey) && e.key === "j" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      addHtmlComponent("before");
      return;
    }

    // Cmd+A - Add HTML component after
    if ((e.metaKey || e.ctrlKey) && e.key === "l" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      addHtmlComponent("after");
      return;
    }

    // Delete - Delete/Backspace key
    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "Delete" || e.key === "Backspace" || e.key === "d")
    ) {
      e.preventDefault();
      const currentSelectedId = formStoreVertex()?.P.selectedId;
      if (!currentSelectedId) {
        return;
      }

      const selectedVertex = graph.vertexes[currentSelectedId];
      if (!selectedVertex) {
        return;
      }

      // Get component name for the toast message
      const componentName = selectedVertex.P?.key || "Html";

      // Import the deleteLayoutAttr functionality from DeleteButton
      const { showSuccessToast } = useToast();
      deleteLayoutAttr(
        formStoreVertex(),
        selectedVertex,
        graph,
        setGraph,
        formStoreVertex()?.P.txnId,
        componentName,
        showSuccessToast,
        layoutStoreId,
      );
      return;
    }

    // Undo - Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      const formTxnId = formStoreVertex()?.P.txnId;
      if (formTxnId && undoAllowed(formTxnId, graph)) {
        undo(formTxnId, graph, setGraph);
      }
      return;
    }

    // Redo - Ctrl+Y or Ctrl+Shift+Z
    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
    ) {
      e.preventDefault();
      const formTxnId = formStoreVertex()?.P.txnId;
      if (formTxnId && redoAllowed(formTxnId, graph)) {
        redo(formTxnId, graph, setGraph);
      }
      return;
    }

    // Save - Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault(); // Prevent browser's save dialog
      if (!isSaveDisabled()) {
        handleSaveForm();
      }
      return;
    }

    // Refresh - F5 or Ctrl+R
    // if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
    //   e.preventDefault();
    //   handleRefresh();
    //   return;
    // }

    const currentSelectedId = formStoreVertex()?.P.selectedId;
    if (!currentSelectedId) {
      return;
    }

    // Find all selectable tree items in the DOM
    if (!treeElement) {
      return;
    }

    // Handle backslash key to toggle visibility
    if (e.key === "\\") {
      e.preventDefault();
      const itemId = String(currentSelectedId);
      const vertex = graph.vertexes[itemId];
      if (!vertex) {
        return;
      }

      // Call toggleHidden from HideShowIcon
      toggleHidden(itemId as Id, formStoreId!, graph, setGraph);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "o") {
      e.preventDefault();
      // Get the current item's JSON editor state
      const itemId = String(currentSelectedId);
      const vertex = graph.vertexes[itemId];
      if (!vertex) {
        return;
      }

      // Toggle JSON editor for the selected item
      toggleJsonEditorForItem(itemId as Id);

      // Focus the item after toggling
      focusSelectedItem();
      return;
    }

    const itemElements = treeElement.querySelectorAll("[data-item-id]");
    if (itemElements.length === 0) {
      return;
    }

    // Find the currently selected element
    const currentElementIndex = Array.from(itemElements).findIndex(
      (el) => el.getAttribute("data-item-id") === String(currentSelectedId),
    );

    if (currentElementIndex === -1) {
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      // Vertical navigation
      let newIndex;
      if (e.key === "ArrowUp") {
        // Move to previous visible item
        newIndex =
          currentElementIndex > 0
            ? currentElementIndex - 1
            : itemElements.length - 1;
      } else {
        // Move to next visible item
        newIndex =
          currentElementIndex < itemElements.length - 1
            ? currentElementIndex + 1
            : 0;
      }

      const nextItemId = itemElements[newIndex].getAttribute("data-item-id");
      if (nextItemId) {
        onLayoutItemClick(
          layoutStoreVertex(),
          formStoreVertex(),
          nextItemId,
          graph,
          setGraph,
        );

        // Focus the newly selected item
        focusSelectedItem();
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      // Horizontal navigation - expand/collapse
      const itemId = String(currentSelectedId);

      // Check if the item has children
      const vertex = graph.vertexes[itemId];
      if (!vertex) {
        return;
      }

      const hasChildren = getChildrenAttrs(graph, setGraph, vertex).length > 0;

      if (e.key === "ArrowLeft") {
        const isExpanded = !collapsedKeys().includes(itemId as Id);

        if (isExpanded && hasChildren) {
          // Collapse if expanded
          toggleExpand(itemId as Id);

          // Focus the current item after collapsing
          focusSelectedItem();
        } else {
          // If already collapsed or no children, try to move to parent
          // Use evalExpression directly to get the parent since getChildrenAttrs doesn't support a parent parameter
          const parentElements =
            evalExpression("<-Attr", { graph, vertexes: [vertex] }) || [];

          if (parentElements && parentElements.length > 0) {
            onLayoutItemClick(
              layoutStoreVertex(),
              formStoreVertex(),
              parentElements[0].id,
              graph,
              setGraph,
            );

            // Focus the parent item
            focusSelectedItem();
          } else {
            // Make sure we maintain focus on the current item if there's no parent
            focusSelectedItem();
          }
        }
      } else if (e.key === "ArrowRight" && hasChildren) {
        const isExpanded = !collapsedKeys().includes(itemId as Id);

        if (isExpanded) {
          // If already expanded, move to first child
          const childElements = getChildrenAttrs(graph, setGraph, vertex);

          if (childElements.length > 0) {
            onLayoutItemClick(
              layoutStoreVertex(),
              formStoreVertex(),
              childElements[0].id,
              graph,
              setGraph,
            );

            // Focus the first child
            focusSelectedItem();
          } else {
            // Make sure we maintain focus if something went wrong
            focusSelectedItem();
          }
        } else {
          // Expand if collapsed
          toggleExpand(itemId as Id);

          // Focus the current item after expanding
          focusSelectedItem();
        }
      } else {
        // Just ensure focus is maintained
        focusSelectedItem();
      }
    }
  };

  // Create a debounced function using Solid's primitive
  const debouncedSearch = debounce((value: string) => {
    setDebouncedSearchQuery(value);
  }, 200);

  // Handle search input changes with improved debouncing
  const onSearchChange = (value: string) => {
    setSearchQuery(value); // Update displayed value immediately
    debouncedSearch(value); // Use the Solid primitive for debounced updates
  };

  // Clean up the debounce on component cleanup
  onCleanup(() => {
    debouncedSearch.clear();
  });

  // Use the refactored utility functions
  const filterTree = (vertex: Vertex) => {
    return filterTreeVertex(vertex, debouncedSearchQuery(), graph, setGraph);
  };

  const shouldExpandForSearch = (vertex: Vertex) => {
    return shouldExpandVertexForSearch(
      vertex,
      debouncedSearchQuery(),
      collapsedKeys(),
      graph,
      setGraph,
    );
  };

  const filteredRootVertexes = () => {
    return filterRootVertices(
      rootVertexes(),
      debouncedSearchQuery(),
      graph,
      setGraph,
    );
  };

  return (
    <As
      as="div"
      css={`return \`._id {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }\`;`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid \${args.theme.var.color.border};
          gap: 8px;
          position: sticky;
          top: 0;
          background-color: \${args.theme.var.color.background};
        }\`;`}
      >
        <As
          as="h3"
          css={`return \`._id {
            color: \${args.theme.var.color.text};
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }\`;`}
        >
          <Icon icon="tabler:layout-2" />
          Layers
        </As>

        <IconButton
          onClick={toggleAllJsonEditors}
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            `return \`._id {
              ${formStoreVertex()?.P.showAllJsonEditors ? "color: ${args.theme.var.color.primary};" : ""}
              background-color: transparent;
              border: none;
        }\`;`,
          ]}
          icon="tabler:json"
          size={18}
        />
      </As>

      <As as="div">
        <SearchBar
          handleChange={onSearchChange}
          placeholder="Search layers..."
          value={searchQuery()}
        />
      </As>

      <Breadcrumbs
        selectedVertex={
          formStoreVertex()?.P.selectedId
            ? graph.vertexes[formStoreVertex()?.P.selectedId]
            : undefined
        }
      />

      <As
        as="div"
        css={`return \`._id {
          padding: 0;
          margin: 0;
          overflow-y: auto;
          flex: 1;
          scroll-behavior: smooth;
        }\`;`}
        class="layouttree"
        ref={setTreeRef}
      >
        <Show when={formStoreVertex()}>
          <For each={filteredRootVertexes()}>
            {(vertex) => (
              <LayoutTreeItem
                collapsedKeys={collapsedKeys}
                metaVertex={vertex}
                toggleExpand={toggleExpand}
                parentIndex={0}
                isJsonEditorOpen={isJsonEditorOpen}
                toggleJsonEditorForItem={toggleJsonEditorForItem}
                filterTree={filterTree}
                shouldExpandForSearch={shouldExpandForSearch}
                searchActive={!!debouncedSearchQuery().trim()}
              />
            )}
          </For>
        </Show>
      </As>
    </As>
  );
}
