import { Icon } from "@iconify-icon/solid";
import { createMemo, createSignal, For, Show } from "solid-js";

import { componentsMap } from "~/components/form/functions/componentsMap";
import { IconButton } from "~/components/styled/IconButton";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { iconMap } from "~/lib/ui/iconMap";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { resetDragDropState } from "../../event_handler/resetDragDropState";
// import { OpenComponentSettings } from "../../OpenComponentSettings";
import { TreeItemExpandButton } from "../../settings/layout/TreeItemExpandButton";
import { getCompChildren } from "./functions/getCompChildren";
import { onCompDragStart } from "./functions/onCompDragStart";
import { As } from "~/components/As";
import {
  baseItemStyle,
  buttonStyle,
  createOpenInNewTab,
} from "../common/ItemStyles";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { ComponentPreview } from "./ComponentPreview";

export function ComponentItem(
  props: Readonly<{
    child: Vertex;
    edgeName: string;
    expandedKeys: string[];
    onDoubleClick?: (fromVertex: Vertex) => void;
    previewPageId: Id | null;
    setPreviewPageId: (id: Id | null) => void;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPreviewOpen, setIsPreviewOpen] = createSignal(false);
  const [isMouseOverItem, setIsMouseOverItem] = createSignal(false);
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

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
  /* Preview logic
    When the mouse enters the item, we set isHovered to true
    When the mouse enters the eye button, we start a timer to show the preview
    When the preview shows, isPreviewOpen is set to true
    As long as either isHovered or isPreviewOpen is true, the buttons remain visible
    When the preview closes, we use a short timeout to reset the hover state if needed
  */
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

  const getItemStyle = () => {
    const backgroundColor = isNegative(props.child.id)
      ? `\${args.theme.var.color.success_light_600}`
      : `\${args.theme.var.color.background_light_50}`;
    const textColor = isNegative(props.child.id)
      ? `\${args.theme.var.color.success_light_600_text}`
      : `\${args.theme.var.color.background_light_50_text}`;
    return [
      baseItemStyle,
      `return \`._id {
        background-color: ${backgroundColor};
        color: ${textColor};
      }\`;`,
    ];
  };

  const onDragEnd = () => {
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };

  const children = createMemo(() =>
    getCompChildren([props.child], props.edgeName, graph),
  );

  // Use shared function to create open in new tab handler
  const openInNewTab = createOpenInNewTab(
    layoutStoreId,
    props.child,
    graph,
    setGraph,
  );

  // Get display name for the component
  const getDisplayName = () => {
    const rawName = props.child?.P.label || props.child?.P.key;
    return rawName ? rawName : "";
  };

  // Should show buttons if item is hovered or preview is open
  const shouldShowButtons = () => isHovered() || isPreviewOpen();

  return (
    <>
      <As
        as="div"
        css={getItemStyle()}
        draggable={"true"}
        onClick={() => props.toggleExpand(props.child.id)}
        onDblClick={() => props.onDoubleClick?.(props.child)}
        onDragEnd={onDragEnd}
        onDragStart={(e) => {
          return onCompDragStart(
            e,
            graph,
            setGraph,
            props.child.id,
            layoutStoreVertex(),
            selectedComponents,
            setSelectedComponents,
          );
        }}
        onMouseEnter={handleItemMouseEnter}
        onMouseLeave={handleItemMouseLeave}
      >
        <Show when={children().length > 0}>
          <TreeItemExpandButton
            hasChildren={!!children().length}
            isCollapsed={!props.expandedKeys.includes(props.child.id)}
            metaVertexId={props.child.id}
            toggleExpand={props.toggleExpand}
          />
        </Show>

        <Show when={props.child.P.icon || props.child.L[0] !== "Component"}>
          <Icon
            height={22}
            icon={
              props.child.P.icon ||
              iconMap[props.child?.P.key as keyof typeof iconMap] ||
              "ph:cube-duotone"
            }
            noobserver
            width={22}
          />
        </Show>

        <As
          as="div"
          css={`return \`._id {
            font-size: 14px;
            font-weight: normal;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            ${props.child?.L[0] === "Comp" && !componentsMap[props.child?.P.key] ? "color: ${args.theme.var.color.error};" : ""}
          }\`;`}
        >
          {getDisplayName()}
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
              onClick={openInNewTab}
              size={18}
              title="Open in new tab"
            />
          </As>
        </Show>
      </As>

      {/* Render children */}
      <Show
        when={
          children().length > 0 && props.expandedKeys.includes(props.child.id)
        }
      >
        <As
          as="ul"
          css={`return \`._id {
            padding-left: 20px;
            padding-top: 5px;
            list-style: none;
          }\`;`}
        >
          <For each={children()}>
            {(child) => (
              <ComponentItem
                child={child}
                edgeName={props.edgeName}
                expandedKeys={props.expandedKeys}
                onDoubleClick={props.onDoubleClick}
                previewPageId={props.previewPageId}
                setPreviewPageId={props.setPreviewPageId}
                toggleExpand={props.toggleExpand}
              />
            )}
          </For>
        </As>
      </Show>
    </>
  );
}
