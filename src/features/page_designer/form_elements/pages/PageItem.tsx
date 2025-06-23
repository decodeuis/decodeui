import { toTitle } from "case-switcher-js";
import { createSignal, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { onClickAddComponent } from "~/features/page_designer/functions/component/onClickAddComponent";

import type { NavItem } from "../functions/getTreeData";
import {
  baseItemStyle,
  buttonStyle,
  createOpenInNewTab,
} from "../common/ItemStyles";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { Icon } from "@iconify-icon/solid";
import { ComponentPreview } from "../components/ComponentPreview";

export function PageItem(
  props: Readonly<{
    child: NavItem;
    previewPageId: Id | null;
    setPreviewPageId: (id: Id | null) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPreviewOpen, setIsPreviewOpen] = createSignal(false);
  const [isMouseOverItem, setIsMouseOverItem] = createSignal(false);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  const formStoreVertex = () => {
    const formId = layoutStoreVertex()?.P.formId;
    return formId
      ? (graph.vertexes[formId] as Vertex<FormStoreObject>)
      : undefined;
  };

  const handleItemMouseEnter = () => {
    setIsHovered(true);
    setIsMouseOverItem(true);
  };

  const handleItemMouseLeave = () => {
    setIsMouseOverItem(false);
    // Only change hover state if preview is not open
    if (!isPreviewOpen()) {
      setIsHovered(false);
    }
  };

  const handlePreviewOpen = () => {
    setIsPreviewOpen(true);
    // Ensure item stays in hovered state
    setIsHovered(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);

    // Only reset hover state if mouse is not over the item
    if (!isMouseOverItem()) {
      setIsHovered(false);
    }
  };

  // Get item style
  const getItemStyle = () => {
    return baseItemStyle;
  };

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [],
    });
    const dataTransfer =
      selectedComponents().size > 0
        ? Array.from(selectedComponents())
        : [graph.vertexes[props.child.id]];

    // Safely access draggedVertexIds
    const currentDraggedIds = layoutStoreVertex()?.P.draggedVertexIds || [];

    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [
        ...currentDraggedIds,
        ...dataTransfer.map((v) => v.id),
      ],
    });
    setSelectedComponents(new Set<Vertex>());
  };

  const handleDoubleClick = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [props.child.id],
    });

    const formStore = formStoreVertex();
    if (!formStore) {
      return;
    }

    // Safe access to properties
    const draggedVertex = layoutStoreVertex()?.P.draggedVertexIds?.[0];
    if (!draggedVertex) {
      return;
    }

    onClickAddComponent(
      graph,
      setGraph,
      formStore.P.txnId,
      graph.vertexes[draggedVertex],
      graph.vertexes[formStore.P.formDataId],
      formStore.P.selectedId !== -1
        ? formStore.P.selectedId
        : formStore.P.formDataId,
    );
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [],
    });
  };

  // Use shared function to create open in new tab handler
  const openInNewInternalTabClick = createOpenInNewTab(
    layoutStoreId,
    graph.vertexes[props.child.id],
    graph,
    setGraph,
  );

  // Should show buttons if item is hovered or preview is open
  const shouldShowButtons = () => isHovered() || isPreviewOpen();

  return (
    <Show when={props.child.key}>
      <As
        as="div"
        css={getItemStyle()}
        draggable={"true"}
        ondblclick={handleDoubleClick}
        onDragStart={handleDragStart}
        onMouseEnter={handleItemMouseEnter}
        onMouseLeave={handleItemMouseLeave}
      >
        <Show when={props.child.P.icon}>
          <Icon height={20} icon={props.child.P.icon} noobserver width={20} />
        </Show>
        <As as="div" css={`return \`._id {font-size: 14px;}\`;`}>
          {toTitle(props.child.key)}
        </As>
        <Show when={shouldShowButtons()}>
          <As
            as="div"
            css={`return \`._id {margin-left: auto; display: flex;}\`;`}
          >
            <ComponentPreview
              item={props.child}
              onPreviewOpen={handlePreviewOpen}
              onPreviewClose={handlePreviewClose}
            />
            <IconButton
              css={buttonStyle}
              icon="ph:arrow-square-out"
              onClick={openInNewInternalTabClick}
              size={18}
              title="Open in new tab"
            />
          </As>
        </Show>
      </As>
    </Show>
  );
}
