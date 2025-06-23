import {
  type Accessor,
  createMemo,
  createSelector,
  createSignal,
  For,
  Show,
  createEffect,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import { componentsMap } from "~/components/form/functions/componentsMap";

import { useToast } from "~/components/styled/modal/Toast";
import { generateBoxShadow } from "~/lib/css/generateBoxShadow";
import { handleDragStart } from "~/features/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { getDnDBoxShadowArgs } from "~/features/page_designer/functions/drag_drop/ui/getDnDBoxShadowArgs";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import {
  createOpenInNewTab,
  buttonStyle,
} from "../../form_elements/common/ItemStyles";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { handleDragOver } from "../../event_handler/handleDragOver";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { AttrConfigIcons } from "./AttrConfigIcons";
import { HideShowIcon } from "./HideShowIcon";
import { TreeItemContainer } from "./TreeItemContainer";
import { TreeItemContent } from "./TreeItemContent";
import { As } from "~/components/As";
import { JsonEditorFieldComponent } from "../properties/JsonEditorField";
import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { getTreeItemBorder } from "./treeUtils";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export function LayoutTreeItem(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
    parentIndex: number; // Parent index for determining test ID
    isJsonEditorOpen?: (itemId: Id) => boolean;
    toggleJsonEditorForItem?: (itemId: Id) => void;
    filterTree?: (vertex: Vertex) => {
      match: boolean;
      matchedChildren: boolean;
    };
    shouldExpandForSearch?: (vertex: Vertex) => boolean;
    searchActive?: boolean;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const { showErrorToast } = useToast();
  const activeItemChanged = createSelector(
    () => layoutStoreVertex()?.P.activeItem,
  );
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);

  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );
  const [parentRef, setParentRef] = createSignal<HTMLElement>();

  // Determine if this item should be shown based on search - optimized
  const shouldShowItem = createMemo(() => {
    // Always show if no search is active
    if (!(props.searchActive && props.filterTree)) {
      return true;
    }

    // Only call filterTree once and reuse result
    const filterResult = props.filterTree(props.metaVertex);
    return filterResult.match || filterResult.matchedChildren;
  });

  // Determine if this item is directly matched by the search - optimized
  const isDirectMatch = createMemo(() => {
    if (!(props.searchActive && props.filterTree)) {
      return false;
    }

    // Direct check for match without extra processing
    return props.filterTree(props.metaVertex).match;
  });

  // Add auto-scroll effect when item is selected
  createEffect(() => {
    if (isSelectedLayoutId(props.metaVertex.id) && parentRef()) {
      // Use a small timeout to ensure the DOM is fully updated
      setTimeout(() => {
        parentRef()?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    }
  });

  let startTime = 0;

  // debounce is giving error, node not found
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      props.metaVertex,
      false,
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId] || null,
      (dragPosition) => {
        if (dragPosition === "center" && Date.now() - startTime > 1000) {
          if (props.collapsedKeys().includes(props.metaVertex.id)) {
            props.toggleExpand(props.metaVertex.id);
          }
        }
      },
    );
  };

  const handleDragLeave = () => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      {
        activeItem: null,
        dragPosition: null,
      },
    );
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      graph,
      setGraph,
      showErrorToast,
    );
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };

  const handleClick = () => {
    onLayoutItemClick(
      layoutStoreVertex(),
      formStoreVertex(),
      props.metaVertex.id,
      graph,
      setGraph,
    );
  };

  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hoverId: props.metaVertex.id,
    });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hoverId: -1,
    });
  };

  const isAfter = createMemo(
    () =>
      isActiveTargetItem() && layoutStoreVertex()?.P.dragPosition === "after",
  );

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (isActiveTargetItem()) {
      if (layoutStoreVertex()?.P.dragPosition !== "after") {
        const boxShadowProps = getDnDBoxShadowArgs(
          layoutStoreVertex()?.P.dragPosition,
          "${args.theme.var.color.success}",
        );
        boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])};`;
      }
    }

    if (isSelectedLayoutId(props.metaVertex.id)) {
      boxShadow += ` background-color:\${args.theme.var.color.primary_light_300}; color:\${args.theme.var.color.primary_light_300_text};`;
    } else if (isSelectedHoverId(props.metaVertex.id)) {
      boxShadow += ` background-color:\${args.theme.var.color.primary_light_750}; color:\${args.theme.var.color.primary_light_750_text};`;
    }

    return boxShadow;
  });

  const replacePropertiesValue = (properties: { [key: string]: unknown }) => {
    replaceVertexProperties(
      formStoreVertex()?.P.txnId,
      props.metaVertex.id,
      graph,
      setGraph,
      properties,
    );
    saveUndoPoint(formStoreVertex()?.P.txnId, graph, setGraph);
  };

  const getCopmVertex = () =>
    props.metaVertex.P.componentName
      ? findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          props.metaVertex.P.componentName,
        )
      : undefined;

  // Create open in new tab handler
  const openInNewTab = createOpenInNewTab(
    layoutStoreId,
    getCopmVertex(),
    graph,
    setGraph,
  );
  /*
  // Generate a test ID for the layer based on the hierarchy
  const getLayerTestId = () => {
    try {
      // Start with the current vertex
      const currentVertex = props.metaVertex;
      const path = [];
      
      // Get the current vertex's index among its siblings
      const parentElements = evalExpression("<-Attr", {
        graph, 
        setGraph, 
        vertexes: [currentVertex]
      }) as Vertex[] || [];
      
      const childrenAtSameLevel = parentElements.length 
        ? getChildrenAttrs(graph, setGraph, parentElements[0])
        : getChildrenAttrs(graph, setGraph, graph.vertexes[formStoreVertex()?.P.formDataId] || null);
          
      const currentIndex = childrenAtSameLevel.findIndex(c => c.id === currentVertex.id);
      
      // Add current index to the path
      path.unshift(currentIndex >= 0 ? currentIndex : 0);
      
      // Traverse up the tree to build the full path
      let parent = parentElements[0];
      while (parent) {
        const grandParentElements = evalExpression("<-Attr", {
          graph,
          setGraph,
          vertexes: [parent]
        }) as Vertex[] || [];
        
        if (!grandParentElements.length) {
          // We've reached the root level
          path.unshift(0);
          break;
        }
        
        const parentsChildren = getChildrenAttrs(graph, setGraph, grandParentElements[0]);
        const parentIndex = parentsChildren.findIndex(c => c.id === parent.id);
        
        // Add parent's index to the beginning of the path
        path.unshift(parentIndex >= 0 ? parentIndex : 0);
        
        // Move up to the next level
        parent = grandParentElements[0];
      }
      
      // Generate the test ID using the path
      return `l-${path.join('-')}`;
    } catch (error) {
      // Fallback ID if the hierarchy can't be determined
      console.error("Error generating layer test ID:", error);
      return `l-${props.metaVertex.id}`;
    }
  };
  */

  // Function to get JSON editor state for this item
  const showJsonEditor = () => {
    return props.isJsonEditorOpen
      ? props.isJsonEditorOpen(props.metaVertex.id)
      : false;
  };

  // Function to toggle JSON editor for this item
  const toggleJsonEditor = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.toggleJsonEditorForItem) {
      props.toggleJsonEditorForItem(props.metaVertex.id);
    }
  };

  // Check if the item is in the hidden nodes list
  const isNodeHidden = () =>
    (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id);

  // Check if the item should be expanded
  const isExpanded = createMemo(() => {
    if (props.shouldExpandForSearch) {
      return props.shouldExpandForSearch(props.metaVertex);
    }
    return !props.collapsedKeys().includes(props.metaVertex.id);
  });

  // Add search highlight styles
  const getHighlightStyle = createMemo(() => {
    if (isDirectMatch()) {
      return `return \`._id {
        font-weight: bold;
        background-color: \${args.theme.var.color.primary_light_100};
      }\`;`;
    }
    return "";
  });

  return (
    <Show when={shouldShowItem()}>
      <TreeItemContainer
        css={[`return \`._id { ${getBorder()} }\`;`, getHighlightStyle()]}
        draggable={"true"}
        hasChildren={!!children().length}
        isDragOver={isActiveTargetItem()}
        isHovered={isSelectedHoverId(props.metaVertex.id)}
        isSelected={isSelectedLayoutId(props.metaVertex.id)}
        itemId={props.metaVertex.id}
        onClick={handleClick}
        onDragEnter={(e) => {
          startTime = Date.now();
          handleDragOverEvent(e);
        }}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverEvent}
        onDragStart={(e) =>
          handleDragStart(
            e,
            graph,
            setGraph,
            layoutStoreVertex(),
            props.metaVertex,
          )
        }
        onDrop={handleDropEvent}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
        ref={(el) => {
          setParentRef(el);
          // @ts-expect-error ignore
          el.useCurrentPosition = true;
        }}
        // data-testid={getLayerTestId()}
        // data-text={props.metaVertex.P.text}
      >
        <TreeItemContent
          collapsedKeys={props.collapsedKeys}
          metaVertex={props.metaVertex}
          toggleExpand={props.toggleExpand}
          parentIndex={props.parentIndex}
          isSelected={isSelectedLayoutId(props.metaVertex.id)}
        />
        <Show when={isSelectedHoverId(props.metaVertex.id) || isNodeHidden()}>
          <HideShowIcon iconSize={20} metaVertex={props.metaVertex} />
        </Show>
        <Show when={isSelectedHoverId(props.metaVertex.id) || showJsonEditor()}>
          <IconButton
            css={[
              ICON_BUTTON_STYLES.baseCss,
              ICON_BUTTON_STYLES.defaultCss,
              ICON_BUTTON_STYLES.spacingCss,
              `return \`._id {
                background-color: transparent;
                border: none;
                ${showJsonEditor() ? "color: ${args.theme.var.color.primary};" : ""}
              }\`;`,
            ]}
            icon="tabler:json"
            size={16}
            onClick={toggleJsonEditor}
            title={showJsonEditor() ? "Hide JSON editor" : "Show JSON editor"}
          />
        </Show>
        <Show
          when={
            isSelectedHoverId(props.metaVertex.id) &&
            props.metaVertex.L &&
            !(props.metaVertex.P.componentName in componentsMap)
          }
        >
          <IconButton
            css={buttonStyle}
            icon="ph:arrow-square-out"
            onClick={(e) => {
              e.stopPropagation();
              openInNewTab();
            }}
            size={18}
            title="Open in new tab"
          />
        </Show>
        {/* <Show when={formStoreVertex()?.P.formDataId !== props.metaVertex.id}> */}
        <AttrConfigIcons
          metaVertex={props.metaVertex}
          parentRef={parentRef()!}
        />
        {/* {getLayerTestId()} */}
        {/* </Show> */}
      </TreeItemContainer>
      <Show when={showJsonEditor()}>
        <As
          as="div"
          css={`return \`._id {
            margin-left: 24px;
            margin-bottom: 8px;
            width: calc(100% - 24px);
            height: auto;
            overflow: visible;
          }\`;`}
        >
          <JsonEditorFieldComponent
            vertexId={props.metaVertex.id}
            hideLabel={true}
            replaceProperties={replacePropertiesValue}
          />
        </As>
      </Show>

      <Show when={isExpanded() && children().length > 0}>
        <As
          as="ul"
          css={`return \`._id {
              padding-left: 6px;
              padding-top: 5px;
              list-style: none;
              border-left: 1px ${getTreeItemBorder(props.parentIndex).style} ${getTreeItemBorder(props.parentIndex).color};
              margin: 0 0 0 4px;
          }\`;`}
        >
          <For each={children()}>
            {(vertex) => (
              <LayoutTreeItem
                collapsedKeys={props.collapsedKeys}
                metaVertex={vertex}
                toggleExpand={props.toggleExpand}
                parentIndex={props.parentIndex + 1}
                isJsonEditorOpen={props.isJsonEditorOpen}
                toggleJsonEditorForItem={props.toggleJsonEditorForItem}
                filterTree={props.filterTree}
                shouldExpandForSearch={props.shouldExpandForSearch}
                searchActive={props.searchActive}
              />
            )}
          </For>
        </As>
      </Show>
      <Show when={isAfter()}>
        <As
          as="div"
          css={`return \`._id {
  border: 1px solid \${args.theme.var.color.primary};
}\`;`}
        />
      </Show>
    </Show>
  );
}
