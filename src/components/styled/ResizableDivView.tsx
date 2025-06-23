import { createEffect, createSignal, type JSX, Show } from "solid-js";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { STYLES } from "~/pages/settings/constants";

import type { FormStoreObject } from "../form/context/FormContext";

import { useToast } from "./modal/Toast";
import { ResizeOverlay } from "./ResizeOverlay";
import { As } from "../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { CssType } from "../form/type/CssType";

export const DIMENSIONS = {
  desktop: {
    height: "1200px",
    icon: "ph:desktop",
    id: "desktop",
    width: "1000px",
  },
  mobile: {
    height: "570px",
    icon: "ph:device-mobile",
    id: "mobile",
    width: "360px",
  },
  tablet: {
    height: "1026px",
    icon: "ph:device-tablet",
    id: "tablet",
    width: "768px",
  },
} as const;

const getResizeHandleCSS = (direction: "horizontal" | "vertical") => {
  const isHorizontal = direction === "horizontal";

  return `return \`._id {
  ${isHorizontal ? "width: 4px;" : "width: 100%;"}
  ${isHorizontal ? "height: 100%;" : "height: 4px;"}
  background-color: \${args.theme.var.color.border};
  cursor: ${isHorizontal ? "col-resize" : "row-resize"};
  position: absolute;
  ${isHorizontal ? "right: 0;" : "bottom: 0;"}
  transition: background-color 0.2s ease;

  &:hover {
    background-color: \${args.theme.var.color.border_dark_200};
  }
}\`;`;
};

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    css?: CssType;
    view: Id;
    width?: string;
    height?: string;
  }>,
) {
  const [width, setWidth] = createSignal(props.width || "");
  const [graph, setGraph] = useGraph();
  const [height, setHeight] = createSignal(props.height || "");
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [resizing, setResizing] = createSignal(false);
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const { showErrorToast } = useToast();

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const viewVertex = () =>
    graph.vertexes[props.view] as Vertex<{
      height: string;
      view: string;
      width: string;
    }>;

  createEffect(() => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      setWidth(view.P.width);
      setHeight(view.P.height);
    } else {
      const dimension =
        DIMENSIONS[view?.P.view?.toLowerCase() as keyof typeof DIMENSIONS] ||
        DIMENSIONS.desktop;
      setWidth(dimension.width);
      setHeight(dimension.height);
    }
  });

  const handlePointerDown = (
    e: PointerEvent,
    direction: "horizontal" | "vertical",
  ) => {
    e.preventDefault();
    const container = containerRef();
    if (!container) {
      return;
    }

    setResizing(true);
    const initialWidth = container.offsetWidth;
    const initialHeight = container.offsetHeight;
    const startX = e.clientX;
    const startY = e.clientY;

    const handlePointerMove = (e: PointerEvent) => {
      if (!resizing()) {
        return;
      }

      if (direction === "horizontal") {
        const newWidthValue = Math.max(50, initialWidth + e.clientX - startX);
        const roundedWidth = Math.round(newWidthValue * 100) / 100;
        const newWidth = `${roundedWidth}px`;
        setWidth(newWidth);
        mergeVertexProperties(0, props.view, graph, setGraph, {
          width: newWidth,
        });
      } else if (direction === "vertical") {
        const newHeightValue = Math.max(50, initialHeight + e.clientY - startY);
        const roundedHeight = Math.round(newHeightValue * 100) / 100;
        const newHeight = `${roundedHeight}px`;
        setHeight(newHeight);
        mergeVertexProperties(0, props.view, graph, setGraph, {
          height: newHeight,
        });
      }
    };

    const handlePointerUp = () => {
      setResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault(); // Allow drop
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDropEvent = async (e: DragEvent) => {
    setIsDraggingOver(false);
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      {
        activeItem: formStoreVertex()?.P.formDataId,
        dragPosition: "center",
      },
    );

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

  return (
    <As
      as="div"
      css={[
        ...ensureArray(props.css),
        STYLES.overflowCss,
        `return \`._id {
  display: grid;
  flex-shrink: 0;
}\`;`,
      ]}
    >
      <As
        as="div"
        css={[
          STYLES.overflowCss,
          `return \`._id {
  position: relative;
  display: flex;
  flex-direction: column;
  border-left: 1px solid \${args.theme.var.color.border};
  border-top: 1px solid \${args.theme.var.color.border};
}\`;`,
          isDraggingOver()
            ? `return \`._id { background-color: \${args.theme.var.color.primary_light_150}; }\`;`
            : "",
          resizing() ? `return \`._id { user-select: none; }\`;` : "",
        ]}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
        ref={setContainerRef}
        style={{
          height: height(),
          width: width(),
        }}
      >
        <As
          as="div"
          css={getResizeHandleCSS("horizontal")}
          onPointerDown={(e) => handlePointerDown(e, "horizontal")}
        />
        {props.children}
        <As
          as="div"
          css={getResizeHandleCSS("vertical")}
          onPointerDown={(e) => handlePointerDown(e, "vertical")}
        />
      </As>

      <Show when={resizing()}>
        <ResizeOverlay />
      </Show>
    </As>
  );
}
